'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Bell, BellOff, Star } from 'lucide-react'
import { getActiveMosque, setActiveMosqueStore } from '@/hooks/useActiveMosque'

interface Props {
  mosqueId:    string
  mosqueName:  string
  mosqueSlug:  string
  mosqueState: string | null
  isFollowing: boolean
  isLoggedIn:  boolean
}

export function MosqueFollowButton({
  mosqueId, mosqueName, mosqueSlug, mosqueState,
  isFollowing: initial, isLoggedIn,
}: Props) {
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
      await db.from('mosque_follows').delete()
        .eq('mosque_id', mosqueId)
        .eq('user_id', user.id)
      setFollowing(false)
    } else {
      await db.from('mosque_follows').insert({ mosque_id: mosqueId, user_id: user.id })
      setFollowing(true)
      // Auto-set as active mosque if user has none set yet
      if (!getActiveMosque()) {
        setActiveMosqueStore({ id: mosqueId, name: mosqueName, slug: mosqueSlug, state: mosqueState })
      }
    }
    setLoading(false)
    router.refresh()
  }

  async function setAsActive(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setActiveMosqueStore({ id: mosqueId, name: mosqueName, slug: mosqueSlug, state: mosqueState })
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={toggle}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '10px 18px', borderRadius: '10px',
          background: following ? 'rgba(34,197,94,0.1)' : 'var(--primary)',
          border: following ? '1px solid rgba(34,197,94,0.3)' : 'none',
          color: following ? '#22C55E' : '#04080A',
          fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1, flexShrink: 0, transition: 'all 0.15s',
        }}
      >
        {following
          ? <><BellOff style={{ width: '14px', height: '14px' }} /> Diikuti</>
          : <><Bell    style={{ width: '14px', height: '14px' }} /> Ikut Masjid</>
        }
      </button>

      {/* Set as active — only show if already following */}
      {following && (
        <button
          onClick={setAsActive}
          title="Jadikan masjid aktif"
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          <Star style={{ width: 15, height: 15, color: '#22C55E' }} />
        </button>
      )}
    </div>
  )
}
