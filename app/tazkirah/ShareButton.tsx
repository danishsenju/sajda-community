'use client'

import { useState } from 'react'
import { Copy, Share2, Check } from 'lucide-react'

interface ShareButtonProps {
  text: string
}

export function ShareButton({ text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Tazkirah Harian — Kariah MSU',
          text,
        })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    // fallback: copy to clipboard
    handleCopy()
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      {/* Ghost "Salin Teks" button */}
      <button
        onClick={handleCopy}
        style={{
          flex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '100px',
          background: 'transparent',
          border: '1.5px solid var(--border-accent, rgba(34,197,94,0.22))',
          color: copied ? '#22C55E' : 'var(--text-secondary)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          fontFamily: 'var(--font-dm-sans)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(34,197,94,0.4)'
          el.style.background = 'rgba(34,197,94,0.04)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.borderColor = 'var(--border-accent, rgba(34,197,94,0.22))'
          el.style.background = 'transparent'
        }}
        aria-label="Salin teks ayat"
      >
        {copied
          ? <Check style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          : <Copy style={{ width: '14px', height: '14px', flexShrink: 0 }} />
        }
        {copied ? 'Disalin!' : 'Salin Teks'}
      </button>

      {/* Green filled "Kongsi" button */}
      <button
        onClick={handleShare}
        style={{
          flex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '100px',
          background: '#22C55E',
          border: '1.5px solid #22C55E',
          color: '#04080A',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          fontFamily: 'var(--font-dm-sans)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.filter = 'brightness(1.08)'
          el.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.filter = 'none'
          el.style.transform = 'scale(1)'
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
        aria-label="Kongsi ayat"
      >
        <Share2 style={{ width: '14px', height: '14px', flexShrink: 0 }} />
        Kongsi
      </button>
    </div>
  )
}
