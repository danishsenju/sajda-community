'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Bell, BellOff } from 'lucide-react'

interface Props {
  mosqueId:    string
  isFollowing: boolean
  isLoggedIn:  boolean
  mosqueSlug:  string
}

export function MosqueFollowButton({ mosqueId, isFollowing: initial, isLoggedIn, mosqueSlug }: Props) {
  const [following, setFollowing] = useState(initial)
  const [loading, setLoading]     = useState(false)
  const router = useRouter()

  async function toggle() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/${mosqueSlug}`)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const db = supabase as any
    if (following) {
      await db.from('mosque_follows').delete().eq('mosque_id', mosqueId).eq('user_id', user.id)
      setFollowing(false)
    } else {
      await db.from('mosque_follows').insert({ mosque_id: mosqueId, user_id: user.id })
      setFollowing(true)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '10px 18px',
        borderRadius: '10px',
        background: following ? 'rgba(34,197,94,0.1)' : '#22C55E',
        border: following ? '1px solid rgba(34,197,94,0.3)' : 'none',
        color: following ? '#22C55E' : '#08090E',
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '13px',
        fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        flexShrink: 0,
        transition: 'all 0.15s',
      }}
    >
      {following
        ? <><BellOff style={{ width: '14px', height: '14px' }} /> Berhenti Ikut</>
        : <><Bell    style={{ width: '14px', height: '14px' }} /> Ikut Masjid</>
      }
    </button>
  )
}
