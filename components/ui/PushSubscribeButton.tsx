'use client'

import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react'
import { usePushNotification } from '@/hooks/usePushNotification'

export function PushSubscribeButton() {
  const { state, subscribe, unsubscribe } = usePushNotification()

  if (state === 'unsupported') return null

  const configs = {
    loading: {
      icon: <Loader2 style={{ width: '15px', height: '15px', animation: 'spin 0.8s linear infinite' }} />,
      label: 'Memuat...',
      bg: 'var(--elevated)', border: 'var(--border)', color: 'var(--text-dim)',
      onClick: undefined,
    },
    denied: {
      icon: <BellOff style={{ width: '15px', height: '15px' }} />,
      label: 'Notifikasi disekat',
      bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', color: '#EF4444',
      onClick: undefined,
    },
    unsubscribed: {
      icon: <Bell style={{ width: '15px', height: '15px' }} />,
      label: 'Aktifkan Notifikasi',
      bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.3)', color: 'var(--primary)',
      onClick: subscribe,
    },
    subscribed: {
      icon: <BellRing style={{ width: '15px', height: '15px' }} />,
      label: 'Notifikasi Aktif',
      bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.4)', color: 'var(--primary)',
      onClick: unsubscribe,
    },
  }

  const c = configs[state]

  return (
    <button
      onClick={c.onClick}
      disabled={!c.onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px', borderRadius: '12px',
        background: c.bg, border: `1px solid ${c.border}`,
        color: c.color, cursor: c.onClick ? 'pointer' : 'default',
        fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
        transition: 'all 0.15s', outline: 'none', width: '100%',
        justifyContent: 'center',
      }}
    >
      {c.icon}
      {c.label}
      {state === 'subscribed' && (
        <span style={{
          marginLeft: 'auto', fontSize: '10px', fontWeight: 500,
          color: 'var(--text-dim)',
        }}>Klik untuk nyahaktif</span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
