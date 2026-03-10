'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function OfferHelpButton({ keperluanId }: { keperluanId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?redirect=/keperluan/${keperluanId}`)
      return
    }

    const { error } = await supabase.from('keperluan_helpers').insert({
      keperluan_id: keperluanId,
      helper_id: user.id,
      message: message || null,
    })

    if (error) {
      setError(error.code === '23505' ? 'Anda sudah menawarkan bantuan.' : error.message)
    } else {
      setDone(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl border text-sm"
        style={{ background: '#E8F5EE', borderColor: '#B7DFC9', color: '#2D6A4F', fontFamily: 'var(--font-jakarta)' }}>
        <Heart className="w-4 h-4" />
        Terima kasih! Tawaran bantuan anda telah direkodkan.
      </div>
    )
  }

  return (
    <div>
      {!open ? (
        <Button className="w-full gap-2" onClick={() => setOpen(true)}>
          <Heart className="w-4 h-4" />
          Saya Boleh Bantu
        </Button>
      ) : (
        <div className="flex flex-col gap-3 p-5 rounded-2xl border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Textarea
            label="Mesej (pilihan)"
            placeholder="Saya boleh bantu pada..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          {error && (
            <p className="text-xs rounded-lg px-3 py-2 border"
              style={{ color: '#DC2626', background: '#FEF2F2', borderColor: '#FECACA', fontFamily: 'var(--font-jakarta)' }}>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button className="flex-1 gap-1.5" loading={loading} onClick={submit}>
              <Heart className="w-4 h-4" />
              Hantar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
