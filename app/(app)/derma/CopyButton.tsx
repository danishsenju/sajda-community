'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold tracking-wider uppercase transition-all"
      style={{
        fontFamily: 'var(--font-jakarta)',
        color: copied ? 'var(--primary)' : 'var(--text-dim)',
        borderColor: copied ? '#B7DFC9' : 'var(--border)',
        background: copied ? '#E8F5EE' : 'transparent',
      }}
      onClick={handleCopy}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Disalin' : 'Salin'}
    </button>
  )
}
