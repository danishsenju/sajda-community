'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

function getSalam() {
  const h = new Date().getHours()
  if (h < 12) return 'Selamat pagi'
  if (h < 15) return 'Selamat tengah hari'
  if (h < 19) return 'Selamat petang'
  return 'Selamat malam'
}

export function GreetingBanner() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.full_name) setName(data.full_name.split(' ')[0])
        })
    })
  }, [])

  if (!name) return null

  return (
    <div style={{ padding: '16px 20px 0' }}>
      <p style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '20px', fontWeight: 700, fontStyle: 'italic',
        color: 'var(--text-primary)', lineHeight: 1.2,
      }}>
        {getSalam()},
      </p>
      <p style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '20px', fontWeight: 700, fontStyle: 'italic',
        color: 'var(--primary)', lineHeight: 1.2,
      }}>
        {name}.
      </p>
    </div>
  )
}
