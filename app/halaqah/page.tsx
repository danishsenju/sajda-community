'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  ChevronLeft, Plus, Users, BookOpen, Star, Lock, Unlock,
  ChevronRight, RefreshCw, Target
} from 'lucide-react'

type Group = {
  id: string
  name: string
  description: string | null
  type: string
  weekly_target: number
  max_members: number
  is_open: boolean
  created_by: string
  created_at: string
  member_count?: number
  my_progress?: number
}

const TYPE_CONFIG = {
  tadarus:  { label: 'Tadarus',  color: '#22C55E', bg: 'rgba(34,197,94,0.10)',  icon: '📖' },
  hafazan:  { label: 'Hafazan',  color: '#A78BFA', bg: 'rgba(167,139,250,0.10)', icon: '🧠' },
  tafsir:   { label: 'Tafsir',   color: '#38BDF8', bg: 'rgba(56,189,248,0.10)',  icon: '🔍' },
  tahsin:   { label: 'Tahsin',   color: '#FCD34D', bg: 'rgba(252,211,77,0.10)',  icon: '🎵' },
}

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.tadarus
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '100px',
      background: cfg.bg, color: cfg.color,
      fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function ProgressRing({ value, max, color }: { value: number; max: number; color: string }) {
  const pct  = max > 0 ? Math.min(value / max, 1) : 0
  const r    = 22
  const circ = 2 * Math.PI * r
  const dash = pct * circ
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="28" y="32" textAnchor="middle"
        style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', fontWeight: 700, fill: color }}>
        {value}
      </text>
    </svg>
  )
}

export default function HalaqahPage() {
  const [groups,     setGroups]     = useState<Group[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const [filter,     setFilter]     = useState('semua')
  const [myGroups,   setMyGroups]   = useState<string[]>([])
  const [userId,     setUserId]     = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(false)
    try {
      const supabase = createClient()
      const db = supabase as any
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data: groups, error: gErr } = await db
        .from('halaqah_groups')
        .select(`*, halaqah_members(count)`)
        .order('created_at', { ascending: false })
      if (gErr) throw gErr

      // member groups for current user
      if (user) {
        const { data: myM } = await db
          .from('halaqah_members')
          .select('group_id')
          .eq('user_id', user.id)
        setMyGroups((myM ?? []).map((m: any) => m.group_id))

        // personal progress per group
        const { data: prog } = await db
          .from('halaqah_progress')
          .select('group_id')
          .eq('user_id', user.id)

        const progressMap: Record<string, number> = {}
        ;(prog ?? []).forEach((p: any) => {
          progressMap[p.group_id] = (progressMap[p.group_id] ?? 0) + 1
        })

        setGroups((groups ?? []).map((g: any) => ({
          ...g,
          member_count: (g.halaqah_members as unknown as { count: number }[])?.[0]?.count ?? 0,
          my_progress: progressMap[g.id] ?? 0,
        })))
      } else {
        setGroups((groups ?? []).map((g: any) => ({
          ...g,
          member_count: (g.halaqah_members as unknown as { count: number }[])?.[0]?.count ?? 0,
        })))
      }
    } catch { setError(true) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const FILTERS = ['semua', 'tadarus', 'hafazan', 'tafsir', 'tahsin']
  const filtered = groups.filter(g =>
    filter === 'semua' || g.type === filter
  )

  const myGroupsList  = groups.filter(g => myGroups.includes(g.id))
  const otherGroups   = filtered.filter(g => !myGroups.includes(g.id))

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--elevated) 0%, var(--surface) 60%, var(--void) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Geometric bg */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.035, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hq-geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,6 50,32 76,32 54,48 62,74 40,58 18,74 26,48 4,32 30,32"
                  fill="none" stroke="#22C55E" strokeWidth="0.6"/>
                <circle cx="40" cy="40" r="30" fill="none" stroke="#22C55E" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hq-geo)"/>
          </svg>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} /> Utama
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <BookOpen style={{ width: '14px', height: '14px', color: 'var(--primary)' }} />
                <span style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--primary)',
                }}>
                  Komuniti Al-Quran
                </span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.7rem, 4vw, 2.4rem)',
                fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1,
              }}>
                Halaqah Komuniti
              </h1>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                color: 'var(--text-secondary)', marginTop: '8px',
              }}>
                Tadarus, hafazan & tafsir bersama jemaah setempat
              </p>
            </div>

            <Link href="/halaqah/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '11px 20px', borderRadius: '12px',
              background: 'var(--primary)', color: '#04080A',
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700,
              textDecoration: 'none', flexShrink: 0,
              boxShadow: '0 4px 20px rgba(34,197,94,0.30)',
            }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Cipta Halaqah
            </Link>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', gap: '24px', marginTop: '24px',
            padding: '14px 20px', borderRadius: '14px',
            background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)',
          }}>
            {[
              { v: groups.length, label: 'Halaqah Aktif' },
              { v: myGroupsList.length, label: 'Saya Sertai' },
              { v: groups.reduce((a, g) => a + (g.member_count ?? 0), 0), label: 'Jumlah Ahli' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '22px', fontWeight: 700, color: 'var(--primary)', margin: 0, lineHeight: 1 }}>
                  {loading ? '—' : s.v}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)', marginTop: '3px', letterSpacing: '0.06em' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '24px',
        }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: '100px', border: '1px solid',
              borderColor: filter === f ? 'var(--primary)' : 'var(--border)',
              background: filter === f ? 'rgba(34,197,94,0.10)' : 'var(--surface)',
              color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              textTransform: 'capitalize',
            }}>
              {f === 'semua' ? 'Semua' : TYPE_CONFIG[f as keyof typeof TYPE_CONFIG]?.label ?? f}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '14px' }}>
              Gagal memuatkan halaqah
            </p>
            <button onClick={load} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent',
              cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)',
            }}>
              <RefreshCw style={{ width: '12px', height: '12px' }} /> Cuba Semula
            </button>
          </div>
        )}

        {/* My groups */}
        {!loading && !error && myGroupsList.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--primary)', marginBottom: '12px',
            }}>
              Halaqah Saya
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myGroupsList.map(g => <GroupCard key={g.id} group={g} isMember={true} userId={userId} />)}
            </div>
          </div>
        )}

        {/* All groups */}
        {!loading && !error && (
          <div>
            {myGroupsList.length > 0 && (
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--text-dim)', marginBottom: '12px',
              }}>
                {filter === 'semua' ? 'Semua Halaqah' : TYPE_CONFIG[filter as keyof typeof TYPE_CONFIG]?.label}
              </p>
            )}
            {otherGroups.length === 0 && groups.length === 0 && (
              <div style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <BookOpen style={{ width: '32px', height: '32px', color: 'var(--text-dim)', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Belum ada halaqah
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px' }}>
                  Jadilah yang pertama menubuhkan halaqah komuniti
                </p>
                <Link href="/halaqah/new" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 20px', borderRadius: '10px',
                  background: 'var(--primary)', color: '#04080A',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700,
                  textDecoration: 'none',
                }}>
                  <Plus style={{ width: '13px', height: '13px' }} /> Cipta Halaqah Pertama
                </Link>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {otherGroups.map(g => <GroupCard key={g.id} group={g} isMember={false} userId={userId} />)}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                height: '110px', borderRadius: '16px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                animation: 'shimmer 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </div>
  )
}

function GroupCard({ group, isMember, userId }: { group: Group; isMember: boolean; userId: string | null }) {
  const cfg    = TYPE_CONFIG[group.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.tadarus
  const full   = (group.member_count ?? 0) >= group.max_members
  const isOwner = userId === group.created_by

  return (
    <Link href={`/halaqah/${group.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        padding: '18px 20px', borderRadius: '16px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        display: 'flex', gap: '16px', alignItems: 'center',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative', overflow: 'hidden',
        cursor: 'pointer',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,197,94,0.25)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(34,197,94,0.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
      >
        {/* Left accent */}
        {isMember && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: `linear-gradient(180deg, ${cfg.color} 0%, rgba(34,197,94,0.1) 100%)` }} />}

        {/* Progress ring */}
        <ProgressRing value={group.my_progress ?? 0} max={30} color={cfg.color} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h3 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 700,
              color: 'var(--text-primary)', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {group.name}
            </h3>
            {isOwner && (
              <span style={{ padding: '1px 6px', borderRadius: '6px', background: 'rgba(252,211,77,0.12)', color: '#FCD34D', fontFamily: 'var(--font-dm-sans)', fontSize: '9px', fontWeight: 700 }}>
                <Star style={{ width: '8px', height: '8px', display: 'inline', marginRight: '2px' }} />Ketua
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <TypeBadge type={group.type} />
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)' }}>
              <Users style={{ width: '10px', height: '10px' }} />
              {group.member_count ?? 0}/{group.max_members} ahli
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)' }}>
              <Target style={{ width: '10px', height: '10px' }} />
              {group.weekly_target} juzuk/minggu
            </span>
          </div>

          {group.description && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)', margin: '6px 0 0', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
              {group.description}
            </p>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: group.is_open && !full ? '#22C55E' : 'var(--text-dim)' }}>
            {group.is_open && !full
              ? <><Unlock style={{ width: '10px', height: '10px' }} /> Terbuka</>
              : <><Lock style={{ width: '10px', height: '10px' }} /> {full ? 'Penuh' : 'Tertutup'}</>
            }
          </div>
          {isMember && (
            <span style={{ padding: '2px 8px', borderRadius: '8px', background: 'rgba(34,197,94,0.10)', color: 'var(--primary)', fontFamily: 'var(--font-dm-sans)', fontSize: '9px', fontWeight: 700 }}>
              Ahli ✓
            </span>
          )}
          <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
        </div>
      </div>
    </Link>
  )
}
