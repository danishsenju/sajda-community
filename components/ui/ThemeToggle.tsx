'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div style={{
        width: compact ? '32px' : '34px',
        height: compact ? '32px' : '34px',
        borderRadius: '10px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }} />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Tukar ke mod terang' : 'Tukar ke mod gelap'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: compact ? '32px' : '34px',
        height: compact ? '32px' : '34px',
        borderRadius: '10px',
        background: 'transparent',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        flexShrink: 0,
      }}
      className="hover:bg-[var(--elevated)] transition-colors"
    >
      {isDark
        ? <Sun  style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} strokeWidth={2} />
        : <Moon style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} strokeWidth={2} />
      }
    </button>
  )
}
