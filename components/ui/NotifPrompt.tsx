'use client'

/**
 * NotifPrompt — auto-shows a notification permission bottom sheet
 * when the app is opened in standalone (installed PWA) mode for the first time.
 *
 * Trigger conditions (ALL must be true):
 *   1. Running as installed PWA (standalone display-mode)
 *   2. Notification permission is 'default' (not yet asked by OS)
 *   3. User hasn't dismissed before, OR last "Nanti" was > 7 days ago
 */

import { useState, useEffect, useRef } from 'react'
import { Bell, BellRing, X } from 'lucide-react'

const STORAGE_KEY = 'kariah_notif_nanti_ts'
const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4)
  const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

function uint8ArrayToBase64(arr: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < arr.byteLength; i++) binary += String.fromCharCode(arr[i])
  return btoa(binary)
}

type Stage = 'hidden' | 'visible' | 'loading' | 'success' | 'denied'

export function NotifPrompt() {
  const [stage, setStage] = useState<Stage>('hidden')
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    // Must be standalone PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true

    if (!standalone) return

    // Push must be supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    // Already granted or denied by OS — don't ask again
    if (Notification.permission !== 'default') return

    // Check if user said "Nanti" recently (within 7 days)
    try {
      const ts = localStorage.getItem(STORAGE_KEY)
      if (ts && Date.now() - Number(ts) < REMIND_AFTER_MS) return
    } catch { /* ignore */ }

    // Show after a 1.5s delay — let splash screen finish first
    const timer = setTimeout(() => {
      if (mounted.current) setStage('visible')
    }, 1500)

    return () => {
      mounted.current = false
      clearTimeout(timer)
    }
  }, [])

  async function handleAllow() {
    setStage('loading')
    setError(null)
    try {
      const perm = await Notification.requestPermission()
      if (!mounted.current) return

      if (perm !== 'granted') {
        setStage('denied')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) await existing.unsubscribe()

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { setStage('denied'); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: uint8ArrayToBase64(new Uint8Array(sub.getKey('p256dh')!)),
            auth:   uint8ArrayToBase64(new Uint8Array(sub.getKey('auth')!)),
          },
        }),
      })

      if (!mounted.current) return

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        await sub.unsubscribe()
        setError(body.error ?? `Ralat ${res.status}`)
        setStage('visible')
        return
      }

      localStorage.setItem('notif_subscribed', 'true')
      setStage('success')

      // Auto-dismiss after 2.5s
      setTimeout(() => { if (mounted.current) setStage('hidden') }, 2500)

    } catch (err) {
      if (!mounted.current) return
      setError(err instanceof Error ? err.message : 'Gagal aktifkan notifikasi')
      setStage('visible')
    }
  }

  function handleNanti() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())) } catch { /* ignore */ }
    setStage('hidden')
  }

  if (stage === 'hidden') return null

  return (
    // Overlay
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 8500,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease forwards',
      }}
    >
      {/* Bottom sheet */}
      <div
        style={{
          width: '100%', maxWidth: '480px',
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          borderTop: '1px solid var(--border-accent)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
          animation: 'sheetUp 0.30s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Green accent line */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent 5%, var(--primary) 40%, var(--primary) 60%, transparent 95%)',
          borderRadius: '3px 3px 0 0',
        }} />

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '100px', background: 'var(--border-accent)' }} />
        </div>

        {/* Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px 0' }}>
          <button
            onClick={handleNanti}
            style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'var(--elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '13px', height: '13px', color: 'var(--text-dim)' }} />
          </button>
        </div>

        <div style={{ padding: '12px 24px 0' }}>
          {stage === 'success' ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '18px', margin: '0 auto 14px',
                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BellRing style={{ width: '26px', height: '26px', color: 'var(--primary)' }} />
              </div>
              <p style={{
                fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700,
                color: 'var(--text-primary)', margin: '0 0 6px',
              }}>
                Notifikasi Diaktifkan!
              </p>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6,
              }}>
                Anda akan terima kemas kini pengumuman dan program terkini dari masjid.
              </p>
            </div>

          ) : stage === 'denied' ? (
            /* ── Denied state ── */
            <div style={{ paddingBottom: '16px' }}>
              <p style={{
                fontFamily: 'var(--font-playfair)', fontSize: '19px', fontWeight: 700,
                color: 'var(--text-primary)', margin: '0 0 8px',
              }}>
                Notifikasi Disekat
              </p>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px',
              }}>
                Untuk aktifkan semula, pergi ke <strong>Settings → Kariah MSU → Notifications</strong> dan benarkan notifikasi.
              </p>
              <button
                onClick={() => setStage('hidden')}
                style={{
                  width: '100%', padding: '13px', borderRadius: '14px',
                  background: 'var(--elevated)', border: '1px solid var(--border)',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 600,
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}
              >
                Faham
              </button>
            </div>

          ) : (
            /* ── Main prompt ── */
            <>
              {/* Icon */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '18px', marginBottom: '16px',
                background: 'rgba(34,197,94,0.13)', border: '1px solid rgba(34,197,94,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell style={{ width: '26px', height: '26px', color: 'var(--primary)' }} />
              </div>

              <p style={{
                fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700,
                color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.2,
              }}>
                Benarkan Notifikasi
              </p>

              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 20px',
              }}>
                Aktifkan notifikasi supaya anda tidak terlepas pengumuman penting, waktu solat, dan program terkini dari Masjid Saujana Utama.
              </p>

              {/* Feature list */}
              {[
                'Pengumuman dari AJK',
                'Program & sukarelawan baru',
                'Peringatan waktu solat',
              ].map((item) => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(34,197,94,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                    color: 'var(--text-secondary)', fontWeight: 500,
                  }}>
                    {item}
                  </span>
                </div>
              ))}

              {error && (
                <p style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                  color: '#EF4444', marginTop: '10px',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px', padding: '8px 12px',
                }}>
                  ⚠ {error}
                </p>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', paddingBottom: '4px' }}>
                <button
                  onClick={handleAllow}
                  disabled={stage === 'loading'}
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: '14px',
                    background: stage === 'loading' ? 'rgba(34,197,94,0.55)' : 'var(--primary)',
                    color: '#08090E',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '15px', fontWeight: 700,
                    border: 'none', cursor: stage === 'loading' ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'background 0.15s',
                  }}
                >
                  <BellRing style={{ width: '17px', height: '17px' }} />
                  {stage === 'loading' ? 'Sila tunggu…' : 'Ya, Aktifkan Notifikasi'}
                </button>

                <button
                  onClick={handleNanti}
                  disabled={stage === 'loading'}
                  style={{
                    width: '100%', padding: '13px',
                    borderRadius: '14px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 500,
                    color: 'var(--text-dim)', cursor: 'pointer',
                  }}
                >
                  Nanti dulu
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
