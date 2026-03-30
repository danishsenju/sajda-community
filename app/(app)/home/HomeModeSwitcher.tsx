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
    // Notify BottomNav (same tab — storage events don't fire in same tab)
    window.dispatchEvent(new CustomEvent('home-mode-change', { detail: m }))
  }

  const active = mounted ? mode : 'komuniti'

  return (
    <div data-mode={active}>

      {/* ── Floating pill toggle — fixed above bottom nav, always visible ── */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 90,   /* sits above the 82px bottom nav */
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
        }}
      >
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '5px',
          background: 'rgba(10,14,10,0.82)',
          backdropFilter: 'blur(20px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
          border: '1px solid rgba(74,222,128,0.18)',
          borderRadius: '100px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.06)',
        }}>
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
                gap: '7px',
                padding: '9px 18px',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: active === key ? 'var(--primary)' : 'transparent',
                color: active === key ? '#04080A' : 'rgba(134,239,172,0.5)',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <Icon
                size={14}
                strokeWidth={2.2}
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
