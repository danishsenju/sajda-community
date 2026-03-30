'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Users, Clock } from 'lucide-react'

const CAT_CONFIG: Record<string, { label: string; color: string; dot: string; glassStyle: React.CSSProperties }> = {
  bantuan_fizikal: {
    label: 'Bantuan Fizikal', color: '#93C5FD', dot: '#3B82F6',
    glassStyle: {
      background: 'rgba(59,130,246,0.07)',
      border: '1px solid rgba(59,130,246,0.22)',
      boxShadow: '0 1.5px 0 rgba(147,197,253,0.5) inset, 0 6px 24px rgba(59,130,246,0.1)',
    },
  },
  ilmu_tuisyen: {
    label: 'Ilmu & Tuisyen', color: '#C4B5FD', dot: '#8B5CF6',
    glassStyle: {
      background: 'rgba(139,92,246,0.07)',
      border: '1px solid rgba(139,92,246,0.22)',
      boxShadow: '0 1.5px 0 rgba(196,181,253,0.5) inset, 0 6px 24px rgba(139,92,246,0.1)',
    },
  },
  transport: {
    label: 'Transport', color: '#6EE7B7', dot: '#10B981',
    glassStyle: {
      background: 'rgba(16,185,129,0.07)',
      border: '1px solid rgba(16,185,129,0.22)',
      boxShadow: '0 1.5px 0 rgba(110,231,183,0.5) inset, 0 6px 24px rgba(16,185,129,0.1)',
    },
  },
  barangan: {
    label: 'Barangan', color: '#FCD34D', dot: '#F59E0B',
    glassStyle: {
      background: 'rgba(245,158,11,0.07)',
      border: '1px solid rgba(245,158,11,0.22)',
      boxShadow: '0 1.5px 0 rgba(252,211,77,0.5) inset, 0 6px 24px rgba(245,158,11,0.1)',
    },
  },
  lain: {
    label: 'Lain-lain', color: '#9CA3AF', dot: '#6B7280',
    glassStyle: {
      background: 'rgba(107,114,128,0.07)',
      border: '1px solid rgba(107,114,128,0.18)',
      boxShadow: '0 1.5px 0 rgba(156,163,175,0.4) inset, 0 6px 24px rgba(107,114,128,0.07)',
    },
  },
}

const CATEGORIES = [
  { key: 'semua',          label: 'Semua',           dot: '#52c97a' },
  { key: 'bantuan_fizikal',label: 'Bantuan Fizikal',  dot: '#3B82F6' },
  { key: 'ilmu_tuisyen',   label: 'Ilmu & Tuisyen',  dot: '#8B5CF6' },
  { key: 'transport',      label: 'Transport',        dot: '#10B981' },
  { key: 'barangan',       label: 'Barangan',         dot: '#F59E0B' },
  { key: 'lain',           label: 'Lain-lain',        dot: '#6B7280' },
]

export interface FollowedMosque {
  id: string
  name: string
  slug: string
}

export interface KeperluanItem {
  id: string
  title: string
  description: string
  category: string
  urgency: string
  status: string
  created_at: string
  mosque_id: string | null
  mosque_name: string | null
  keperluan_helpers: { count: number }[] | null
}

interface Props {
  items: KeperluanItem[]
  pendingItems: KeperluanItem[]
  followedMosques: FollowedMosque[]
  isLoggedIn: boolean
}

export function KeperluanClient({ items, pendingItems, followedMosques, isLoggedIn }: Props) {
  const [activeMosque,   setActiveMosque]   = useState('semua')
  const [activeCategory, setActiveCategory] = useState('semua')
  const [urgentOnly,     setUrgentOnly]     = useState(false)

  const filtered = useMemo(() => items.filter(item => {
    const matchMosque   = activeMosque   === 'semua' || item.mosque_id === activeMosque
    const matchCategory = activeCategory === 'semua' || item.category  === activeCategory
    const matchUrgent   = !urgentOnly || item.urgency === 'urgent'
    return matchMosque && matchCategory && matchUrgent
  }), [items, activeMosque, activeCategory, urgentOnly])

  const urgentCount = filtered.filter(i => i.urgency === 'urgent').length

  const mosqueInitial = (name: string) => name.replace(/^(Masjid|Surau|Musolla)\s*/i, '').charAt(0).toUpperCase()

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'var(--elevated)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Watermark */}
        <div style={{
          position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--font-jetbrains)', fontSize: '160px', fontWeight: 700,
          color: 'rgba(82,201,122,0.05)', lineHeight: 1,
          pointerEvents: 'none', userSelect: 'none', letterSpacing: '-8px',
        }}>
          {filtered.length.toString().padStart(2, '0')}
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 16px 0' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--primary)', fontWeight: 700, marginBottom: '10px',
          }}>
            // KOMUNITI
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 800, lineHeight: 1.05,
              color: 'var(--text-primary)', letterSpacing: '-0.025em',
            }}>
              Keperluan<br />
              <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Komuniti</em>
            </h1>
            <Link href="/keperluan/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 22px', borderRadius: '10px', minHeight: '48px',
              background: 'var(--primary)', color: '#04080A',
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700,
              flexShrink: 0, textDecoration: 'none', letterSpacing: '0.02em',
            }}>
              <Plus style={{ width: '13px', height: '13px' }} /> Hantar
            </Link>
          </div>

          {/* Urgent strip */}
          {urgentCount > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)',
              padding: '7px 14px', borderRadius: '6px', marginBottom: '16px',
            }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%', background: '#EF4444',
                  opacity: 0.7, animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
                }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              </span>
              <span style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700,
                color: '#FCA5A5', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {urgentCount} Keperluan Mendesak
              </span>
            </div>
          )}

          {/* ── MOSQUE FILTER CHIPS ── */}
          {followedMosques.length > 1 && (
            <div style={{
              display: 'flex', gap: '8px', overflowX: 'auto',
              paddingBottom: '12px',
            }} className="scrollbar-none">
              <button
                onClick={() => setActiveMosque('semua')}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '11px 18px', borderRadius: '100px', minHeight: '44px',
                  background: activeMosque === 'semua' ? 'var(--primary)' : 'var(--surface)',
                  border: `1px solid ${activeMosque === 'semua' ? 'var(--primary)' : 'var(--border)'}`,
                  color: activeMosque === 'semua' ? '#04080A' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: activeMosque === 'semua' ? 'rgba(0,0,0,0.15)' : 'var(--elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
                }}>🕌</span>
                Semua
              </button>

              {followedMosques.map(mosque => (
                <button
                  key={mosque.id}
                  onClick={() => setActiveMosque(mosque.id)}
                  style={{
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '11px 18px', borderRadius: '100px', minHeight: '44px',
                    background: activeMosque === mosque.id ? 'var(--primary)' : 'var(--surface)',
                    border: `1px solid ${activeMosque === mosque.id ? 'var(--primary)' : 'var(--border)'}`,
                    color: activeMosque === mosque.id ? '#04080A' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    maxWidth: '180px',
                  }}
                >
                  <span style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    background: activeMosque === mosque.id
                      ? 'rgba(0,0,0,0.15)'
                      : 'rgba(34,197,94,0.12)',
                    border: activeMosque === mosque.id
                      ? 'none'
                      : '1px solid rgba(34,197,94,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 800,
                    color: activeMosque === mosque.id ? '#04080A' : 'var(--primary)',
                  }}>
                    {mosqueInitial(mosque.name)}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {mosque.name.replace(/^(Masjid|Surau|Musolla)\s*/i, '') || mosque.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── CATEGORY FILTER TABS ── */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: 0 }} className="scrollbar-none">
            {CATEGORIES.map(({ key, label, dot }) => {
              const isActive = activeCategory === key
              return (
                <button key={key}
                  onClick={() => setActiveCategory(key)}
                  style={{
                    flexShrink: 0, padding: '14px 18px', minHeight: '48px',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
                    borderBottom: `2px solid ${isActive ? dot : 'transparent'}`,
                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                    background: 'transparent',
                    color: isActive ? dot : 'var(--text-secondary)',
                    letterSpacing: '0.02em', cursor: 'pointer',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Pending items */}
        {pendingItems.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%', background: '#F59E0B',
                  opacity: 0.7, animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
                }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
              </span>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700,
                color: '#FCD34D', letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Permohonan Anda — Menunggu Kelulusan AJK
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingItems.map((item) => {
                const cfg = CAT_CONFIG[item.category] ?? CAT_CONFIG.lain
                const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000)
                return (
                  <Link key={item.id} href={`/keperluan/${item.id}`}
                    style={{
                      display: 'block', textDecoration: 'none', borderRadius: '12px',
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.30)',
                      borderLeft: '3px solid #F59E0B',
                      padding: '14px 16px',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{
                            fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: cfg.color, padding: '2px 6px',
                            background: `${cfg.dot}15`, borderRadius: '4px',
                          }}>
                            {cfg.label}
                          </span>
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-playfair)', fontSize: '14px', fontWeight: 700,
                          color: 'var(--text-primary)', marginBottom: '3px',
                        }}>{item.title}</p>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                        color: '#FCD34D', padding: '3px 8px',
                        background: 'rgba(245,158,11,0.15)', borderRadius: '4px', flexShrink: 0,
                      }}>
                        ⏳ Dalam Semakan · {daysAgo === 0 ? 'Hari ini' : `${daysAgo}h lepas`}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />
          </div>
        )}

        {/* No followed mosques prompt */}
        {isLoggedIn && followedMosques.length === 0 && (
          <div style={{
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '2px' }}>
                Ikuti masjid untuk feed peribadi
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-dim)' }}>
                Keperluan dari masjid yang anda ikuti akan dipaparkan di sini
              </p>
            </div>
            <Link href="/senarai-masjid" style={{
              padding: '12px 20px', borderRadius: '10px', minHeight: '44px',
              background: 'var(--primary)', color: '#04080A',
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700,
              textDecoration: 'none', flexShrink: 0,
              display: 'flex', alignItems: 'center',
            }}>
              Cari Masjid
            </Link>
          </div>
        )}

        {/* Count + urgent toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-dim)' }}>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {filtered.length}
            </span>{' '}keperluan dijumpai
          </p>
          <button
            onClick={() => setUrgentOnly(u => !u)}
            aria-pressed={urgentOnly}
            style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
              padding: '11px 16px', borderRadius: '8px', cursor: 'pointer', minHeight: '44px',
              border: `1px solid ${urgentOnly ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
              color: urgentOnly ? '#FCA5A5' : 'var(--text-secondary)',
              background: urgentOnly ? 'rgba(239,68,68,0.08)' : 'transparent',
              letterSpacing: '0.04em', transition: 'all 0.15s',
            }}>
            ⚡ Mendesak Sahaja
          </button>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px', margin: '0 auto 16px',
              background: 'rgba(82,201,122,0.07)', border: '1px solid rgba(82,201,122,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '8px',
            }}>
              Tiada Keperluan
            </h2>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
              Alhamdulillah, tiada keperluan buat masa ini.
            </p>
            <Link href="/keperluan/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 24px', borderRadius: '10px', minHeight: '48px',
              background: 'var(--primary)', color: '#04080A',
              fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700,
              textDecoration: 'none',
            }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Hantar Keperluan
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {filtered.map((item) => {
              const cfg = CAT_CONFIG[item.category] ?? CAT_CONFIG.lain
              const helperCount = item.keperluan_helpers?.[0]?.count ?? 0
              const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000)

              return (
                <Link key={item.id} href={`/keperluan/${item.id}`}
                  style={{
                    display: 'block', textDecoration: 'none',
                    borderRadius: '14px', overflow: 'hidden',
                    borderLeft: `3px solid ${cfg.dot}`,
                    backdropFilter: 'blur(20px) saturate(160%)',
                    transition: 'transform 0.25s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.2s',
                    position: 'relative',
                    ...cfg.glassStyle,
                  }}
                >
                  <div style={{ padding: '18px' }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: cfg.color, padding: '2px 6px',
                        background: `${cfg.dot}15`, borderRadius: '4px',
                      }}>
                        {cfg.label}
                      </span>
                      {item.urgency === 'urgent' && (
                        <span style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: '#FCA5A5', padding: '2px 6px',
                          background: 'rgba(239,68,68,0.14)', borderRadius: '4px',
                        }}>
                          MENDESAK
                        </span>
                      )}
                      {/* Mosque badge — shown when viewing "all mosques" */}
                      {item.mosque_name && activeMosque === 'semua' && followedMosques.length > 1 && (
                        <span style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600,
                          color: 'var(--text-dim)', padding: '2px 6px',
                          background: 'rgba(255,255,255,0.06)', borderRadius: '4px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px',
                        }}>
                          🕌 {item.mosque_name.replace(/^(Masjid|Surau)\s*/i, '')}
                        </span>
                      )}
                    </div>

                    <h3 style={{
                      fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 700,
                      color: 'var(--text-primary)', marginBottom: '7px', lineHeight: 1.3,
                    }}>
                      {item.title}
                    </h3>

                    <p style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: '12px', lineHeight: 1.6,
                      color: 'var(--text-dim)', marginBottom: '14px',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {item.description}
                    </p>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: '10px', borderTop: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users style={{ width: '11px', height: '11px', color: cfg.color }} />
                        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: cfg.color, fontWeight: 600 }}>
                          {helperCount}
                        </span>
                        <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-dim)' }}>
                          nak bantu
                        </span>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-dim)',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <Clock style={{ width: '10px', height: '10px' }} />
                        {daysAgo === 0 ? 'Hari ini' : `${daysAgo}h lepas`}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
