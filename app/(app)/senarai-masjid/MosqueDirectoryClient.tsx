'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { MosqueCard } from '@/components/ui/MosqueCard'
import type { Mosque } from '@/lib/mosque'
import type { PlanTier } from '@/lib/planFeatures'
import { Search, Building2 } from 'lucide-react'

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

const CATEGORIES = [
  { value: 'semua',   label: 'Semua' },
  { value: 'masjid',  label: 'Masjid' },
  { value: 'surau',   label: 'Surau' },
  { value: 'musolla', label: 'Musolla' },
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
      paddingBottom: '100px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 20px 24px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--text-dim)', marginBottom: '6px',
          }}>
            Direktori
          </p>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(22px, 5vw, 32px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            Senarai Masjid
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
            color: 'var(--text-dim)',
          }}>
            {mosques.length} masjid &amp; surau aktif di Sajda
          </p>
        </div>

        {/* ── Search ── */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)',
            width: '15px', height: '15px',
            color: 'var(--text-dim)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Cari nama masjid..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'var(--font-dm-sans)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
          />
        </div>

        {/* ── State + Category filters ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {/* State */}
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'var(--font-dm-sans)',
              outline: 'none',
              cursor: 'pointer',
              colorScheme: 'dark',
              minWidth: '160px',
            }}
          >
            {MALAYSIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: category === cat.value ? 'var(--primary)' : 'var(--surface)',
                  border: `1px solid ${category === cat.value ? 'var(--primary)' : 'var(--border)'}`,
                  color: category === cat.value ? '#04080A' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-dm-sans)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results ── */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 20px',
            color: 'var(--text-dim)', fontFamily: 'var(--font-dm-sans)',
          }}>
            <Building2 style={{ width: 32, height: 32, margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Tiada masjid dijumpai
            </p>
            <p style={{ fontSize: '13px' }}>Cuba carian atau penapis yang berbeza</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px',
          }}>
            {filtered.map(mosque => (
              <MosqueCard
                key={mosque.id}
                mosque={mosque}
                followerCount={mosque.follower_count}
                plan={mosque.plan}
                isFollowing={follows.has(mosque.id)}
                onFollow={loading ? undefined : handleFollow}
                showFollowBtn
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
