'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MapPin, Users, Calendar } from 'lucide-react'
import { formatTime } from '@/lib/utils'

const CAT_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  solat:         { label: 'Solat',         color: '#6EE7B7', dot: '#10B981' },
  kebajikan:     { label: 'Kebajikan',     color: '#93C5FD', dot: '#3B82F6' },
  ramadan:       { label: 'Ramadan',       color: '#FCD34D', dot: '#F59E0B' },
  gotong_royong: { label: 'Gotong Royong', color: '#C4B5FD', dot: '#8B5CF6' },
  umum:          { label: 'Umum',          color: '#9CA3AF', dot: '#6B7280' },
}

const MONTHS_MS = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogos','Sep','Okt','Nov','Dis']
const DAYS_MS   = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu']

function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export interface FollowedMosque {
  id: string
  name: string
  slug: string
}

export interface ProgramItem {
  id: string
  title: string
  description: string | null
  category: string
  program_date: string
  start_time: string
  end_time: string | null
  location: string | null
  needs_volunteers: boolean
  volunteer_slots: number
  image_url: string | null
  mosque_id: string | null
  mosque_name: string | null
  volunteer_signups: { id: string }[] | null
}

interface Props {
  upcoming: ProgramItem[]
  past: ProgramItem[]
  followedMosques: FollowedMosque[]
  isLoggedIn: boolean
}

const CATEGORIES = [
  { key: 'semua',         label: 'Semua',         dot: '#52c97a' },
  { key: 'ramadan',       label: 'Ramadan',        dot: '#F59E0B' },
  { key: 'kebajikan',     label: 'Kebajikan',      dot: '#3B82F6' },
  { key: 'gotong_royong', label: 'Gotong Royong',  dot: '#8B5CF6' },
  { key: 'solat',         label: 'Solat',          dot: '#10B981' },
  { key: 'umum',          label: 'Umum',           dot: '#6B7280' },
]

export function ProgramClient({ upcoming, past, followedMosques, isLoggedIn }: Props) {
  const [activeMosque,   setActiveMosque]   = useState('semua')
  const [activeCategory, setActiveCategory] = useState('semua')

  const filteredUpcoming = useMemo(() => upcoming.filter(p => {
    const matchMosque   = activeMosque   === 'semua' || p.mosque_id === activeMosque
    const matchCategory = activeCategory === 'semua' || p.category  === activeCategory
    return matchMosque && matchCategory
  }), [upcoming, activeMosque, activeCategory])

  const filteredPast = useMemo(() => past.filter(p => {
    const matchMosque   = activeMosque   === 'semua' || p.mosque_id === activeMosque
    const matchCategory = activeCategory === 'semua' || p.category  === activeCategory
    return matchMosque && matchCategory
  }), [past, activeMosque, activeCategory])

  const totalVolunteerNeeded = filteredUpcoming.filter(p => p.needs_volunteers && (p.volunteer_slots ?? 0) > 0).length

  const mosqueInitial = (name: string) => name.replace(/^(Masjid|Surau|Musolla)\s*/i, '').charAt(0).toUpperCase()

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'var(--elevated)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: '50%', pointerEvents: 'none', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        }}>
          <svg width="360" height="360" viewBox="0 0 360 360" fill="none" style={{ opacity: 0.04 }}>
            <polygon points="180,20 200,140 320,160 200,180 180,300 160,180 40,160 160,140"
              stroke="#52c97a" strokeWidth="1.5" fill="none" />
            <circle cx="180" cy="180" r="120" stroke="#52c97a" strokeWidth="0.8" fill="none" />
            <circle cx="180" cy="180" r="80" stroke="#52c97a" strokeWidth="0.5" fill="none" />
            <rect x="120" y="120" width="120" height="120" stroke="#52c97a" strokeWidth="0.5" fill="none"
              transform="rotate(45 180 180)" />
          </svg>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 16px 0' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--primary)', fontWeight: 700, marginBottom: '10px',
          }}>
            // AKTIVITI MASJID
          </p>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 800, lineHeight: 1.05,
            color: 'var(--text-primary)', letterSpacing: '-0.025em',
            marginBottom: '12px',
          }}>
            Program &amp;<br />
            <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Sukarela</em>
          </h1>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>
                {filteredUpcoming.length}
              </span>
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', marginLeft: '6px' }}>
                program akan datang
              </span>
            </div>
            {totalVolunteerNeeded > 0 && (
              <>
                <div style={{ width: '1px', background: 'var(--border)' }} />
                <div>
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '24px', fontWeight: 700, color: '#FCD34D' }}>
                    {totalVolunteerNeeded}
                  </span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', marginLeft: '6px' }}>
                    perlu sukarelawan
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── MOSQUE FILTER CHIPS ── */}
          {followedMosques.length > 1 && (
            <div style={{
              display: 'flex', gap: '8px', overflowX: 'auto',
              paddingBottom: '12px', marginBottom: '4px',
            }} className="scrollbar-none">
              {/* "Semua Masjid" chip */}
              <button
                onClick={() => setActiveMosque('semua')}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '7px 14px', borderRadius: '20px',
                  background: activeMosque === 'semua' ? 'var(--primary)' : 'var(--surface)',
                  border: `1px solid ${activeMosque === 'semua' ? 'var(--primary)' : 'var(--border)'}`,
                  color: activeMosque === 'semua' ? '#04080A' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: activeMosque === 'semua' ? 'rgba(0,0,0,0.15)' : 'var(--elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700,
                }}>🕌</span>
                Semua
              </button>

              {followedMosques.map(mosque => (
                <button
                  key={mosque.id}
                  onClick={() => setActiveMosque(mosque.id)}
                  style={{
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '7px 14px', borderRadius: '20px',
                    background: activeMosque === mosque.id ? 'var(--primary)' : 'var(--surface)',
                    border: `1px solid ${activeMosque === mosque.id ? 'var(--primary)' : 'var(--border)'}`,
                    color: activeMosque === mosque.id ? '#04080A' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    maxWidth: '160px',
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
                  <span style={{
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {mosque.name.replace(/^(Masjid|Surau|Musolla)\s*/i, '') || mosque.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── CATEGORY FILTER TABS ── */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }} className="scrollbar-none">
            {CATEGORIES.map(({ key, label, dot }) => {
              const isActive = activeCategory === key
              return (
                <button key={key}
                  onClick={() => setActiveCategory(key)}
                  style={{
                    flexShrink: 0, padding: '13px 16px',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                    borderBottom: `2px solid ${isActive ? dot : 'transparent'}`,
                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                    background: 'transparent',
                    color: isActive ? dot : 'var(--text-dim)',
                    letterSpacing: '0.02em',
                    transition: 'color 0.2s, border-color 0.2s',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                  {isActive && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
                  )}
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 16px' }}>

        {/* ── No followed mosques prompt ── */}
        {isLoggedIn && followedMosques.length === 0 && (
          <div style={{
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '12px', padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--primary)', marginBottom: '2px' }}>
                Ikuti masjid untuk feed peribadi
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-dim)' }}>
                Program dari masjid yang anda ikuti akan dipaparkan di sini
              </p>
            </div>
            <Link href="/senarai-masjid" style={{
              padding: '8px 16px', borderRadius: '8px',
              background: 'var(--primary)', color: '#04080A',
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700,
              textDecoration: 'none', flexShrink: 0,
            }}>
              Cari Masjid
            </Link>
          </div>
        )}

        {/* ── UPCOMING ── */}
        {filteredUpcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px', margin: '0 auto 16px',
              background: 'rgba(82,201,122,0.07)', border: '1px solid rgba(82,201,122,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Calendar style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '8px',
            }}>
              Tiada Program Akan Datang
            </h2>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)' }}>
              Semak semula kemudian untuk program terbaru.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <span style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)',
              }}>
                Akan Datang
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{
                fontFamily: 'var(--font-jetbrains)', fontSize: '12px', fontWeight: 600,
                color: 'var(--primary)', background: 'rgba(34,197,94,0.1)',
                padding: '3px 10px', borderRadius: '4px',
              }}>
                {filteredUpcoming.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredUpcoming.map((program, i) => {
                const d = parseDate(program.program_date)
                const signups = Array.isArray(program.volunteer_signups) ? program.volunteer_signups.length : 0
                const slots = program.volunteer_slots ?? 0
                const slotsFull = slots > 0 && signups >= slots
                const pct = slots > 0 ? Math.min((signups / slots) * 100, 100) : 0
                const cfg = CAT_CONFIG[program.category] ?? CAT_CONFIG.umum
                const isFirst = i === 0
                const ordinal = String(i + 1).padStart(2, '0')

                return (
                  <Link key={program.id} href={`/program/${program.id}`}
                    style={{
                      display: 'flex', textDecoration: 'none',
                      background: isFirst ? 'var(--elevated)' : 'var(--surface)',
                      border: `1px solid ${isFirst ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                      boxShadow: `inset 3px 0 0 ${isFirst ? 'var(--primary)' : cfg.dot}`,
                      borderRadius: '12px', overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Date column */}
                    <div style={{
                      width: '68px', flexShrink: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '16px 6px',
                      borderRight: '1px solid var(--border)',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', fontFamily: 'var(--font-jetbrains)',
                        fontSize: '48px', fontWeight: 700, lineHeight: 1,
                        color: 'var(--border)', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
                      }}>
                        {ordinal}
                      </div>
                      <div style={{
                        background: 'var(--elevated)', borderRadius: '8px',
                        padding: '5px 7px', textAlign: 'center', position: 'relative',
                      }}>
                        <p style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          color: isFirst ? 'var(--primary)' : 'var(--text-dim)', marginBottom: '2px',
                        }}>
                          {MONTHS_MS[d.getMonth()]}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-jetbrains)', fontSize: '20px', fontWeight: 700,
                          color: isFirst ? 'var(--primary)' : 'var(--text-secondary)', lineHeight: 1,
                        }}>
                          {d.getDate()}
                        </p>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                          {DAYS_MS[d.getDay()]}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '5px', alignItems: 'center' }}>
                            <span style={{
                              fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                              letterSpacing: '0.1em', textTransform: 'uppercase',
                              color: cfg.color, padding: '2px 6px',
                              background: `${cfg.dot}15`, borderRadius: '4px',
                            }}>
                              {cfg.label}
                            </span>
                            {/* Mosque badge */}
                            {program.mosque_name && activeMosque === 'semua' && (
                              <span style={{
                                fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600,
                                color: 'var(--text-dim)', padding: '2px 6px',
                                background: 'var(--elevated)', borderRadius: '4px', border: '1px solid var(--border)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px',
                              }}>
                                🕌 {program.mosque_name.replace(/^(Masjid|Surau)\s*/i, '')}
                              </span>
                            )}
                          </div>
                          <h3 style={{
                            fontFamily: 'var(--font-playfair)', fontSize: isFirst ? '18px' : '15px',
                            fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25,
                          }}>
                            {program.title}
                          </h3>
                        </div>
                        {isFirst && (
                          <span style={{
                            fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--primary)', padding: '3px 8px',
                            background: 'rgba(34,197,94,0.12)', borderRadius: '6px', flexShrink: 0,
                          }}>
                            Seterusnya
                          </span>
                        )}
                      </div>

                      {program.description && (
                        <p style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '12px', lineHeight: 1.6,
                          color: 'var(--text-dim)', marginBottom: '8px',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {program.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {formatTime(program.start_time)}
                          {program.end_time && ` — ${formatTime(program.end_time)}`}
                        </span>
                        {program.location && (
                          <span style={{
                            fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)',
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}>
                            <MapPin style={{ width: '10px', height: '10px' }} />
                            {program.location}
                          </span>
                        )}
                      </div>

                      {program.needs_volunteers && slots > 0 && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{
                              fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                              color: slotsFull ? 'var(--text-dim)' : '#FCD34D',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                              <Users style={{ width: '10px', height: '10px' }} />
                              <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700 }}>
                                {signups}/{slots}
                              </span>
                              {' '}sukarelawan
                              {!slotsFull && ` · ${slots - signups} lagi`}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                              color: slotsFull ? 'var(--text-dim)' : '#FCD34D',
                              padding: '2px 8px', borderRadius: '4px',
                              background: slotsFull ? 'var(--border)' : 'rgba(245,158,11,0.12)',
                            }}>
                              {slotsFull ? 'Penuh' : 'Daftar →'}
                            </span>
                          </div>
                          <div style={{ height: '3px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '2px', width: `${pct}%`,
                              background: slotsFull ? 'var(--text-dim)' : 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {program.image_url && (
                      <div style={{
                        width: isFirst ? '120px' : '90px', flexShrink: 0,
                        position: 'relative', overflow: 'hidden',
                        borderLeft: '1px solid var(--border)',
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={program.image_url} alt={program.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to right, rgba(0,0,0,0.15), transparent)',
                        }} />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* ── PAST ── */}
        {filteredPast.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <span style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)',
              }}>
                Program Lalu
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
              {filteredPast.map((program) => {
                const d = parseDate(program.program_date)
                const cfg = CAT_CONFIG[program.category] ?? CAT_CONFIG.umum
                return (
                  <div key={program.id} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '12px', opacity: 0.5,
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-jetbrains)', fontSize: '12px',
                      color: cfg.color, marginBottom: '4px',
                    }}>
                      {d.getDate()} {MONTHS_MS[d.getMonth()]} {d.getFullYear()}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-playfair)', fontSize: '13px', fontWeight: 600,
                      color: 'var(--text-secondary)',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {program.title}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
