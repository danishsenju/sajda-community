'use client'

import Link from 'next/link'
import { ArrowLeft, Share2, Copy, MessageCircle, Check } from 'lucide-react'
import { useState } from 'react'

export function ShareSijilButtons({
  shareUrl,
  shareText,
  programHref,
}: {
  shareUrl: string
  shareText: string
  programHref: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleNativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl })
      } catch {
        // user cancelled
      }
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const waText = encodeURIComponent(`${shareText}\n\n${shareUrl}`)
  const waUrl = `https://wa.me/?text=${waText}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* WhatsApp */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '13px', borderRadius: '14px',
          background: 'var(--primary)', color: '#04080A', textDecoration: 'none',
          fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
          transition: 'opacity 0.15s',
        }}
      >
        <MessageCircle style={{ width: '16px', height: '16px' }} />
        Kongsi ke WhatsApp
      </a>

      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Native share */}
        <button
          onClick={handleNativeShare}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            padding: '12px', borderRadius: '14px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Share2 style={{ width: '14px', height: '14px' }} />
          Kongsi
        </button>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            padding: '12px', borderRadius: '14px',
            background: copied ? 'rgba(34,197,94,0.08)' : 'var(--surface)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
            color: copied ? 'var(--primary)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {copied
            ? <><Check style={{ width: '14px', height: '14px' }} /> Tersalin</>
            : <><Copy style={{ width: '14px', height: '14px' }} /> Salin Pautan</>
          }
        </button>
      </div>

      {/* Back to program */}
      <Link
        href={programHref}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '10px', borderRadius: '12px',
          fontFamily: 'var(--font-jakarta)', fontSize: '12px',
          color: 'var(--text-dim)', textDecoration: 'none',
          transition: 'color 0.15s',
        }}
      >
        <ArrowLeft style={{ width: '13px', height: '13px' }} />
        Kembali ke program
      </Link>
    </div>
  )
}
