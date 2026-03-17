'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'

type PermState = 'loading' | 'unsupported' | 'denied' | 'off' | 'on'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function NotificationBell() {
  const [state, setState] = useState<PermState>('loading')
  const [loading, setLoading] = useState(false)
  const [tooltip, setTooltip] = useState(false)
  const isIOS = typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      setState('unsupported')
      return
    }
    const perm = Notification.permission
    if (perm === 'denied') { setState('denied'); return }
    const saved = localStorage.getItem('notif_subscribed')
    setState(saved === 'true' ? 'on' : 'off')
  }, [])

  async function subscribe() {
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setState('denied')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!).buffer as ArrayBuffer,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
          },
        }),
      })

      localStorage.setItem('notif_subscribed', 'true')
      setState('on')
    } catch (err) {
      console.error('subscribe error', err)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      localStorage.removeItem('notif_subscribed')
      setState('off')
    } catch (err) {
      console.error('unsubscribe error', err)
    } finally {
      setLoading(false)
    }
  }

  if (state === 'loading' || state === 'unsupported') return null

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => {
          if (isIOS && state === 'off') { setTooltip(p => !p); return }
          if (state === 'on') unsubscribe()
          else subscribe()
        }}
        disabled={loading}
        title={state === 'on' ? 'Matikan notifikasi' : 'Aktifkan notifikasi'}
        style={{
          width: '36px', height: '36px', borderRadius: '10px',
          border: `1px solid ${state === 'on' ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
          background: state === 'on' ? 'rgba(34,197,94,0.08)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: loading ? 'wait' : 'pointer', transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        {state === 'on'
          ? <BellRing style={{ width: '15px', height: '15px', color: '#22C55E' }} />
          : state === 'denied'
          ? <BellOff style={{ width: '15px', height: '15px', color: 'var(--text-dim)' }} />
          : <Bell style={{ width: '15px', height: '15px', color: 'var(--text-secondary)' }} />
        }
      </button>

      {/* iOS tooltip */}
      {tooltip && isIOS && (
        <div
          onClick={() => setTooltip(false)}
          style={{
            position: 'absolute', top: '44px', right: 0, zIndex: 200,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '12px 14px', width: '220px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', lineHeight: 1.5,
          }}
        >
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Notifikasi iOS
          </p>
          Tambah Kariah ke <strong>Home Screen</strong> (Share → Add to Home Screen) untuk aktifkan notifikasi.
        </div>
      )}

      {/* Denied tooltip */}
      {state === 'denied' && (
        <div style={{
          position: 'absolute', top: '44px', right: 0, zIndex: 200,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '10px 12px', width: '200px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
          color: 'var(--text-dim)',
        }}>
          Notifikasi disekat. Benarkan dalam tetapan pelayar.
        </div>
      )}
    </div>
  )
}
