'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { MosqueCard } from '@/components/ui/MosqueCard'
import type { Mosque } from '@/lib/mosque'
import type { PlanTier } from '@/lib/planFeatures'
import { Search, SlidersHorizontal } from 'lucide-react'

interface MosqueWithMeta extends Mosque {
  follower_count: number
  plan:           PlanTier | null
}

interface Props {
  mosques:     MosqueWithMeta[]
  followedIds: string[]
  isLoggedIn:  boolean
}

const MALAYSIAN_STATES = [
  'Semua Negeri','Johor','Kedah','Kelantan','Melaka','Negeri Sembilan',
  'Pahang','Perak','Perlis','Pulau Pinang','Sabah','Sarawak',
  'Selangor','Terengganu','Kuala Lumpur','Labuan','Putrajaya',
]

export function MosqueDirectoryClient({ mosques, followedIds: init, isLoggedIn }: Props) {
  const router = useRouter()
  const [search,   setSearch]   = useState('')
  const [state,    setState]    = useState('Semua Negeri')
  const [category, setCategory] = useState('semua')
  const [follows,  setFollows]  = useState<Set<string>>(new Set(init))
  const [loading,  setLoading]  = useState<string | null>(null)

  async function handleFollow(mosqueId: string) {
    if (!isLoggedIn) {
      router.push('/login?redirect=/senarai-masjid')
      return
    }
    setLoading(mosqueId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(null); return }

    const db = supabase as any
    if (follows.has(mosqueId)) {
      await db.from('mosque_follows').delete().eq('mosque_id', mosqueId).eq('user_id', user.id)
      setFollows(prev => { const s = new Set(prev); s.delete(mosqueId); return s })
    } else {
      await db.from('mosque_follows').insert({ mosque_id: mosqueId, user_id: user.id })
      setFollows(prev => new Set([...prev, mosqueId]))
    }
    setLoading(null)
  }

  const filtered = useMemo(() => {
    return mosques.filter(m => {
      const matchSearch   = !search   || m.name.toLowerCase().includes(search.toLowerCase())
      const matchState    = state === 'Semua Negeri' || m.state === state
      const matchCategory = category === 'semua'     || m.category === category
      return matchSearch && matchState && matchCategory
    })
  }, [mosques, search, state, category])

  return (
    <div style={{
      background: 'var(--void)',
      minHeight: '100vh',
      paddingBottom: '80px',
      paddingTop: '72px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(22px, 5vw, 32px)',
            fontWeight: 700,
            color: '#F0FDF4',
            marginBottom: '6px',
          }}>
            Senarai Masjid
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            color: 'rgba(186,230,200,0.5)',
          }}>
            {mosques.length} masjid & surau aktif di Sajda
          </p>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          {/* Search */}
          <div style={{
            flex: '1 1 220px',
            position: 'relative',
            minWidth: '180px',
          }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '14px', height: '14px',
              color: 'rgba(186,230,200,0.35)',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Cari nama masjid..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '10px',
                color: '#F0FDF4',
                fontSize: '13px',
                fontFamily: 'var(--font-dm-sans)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* State filter */}
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '10px',
              color: '#F0FDF4',
              fontSize: '13px',
              fontFamily: 'var(--font-dm-sans)',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '160px',
            }}
          >
            {MALAYSIAN_STATES.map(s => (
              <option key={s} value={s} style={{ background: '#0F1016' }}>{s}</option>
            ))}
          </select>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['semua', 'masjid', 'surau', 'musolla'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: category === cat ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${category === cat ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: category === cat ? '#22C55E' : 'rgba(186,230,200,0.5)',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-dm-sans)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s',
                }}
              >
                {cat === 'semua' ? 'Semua' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 20px',
            color: 'rgba(186,230,200,0.4)',
            fontFamily: 'var(--font-dm-sans)',
          }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>Tiada masjid dijumpai</p>
            <p style={{ fontSize: '13px' }}>Cuba carian atau penapis yang berbeza</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {filtered.map(mosque => (
              <MosqueCard
                key={mosque.id}
                mosque={mosque}
                followerCount={mosque.follower_count}
                plan={mosque.plan}
                isFollowing={follows.has(mosque.id)}
                onFollow={loading ? undefined : handleFollow}
                showFollowBtn={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
