'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  ChevronLeft, Users, Target, Lock, Unlock, BookOpen,
  Brain, Search, Music2, Star, Check, RefreshCw,
  Crown, UserMinus, UserPlus, Trash2, MoreVertical,
  MessageCircle, TrendingUp,
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
}

type Member = {
  id: string
  user_id: string
  role: string
  joined_at: string
  profiles: { full_name: string | null; avatar_url: string | null } | null
  juzuk_done: number
}

type ProgressRow = {
  juzuk: number
  user_id: string
  created_at: string
}

const TYPE_CONFIG = {
  tadarus: { label: 'Tadarus',  color: '#22C55E', icon: BookOpen },
  hafazan: { label: 'Hafazan',  color: '#A78BFA', icon: Brain    },
  tafsir:  { label: 'Tafsir',   color: '#38BDF8', icon: Search   },
  tahsin:  { label: 'Tahsin',   color: '#FCD34D', icon: Music2   },
}

const JUZUK_NAMES = [
  'Alif Lam Mim','Sayaqul','Tilkar-Rusul','Lan Tana Lu','Wal-Muhsanat',
  'La Yuhibbullah','Wa Idha Sami\'u','Wa Lau Annana','Qalal-Mala\'u','Wa\`lamu',
  'Ya\'taziruna','Wa Ma Min Dabbah','Wa Ma Ubri\'u','Rubama','Subhanalladhi',
  'Qal Alam','Iqtaraba','Qad Aflaha','Wa Qalal-Ladhina','A\'man Khalaq',
  'Utlu Ma Uhiya','Wa Man Yaqnut','Wa Mali','Faman Azlamu','Ilayhi Yuraddu',
  'Ha Mim','Qala Fama Khatbukum','Qad Sami\'allah','Tabarakalladhi','Amma Yatasa\'alun',
]

export default function HalaqahDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [group, setGroup]       = useState<Group | null>(null)
  const [members, setMembers]   = useState<Member[]>([])
  const [progress, setProgress] = useState<ProgressRow[]>([])
  const [myProgress, setMyProg] = useState<number[]>([])
  const [userId, setUserId]     = useState<string | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [joining, setJoining]   = useState(false)
  const [tab, setTab]           = useState<'progress' | 'ahli' | 'leaderboard'>('progress')
  const [actionMenu, setMenu]   = useState(false)
  const [markingJuzuk, setMarkingJuzuk] = useState<number | null>(null)

  async function load() {
    setLoading(true); setError(false)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any

      const [{ data: grp, error: gErr }, { data: mems }, { data: prog }] = await Promise.all([
        db.from('halaqah_groups').select('*').eq('id', id).single(),
        db.from('halaqah_members')
          .select('*, profiles(full_name, avatar_url)')
          .eq('group_id', id)
          .order('joined_at', { ascending: true }),
        db.from('halaqah_progress')
          .select('juzuk, user_id, created_at')
          .eq('group_id', id),
      ])

      if (gErr) throw gErr
      setGroup(grp)
      setProgress(prog ?? [])

      // compute juzuk count per member
      const juzukByUser: Record<string, number> = {}
      ;(prog ?? []).forEach((p: any) => {
        juzukByUser[p.user_id] = (juzukByUser[p.user_id] ?? 0) + 1
      })

      const membersWithProg = (mems ?? []).map((m: any) => ({
        ...m,
        juzuk_done: juzukByUser[m.user_id] ?? 0,
      }))
      setMembers(membersWithProg)

      if (user) {
        const memberIds = (mems ?? []).map((m: any) => m.user_id)
        setIsMember(memberIds.includes(user.id))
        const myJuzuk = (prog ?? [])
          .filter((p: any) => p.user_id === user.id)
          .map((p: any) => p.juzuk)
        setMyProg(myJuzuk)
      }
    } catch { setError(true) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function handleJoin() {
    if (!userId) { router.push(`/login?redirect=/halaqah/${id}`); return }
    setJoining(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any
      await supabase.from('halaqah_members').insert({ group_id: id, user_id: userId, role: 'ahli' })
      await load()
    } catch { /* ignore */ }
    finally { setJoining(false) }
  }

  async function handleLeave() {
    if (!userId) return
    const ok = confirm('Anda pasti ingin meninggalkan halaqah ini? Progress anda akan dikekalkan.')
    if (!ok) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    await supabase.from('halaqah_members').delete().eq('group_id', id).eq('user_id', userId)
    await load()
  }

  async function toggleJuzuk(juzuk: number) {
    if (!userId || !isMember) return
    setMarkingJuzuk(juzuk)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    if (myProgress.includes(juzuk)) {
      await supabase.from('halaqah_progress')
        .delete().eq('group_id', id).eq('user_id', userId).eq('juzuk', juzuk)
      setMyProg(prev => prev.filter(j => j !== juzuk))
    } else {
      await supabase.from('halaqah_progress')
        .insert({ group_id: id, user_id: userId, juzuk })
      setMyProg(prev => [...prev, juzuk])
    }
    // refresh member list for leaderboard
    await load()
    setMarkingJuzuk(null)
  }

  // compute who completed each juzuk (for group heatmap)
  const juzukCompletions: Record<number, number> = {}
  progress.forEach(p => {
    juzukCompletions[p.juzuk] = (juzukCompletions[p.juzuk] ?? 0) + 1
  })

  const cfg = group ? (TYPE_CONFIG[group.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.tadarus) : TYPE_CONFIG.tadarus
  const isOwner = group?.created_by === userId
  const memberCount = members.length
  const totalJuzukDone = myProgress.length

  if (loading) return <LoadingState />
  if (error || !group) return <ErrorState onRetry={load} />

  const full = memberCount >= group.max_members

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, var(--elevated) 0%, var(--surface) 60%, var(--void) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '32px 24px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="det-geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,6 50,32 76,32 54,48 62,74 40,58 18,74 26,48 4,32 30,32"
                  fill="none" stroke={cfg.color} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#det-geo)"/>
          </svg>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link href="/halaqah" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '20px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} /> Halaqah Komuniti
          </Link>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: `rgba(${cfg.color === '#22C55E' ? '34,197,94' : cfg.color === '#A78BFA' ? '167,139,250' : cfg.color === '#38BDF8' ? '56,189,248' : '252,211,77'},0.15)`,
              border: `1px solid ${cfg.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <cfg.icon style={{ width: '22px', height: '22px', color: cfg.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: '100px',
                  background: `${cfg.color}18`, color: cfg.color,
                  fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {cfg.label}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: group.is_open && !full ? '#22C55E' : 'var(--text-dim)' }}>
                  {group.is_open && !full
                    ? <><Unlock style={{ width: '9px', height: '9px' }} /> Terbuka</>
                    : <><Lock style={{ width: '9px', height: '9px' }} /> {full ? 'Penuh' : 'Tertutup'}</>
                  }
                </span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.15,
              }}>
                {group.name}
              </h1>
              {group.description && (
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                  {group.description}
                </p>
              )}
            </div>

            {/* Action menu for owner */}
            {isOwner && (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setMenu(p => !p)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <MoreVertical style={{ width: '15px', height: '15px', color: 'var(--text-dim)' }} />
                </button>
                {actionMenu && (
                  <div style={{
                    position: 'absolute', top: '44px', right: 0, zIndex: 100,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '6px', minWidth: '160px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}>
                    <button
                      onClick={() => { setMenu(false); alert('Fungsi edit akan datang') }}
                      style={menuItemStyle}
                    >
                      Edit Halaqah
                    </button>
                    <button
                      onClick={async () => {
                        setMenu(false)
                        if (!confirm('Bubarkan halaqah ini? Semua data akan dipadam.')) return
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const supabase = createClient() as any
                        await supabase.from('halaqah_groups').delete().eq('id', id)
                        router.push('/halaqah')
                      }}
                      style={{ ...menuItemStyle, color: '#EF4444' }}
                    >
                      <Trash2 style={{ width: '12px', height: '12px' }} /> Bubarkan
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', gap: '0', marginBottom: '0',
            borderTop: '1px solid var(--border)',
          }}>
            {[
              { label: 'Ahli', value: `${memberCount}/${group.max_members}`, icon: Users },
              { label: 'Sasaran', value: `${group.weekly_target} juzuk/mgg`, icon: Target },
              { label: 'Progress Saya', value: `${totalJuzukDone}/30 juzuk`, icon: TrendingUp },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, padding: '12px 16px',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              }}>
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '14px', fontWeight: 700, color: cfg.color, margin: 0 }}>
                  {s.value}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', margin: 0, letterSpacing: '0.06em' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px 80px' }}>

        {/* Join / Leave button */}
        <div style={{ paddingTop: '20px', paddingBottom: '4px' }}>
          {!isMember ? (
            <button
              onClick={handleJoin}
              disabled={joining || (full && !isOwner)}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: full ? 'var(--elevated)' : 'var(--primary)',
                border: 'none', cursor: full ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700,
                color: full ? 'var(--text-dim)' : '#04080A',
                boxShadow: full ? 'none' : '0 4px 20px rgba(34,197,94,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {joining
                ? 'Menyertai...'
                : full
                  ? 'Halaqah Sudah Penuh'
                  : <><UserPlus style={{ width: '15px', height: '15px' }} /> Sertai Halaqah</>
              }
            </button>
          ) : !isOwner ? (
            <button
              onClick={handleLeave}
              style={{
                padding: '10px 20px', borderRadius: '12px',
                background: 'transparent', border: '1px solid rgba(239,68,68,0.25)',
                fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                color: '#EF4444', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <UserMinus style={{ width: '13px', height: '13px' }} /> Keluar Halaqah
            </button>
          ) : null}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {([
            { key: 'progress',    label: 'Rekod Juzuk' },
            { key: 'ahli',        label: `Ahli (${memberCount})` },
            { key: 'leaderboard', label: 'Papan Markah' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '10px 16px', borderRadius: '0', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
              background: 'transparent',
              color: tab === t.key ? cfg.color : 'var(--text-dim)',
              borderBottom: `2px solid ${tab === t.key ? cfg.color : 'transparent'}`,
              marginBottom: '-1px', transition: 'all 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Juzuk progress grid */}
        {tab === 'progress' && (
          <div style={{ animation: 'fadeUp 0.25s ease forwards' }}>
            {!isMember && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)',
              }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Sertai halaqah ini untuk rekod progress juzuk anda.
                </p>
              </div>
            )}

            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)',
              marginBottom: '14px',
            }}>
              {isMember ? 'Tandakan juzuk yang sudah anda selesaikan' : 'Progress Kumpulan'}
            </p>

            {/* 30-juzuk grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '24px' }}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(juzuk => {
                const done      = myProgress.includes(juzuk)
                const groupDone = juzukCompletions[juzuk] ?? 0
                const isMarking = markingJuzuk === juzuk
                return (
                  <button
                    key={juzuk}
                    onClick={() => toggleJuzuk(juzuk)}
                    disabled={!isMember || isMarking !== false}
                    title={JUZUK_NAMES[juzuk - 1]}
                    style={{
                      position: 'relative', padding: '10px 6px', borderRadius: '10px',
                      background: done ? `${cfg.color}22` : 'var(--surface)',
                      border: `1.5px solid ${done ? cfg.color : groupDone > 0 ? 'var(--border-lit)' : 'var(--border)'}`,
                      cursor: isMember ? 'pointer' : 'default',
                      transition: 'all 0.15s', textAlign: 'center',
                      boxShadow: done ? `0 2px 12px ${cfg.color}22` : 'none',
                      opacity: isMarking ? 0.6 : 1,
                    }}
                  >
                    <p style={{
                      fontFamily: 'var(--font-jetbrains)', fontSize: '15px', fontWeight: 700,
                      color: done ? cfg.color : 'var(--text-secondary)', margin: '0 0 2px',
                    }}>
                      {juzuk}
                    </p>
                    {done && (
                      <Check style={{ width: '9px', height: '9px', color: cfg.color, position: 'absolute', top: '4px', right: '4px' }} />
                    )}
                    {groupDone > 0 && !done && (
                      <div style={{
                        position: 'absolute', top: '3px', right: '4px',
                        fontFamily: 'var(--font-dm-sans)', fontSize: '7px',
                        color: 'var(--text-dim)', fontWeight: 600,
                      }}>
                        {groupDone}👤
                      </div>
                    )}
                    <p style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: '7px', color: done ? cfg.color : 'var(--text-dim)',
                      margin: 0, lineHeight: 1.2, overflow: 'hidden',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {JUZUK_NAMES[juzuk - 1]}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Progress bar */}
            <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Progress Al-Quran Saya
                </span>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: cfg.color, fontWeight: 700 }}>
                  {totalJuzukDone}/30
                </span>
              </div>
              <div style={{ height: '6px', borderRadius: '100px', background: 'var(--elevated)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '100px',
                  width: `${(totalJuzukDone / 30) * 100}%`,
                  background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              {totalJuzukDone === 30 && (
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#FCD34D', marginTop: '8px', textAlign: 'center', fontWeight: 600 }}>
                  🎉 Tahniah! Anda telah khatam Al-Quran dalam halaqah ini!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab: Members */}
        {tab === 'ahli' && (
          <div style={{ animation: 'fadeUp 0.25s ease forwards', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.map(m => {
              const isMe = m.user_id === userId
              const initial = (m.profiles?.full_name ?? 'A').charAt(0).toUpperCase()
              return (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '14px',
                  background: isMe ? 'var(--elevated)' : 'var(--surface)',
                  border: `1px solid ${isMe ? 'var(--border-lit)' : 'var(--border)'}`,
                }}>
                  {m.profiles?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.profiles.avatar_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: m.role === 'ketua' ? '#FCD34D22' : 'var(--elevated)',
                      border: `1.5px solid ${m.role === 'ketua' ? '#FCD34D' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700,
                      color: m.role === 'ketua' ? '#FCD34D' : 'var(--text-secondary)',
                    }}>
                      {initial}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <p style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
                        color: 'var(--text-primary)', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.profiles?.full_name ?? 'Ahli'}
                        {isMe && <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', marginLeft: '4px' }}>(Anda)</span>}
                      </p>
                      {m.role === 'ketua' && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '2px',
                          padding: '1px 6px', borderRadius: '6px',
                          background: '#FCD34D18', color: '#FCD34D',
                          fontFamily: 'var(--font-dm-sans)', fontSize: '8px', fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          <Crown style={{ width: '8px', height: '8px' }} /> Ketua
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                      Sertai {new Date(m.joined_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '16px', fontWeight: 700, color: cfg.color }}>
                      {m.juzuk_done}
                    </span>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
                      juzuk
                    </span>
                  </div>
                </div>
              )
            })}

            {members.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Users style={{ width: '28px', height: '28px', color: 'var(--text-dim)', margin: '0 auto 10px' }} />
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)' }}>
                  Belum ada ahli
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Leaderboard */}
        {tab === 'leaderboard' && (
          <div style={{ animation: 'fadeUp 0.25s ease forwards' }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)',
              marginBottom: '14px',
            }}>
              Ranking Ahli Berdasarkan Juzuk Selesai
            </p>

            {[...members]
              .sort((a, b) => b.juzuk_done - a.juzuk_done)
              .map((m, rank) => {
                const initial = (m.profiles?.full_name ?? 'A').charAt(0).toUpperCase()
                const isMe = m.user_id === userId
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: '14px', marginBottom: '6px',
                    background: isMe ? 'var(--elevated)' : rank < 3 ? `${cfg.color}08` : 'var(--surface)',
                    border: `1px solid ${isMe ? cfg.color + '40' : rank < 3 ? cfg.color + '22' : 'var(--border)'}`,
                  }}>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>
                      {rank < 3 ? medals[rank] : rank + 1}
                    </span>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)',
                    }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.profiles?.full_name ?? 'Ahli'}
                        {isMe && <span style={{ color: 'var(--text-dim)', fontSize: '12px', marginLeft: '4px' }}>(Anda)</span>}
                      </p>
                      {/* mini progress bar */}
                      <div style={{ height: '3px', borderRadius: '100px', background: 'var(--border)', marginTop: '6px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '100px',
                          width: `${(m.juzuk_done / 30) * 100}%`,
                          background: cfg.color, transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '18px', fontWeight: 700, color: cfg.color, margin: 0 }}>
                        {m.juzuk_done}
                      </p>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>/ 30</p>
                    </div>
                  </div>
                )
              })
            }
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px',
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
  color: 'var(--text-secondary)', textAlign: 'left',
}

function LoadingState() {
  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh', padding: '80px 24px 24px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {[160, 80, 300, 200].map((h, i) => (
          <div key={i} style={{
            height: `${h}px`, borderRadius: '16px', marginBottom: '12px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            animation: 'shimmer 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
      <style>{`@keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '320px' }}>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Halaqah tidak dijumpai
        </p>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
          Halaqah ini mungkin telah dibubarkan atau tidak wujud.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onRetry} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
            borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent',
            cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)',
          }}>
            <RefreshCw style={{ width: '12px', height: '12px' }} /> Cuba Semula
          </button>
          <Link href="/halaqah" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
            borderRadius: '10px', background: 'var(--primary)', color: '#04080A',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700, textDecoration: 'none',
          }}>
            Kembali
          </Link>
        </div>
      </div>
    </div>
  )
}
