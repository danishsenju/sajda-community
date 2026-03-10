'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function VolunteerButton({ programId }: { programId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function signup() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?redirect=/program/${programId}`)
      return
    }

    const { error } = await supabase.from('volunteer_signups').insert({
      program_id: programId,
      user_id: user.id,
      status: 'confirmed',
    })

    if (error) {
      setError(error.code === '23505' ? 'Anda sudah mendaftar sebagai sukarelawan.' : error.message)
    } else {
      setDone(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 p-3 rounded-xl border text-sm"
        style={{ background: '#E8F5EE', borderColor: '#B7DFC9', color: '#2D6A4F', fontFamily: 'var(--font-jakarta)' }}>
        <Users className="w-4 h-4" />
        Berjaya! Anda telah didaftarkan sebagai sukarelawan.
      </div>
    )
  }

  return (
    <div>
      {error && (
        <p className="text-xs mb-2 px-3 py-2 rounded-xl border"
          style={{ color: '#DC2626', background: '#FEF2F2', borderColor: '#FECACA', fontFamily: 'var(--font-jakarta)' }}>
          {error}
        </p>
      )}
      <Button className="w-full gap-2" loading={loading} onClick={signup}>
        <Users className="w-4 h-4" />
        Daftar Sukarela
      </Button>
    </div>
  )
}
