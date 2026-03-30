'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Users } from 'lucide-react'

type Mode = 'ibadah' | 'komuniti'

export function HomeModeSwitcher({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('komuniti')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('home-mode') as Mode | null
    if (saved === 'ibadah' || saved === 'komuniti') setMode(saved)
    setMounted(true)
  }, [])

  function select(m: Mode) {
    setMode(m)
    localStorage.setItem('home-mode', m)
  }

  const active = mounted ? mode : 'komuniti'

  return (
    <div data-mode={active}>

      {/* ── Sticky tab bar ── */}
      <div
        className="md:hidden"
        style={{
          position: 'sticky',
          top: 56,   /* mobile navbar is h-14 (56px) — sit flush below it */
          zIndex: 20, /* below navbar z-50 */
          background: 'rgba(8,9,14,0.88)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {([
            { key: 'ibadah',   label: 'Ibadah',   Icon: BookOpen },
            { key: 'komuniti', label: 'Komuniti',  Icon: Users },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => select(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 0 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom: active === key
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
                color: active === key ? 'var(--primary)' : 'rgba(134,239,172,0.35)',
                transition: 'color 0.2s, border-color 0.2s',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '14px',
                fontWeight: active === key ? 700 : 500,
                letterSpacing: '0.01em',
              }}
            >
              <Icon
                size={16}
                strokeWidth={active === key ? 2.2 : 1.6}
                style={{ transition: 'stroke-width 0.2s' }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop pill toggle (unchanged) ── */}
      <div className="hidden md:flex" style={{ justifyContent: 'center', padding: '20px 20px 4px' }}>
        <div style={{
          display: 'inline-flex',
          gap: 0,
          padding: 4,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
        }}>
          {(['ibadah', 'komuniti'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => select(m)}
              style={{
                padding: '9px 24px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s',
                background: active === m ? 'var(--primary)' : 'transparent',
                color: active === m ? 'var(--void, #08090E)' : 'var(--text-dim)',
                fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              {m === 'ibadah' ? 'Ibadah' : 'Komuniti'}
            </button>
          ))}
        </div>
      </div>

      {children}
    </div>
  )
}
