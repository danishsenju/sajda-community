'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Building2, MapPin, Calendar, Megaphone, ChevronRight,
  Plus, CheckCircle2, Star, Trash2, LogIn,
} from 'lucide-react'
import {
  useActiveMosque,
  setActiveMosqueStore,
  type ActiveMosque,
} from '@/hooks/useActiveMosque'

interface MosqueData {
  id:         string
  name:       string
  slug:       string
  state:      string | null
  address:    string | null
  category:   string
  logo_url:   string | null
  jakim_zone: string | null
}

interface Props {
  followed: MosqueData[]
  statsMap: Record<string, { programs: number; announcements: number }>
}

const CAT: Record<string, string> = {
  masjid: 'Masjid', surau: 'Surau', musolla: 'Musolla',
}

function MosqueInitial({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.27,
      background: 'rgba(34,197,94,0.12)',
      border: '1px solid rgba(34,197,94,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontFamily: 'var(--font-playfair)',
      fontSize: size * 0.38,
      fontWeight: 700,
      color: '#22C55E',
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function MasjidSayaClient({ followed, statsMap }: Props) {
  const router = useRouter()
  const { active, setMosque } = useActiveMosque()
  const [unfollowing, setUnfollowing] = useState<string | null>(null)
  const [localFollowed, setLocalFollowed] = useState(followed)

  // On first load — if no active mosque set and user follows mosques, auto-set first one
  useEffect(() => {
    if (!active && localFollowed.length > 0) {
      const first = localFollowed[0]
      setActiveMosqueStore({ id: first.id, name: first.name, slug: first.slug, state: first.state })
    }
  }, []) // eslint-disable-line

  async function handleUnfollow(mosque: MosqueData) {
    setUnfollowing(mosque.id)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUnfollowing(null); return }

    const db = supabase as any
    await db.from('mosque_follows').delete()
      .eq('mosque_id', mosque.id)
      .eq('user_id', user.id)

    const updated = localFollowed.filter(m => m.id !== mosque.id)
    setLocalFollowed(updated)

    // If unfollowed the active mosque, switch to next one
    if (active?.id === mosque.id) {
      if (updated.length > 0) {
        const next = updated[0]
        setActiveMosqueStore({ id: next.id, name: next.name, slug: next.slug, state: next.state })
      } else {
        import('@/hooks/useActiveMosque').then(m => m.clearActiveMosque())
      }
    }
    setUnfollowing(null)
    router.refresh()
  }

  function handleSetActive(mosque: MosqueData) {
    setMosque({ id: mosque.id, name: mosque.name, slug: mosque.slug, state: mosque.state })
  }

  const activeMosqueData = localFollowed.find(m => m.id === active?.id) ?? localFollowed[0] ?? null
  const otherMosques     = localFollowed.filter(m => m.id !== activeMosqueData?.id)

  // ── Empty state ──────────────────────────────────────────────────────────
  if (localFollowed.length === 0) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--void)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 24px', textAlign: 'center',
        paddingBottom: '100px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Building2 style={{ width: 32, height: 32, color: 'rgba(34,197,94,0.5)' }} />
        </div>
        <h2 style={{
          fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: 8,
        }}>
          Belum ikuti mana-mana masjid
        </h2>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: 14,
          color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 28, maxWidth: 280,
        }}>
          Ikuti masjid berdekatan anda untuk terima pengumuman, program & waktu solat.
        </p>
        <Link href="/senarai-masjid" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 12,
          background: 'var(--primary)', color: '#04080A',
          fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 14,
          textDecoration: 'none',
        }}>
          <Plus size={16} />
          Cari Masjid
        </Link>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--void)',
      paddingBottom: 120,
    }}>

      {/* ── Page header ── */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--text-dim)', marginBottom: 6,
        }}>
          Masjid Saya
        </p>
        <h1 style={{
          fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700,
          color: 'var(--text-primary)', lineHeight: 1.2,
        }}>
          {localFollowed.length} Masjid Diikuti
        </h1>
      </div>

      {/* ══ ACTIVE MOSQUE — featured hero card ══════════════════════════════ */}
      {activeMosqueData && (() => {
        const stats = statsMap[activeMosqueData.id] ?? { programs: 0, announcements: 0 }
        return (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              background: 'var(--surface)',
              border: '1px solid rgba(34,197,94,0.2)',
              boxShadow: '0 0 40px rgba(34,197,94,0.07)',
              position: 'relative',
            }}>
              {/* Green gradient top band */}
              <div style={{
                height: 6,
                background: 'linear-gradient(90deg, #22C55E, #10B981, #059669)',
              }} />

              {/* Subtle mesh background */}
              <div style={{
                position: 'absolute', inset: 0, top: 6,
                background: 'radial-gradient(ellipse at 80% 0%, rgba(34,197,94,0.06) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />

              <div style={{ padding: '18px 18px 20px', position: 'relative' }}>

                {/* Active badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 100,
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  marginBottom: 14,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#22C55E',
                    boxShadow: '0 0 6px #22C55E',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 700,
                    color: '#22C55E', letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    Masjid Aktif
                  </span>
                </div>

                {/* Mosque identity */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <MosqueInitial name={activeMosqueData.name} size={52} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{
                      fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700,
                      color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 4,
                    }}>
                      {activeMosqueData.name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin style={{ width: 12, height: 12, color: 'var(--text-dim)', flexShrink: 0 }} />
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: 12,
                        color: 'var(--text-dim)',
                      }}>
                        {activeMosqueData.state ?? activeMosqueData.address ?? '—'}
                      </span>
                      {activeMosqueData.jakim_zone && (
                        <span style={{
                          marginLeft: 4, padding: '2px 7px', borderRadius: 6,
                          background: 'rgba(34,197,94,0.1)',
                          fontFamily: 'var(--font-dm-sans)', fontSize: 10, fontWeight: 700,
                          color: '#22C55E', letterSpacing: '0.06em',
                        }}>
                          {activeMosqueData.jakim_zone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats strip */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 10, marginBottom: 16,
                }}>
                  {[
                    { Icon: Calendar,  label: 'Program Akan Datang', value: stats.programs,      color: '#F59E0B' },
                    { Icon: Megaphone, label: 'Pengumuman',           value: stats.announcements, color: '#60A5FA' },
                  ].map(({ Icon, label, value, color }) => (
                    <div key={label} style={{
                      padding: '12px 14px', borderRadius: 12,
                      background: 'var(--elevated)',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Icon style={{ width: 13, height: 13, color }} />
                        <span style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: 10,
                          color: 'var(--text-dim)', fontWeight: 600,
                          letterSpacing: '0.05em', textTransform: 'uppercase',
                        }}>
                          {label}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-jetbrains)', fontSize: 22, fontWeight: 700,
                        color: 'var(--text-primary)', lineHeight: 1,
                      }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link
                    href={`/${activeMosqueData.slug}`}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 6,
                      padding: '11px 0', borderRadius: 12,
                      background: 'var(--primary)', color: '#04080A',
                      fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 13,
                      textDecoration: 'none',
                    }}
                  >
                    Lihat Masjid
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    href={`/${activeMosqueData.slug}/program`}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 6,
                      padding: '11px 0', borderRadius: 12,
                      background: 'var(--elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13,
                      textDecoration: 'none',
                    }}
                  >
                    <Calendar size={13} />
                    Program
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ══ OTHER FOLLOWED MOSQUES ══════════════════════════════════════════ */}
      {otherMosques.length > 0 && (
        <div style={{ padding: '28px 20px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}>
              Masjid Lain Diikuti
            </p>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--border), transparent)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {otherMosques.map(mosque => {
              const stats = statsMap[mosque.id] ?? { programs: 0, announcements: 0 }
              return (
                <div
                  key={mosque.id}
                  style={{
                    borderRadius: 16,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    padding: '14px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <MosqueInitial name={mosque.name} size={44} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/${mosque.slug}`}
                      style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 700,
                        color: 'var(--text-primary)', textDecoration: 'none',
                        display: 'block', marginBottom: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {mosque.name}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: 11,
                        color: 'var(--text-dim)',
                      }}>
                        {mosque.state ?? '—'}
                      </span>
                      {stats.programs > 0 && (
                        <span style={{
                          padding: '2px 7px', borderRadius: 100,
                          background: 'rgba(245,158,11,0.12)',
                          fontFamily: 'var(--font-dm-sans)', fontSize: 10, fontWeight: 700,
                          color: '#F59E0B',
                        }}>
                          {stats.programs} program
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleSetActive(mosque)}
                      title="Jadikan Masjid Aktif"
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      <Star style={{ width: 15, height: 15, color: '#22C55E' }} />
                    </button>
                    <button
                      onClick={() => handleUnfollow(mosque)}
                      disabled={unfollowing === mosque.id}
                      title="Berhenti Ikut"
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: unfollowing === mosque.id ? 'not-allowed' : 'pointer',
                        opacity: unfollowing === mosque.id ? 0.5 : 1,
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 style={{ width: 14, height: 14, color: '#EF4444' }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ══ UNFOLLOW ACTIVE MOSQUE option ═══════════════════════════════════ */}
      {activeMosqueData && (
        <div style={{ padding: '16px 20px 0' }}>
          <button
            onClick={() => handleUnfollow(activeMosqueData)}
            disabled={unfollowing === activeMosqueData.id}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 12,
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.18)',
              color: 'rgba(239,68,68,0.6)',
              fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 7,
              opacity: unfollowing === activeMosqueData.id ? 0.5 : 1,
            }}
          >
            <Trash2 size={13} />
            Berhenti Ikut {activeMosqueData.name}
          </button>
        </div>
      )}

      {/* ══ ADD MOSQUE CTA ════════════════════════════════════════════════ */}
      <div style={{ padding: '24px 20px 0' }}>
        <Link
          href="/senarai-masjid"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 0', borderRadius: 14,
            background: 'var(--surface)',
            border: '1px dashed rgba(34,197,94,0.25)',
            color: '#22C55E',
            fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 14,
            textDecoration: 'none', transition: 'background 0.15s',
          }}
        >
          <Plus size={16} />
          Cari &amp; Ikuti Masjid Baru
        </Link>
      </div>

    </div>
  )
}
