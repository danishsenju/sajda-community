'use client'

import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function SendPushButton({
  programId,
  title,
  date,
}: {
  programId: string
  title: string
  date: string
}) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function send() {
    setLoading(true)
    try {
      await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `📅 Program Baru — ${title}`,
          body: `Jangan lepaskan! Program pada ${date}. Klik untuk lihat butiran.`,
          url: `/program/${programId}`,
          tag: `program-${programId}`,
        }),
      })
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="p-1.5"
      onClick={send}
      disabled={loading || done}
      title="Hantar notifikasi push"
    >
      {done
        ? <Check className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
        : <Bell className="w-3.5 h-3.5" />
      }
    </Button>
  )
}
