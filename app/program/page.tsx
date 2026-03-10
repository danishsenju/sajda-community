export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
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

export default async function ProgramPage({
  searchParams,
}: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })

  let upcomingQuery = supabase
    .from('programs')
    .select('id, title, description, category, program_date, start_time, end_time, location, needs_volunteers, volunteer_slots, image_url, volunteer_signups(id)')
    .eq('is_published', true)
    .gte('program_date', today)
    .order('program_date', { ascending: true })

  let pastQuery = supabase
    .from('programs')
    .select('id, title, category, program_date')
    .eq('is_published', true)
    .lt('program_date', today)
    .order('program_date', { ascending: false })
    .limit(6)

  type ProgramCategory = 'solat' | 'kebajikan' | 'ramadan' | 'gotong_royong' | 'umum'
  if (params.category && params.category !== 'semua') {
    const cat = params.category as ProgramCategory
    upcomingQuery = upcomingQuery.eq('category', cat)
    pastQuery = pastQuery.eq('category', cat)
  }

  const [{ data: upcoming }, { data: past }] = await Promise.all([upcomingQuery, pastQuery])

  const upcomingList = upcoming ?? []
  const pastList = past ?? []
  const activeCategory = params.category ?? 'semua'
  const totalVolunteerNeeded = upcomingList.filter((p: any) => p.needs_volunteers && (p.volunteer_slots ?? 0) > 0).length

  const categories = [
    { key: 'semua', label: 'Semua', dot: '#52c97a' },
    { key: 'ramadan', label: 'Ramadan', dot: '#F59E0B' },
    { key: 'kebajikan', label: 'Kebajikan', dot: '#3B82F6' },
    { key: 'gotong_royong', label: 'Gotong Royong', dot: '#8B5CF6' },
    { key: 'solat', label: 'Solat', dot: '#10B981' },
  ]

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'var(--elevated)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Geometric watermark */}
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

        <div className="max-w-5xl mx-auto" style={{ padding: '40px 24px 0' }}>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: '#52c97a', fontWeight: 700, marginBottom: '14px',
          }}>
            // AKTIVITI MASJID
          </p>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 800, lineHeight: 1.05,
            color: 'var(--text-primary)', letterSpacing: '-0.025em',
            marginBottom: '12px',
          }}>
            Program &amp;<br />
            <em style={{ color: '#52c97a', fontStyle: 'italic' }}>Sukarela</em>
          </h1>

          {/* Stats strip */}
          {(upcomingList.length > 0 || totalVolunteerNeeded > 0) && (
            <div style={{ display: 'flex', gap: '28px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '28px', fontWeight: 700, color: '#52c97a' }}>
                  {upcomingList.length}
                </span>
                <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)', marginLeft: '6px' }}>
                  program akan datang
                </span>
              </div>
              {totalVolunteerNeeded > 0 && (
                <>
                  <div style={{ width: '1px', background: 'var(--border)' }} />
                  <div>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '28px', fontWeight: 700, color: '#FCD34D' }}>
                      {totalVolunteerNeeded}
                    </span>
                    <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)', marginLeft: '6px' }}>
                      perlu sukarelawan
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }} className="scrollbar-none">
            {categories.map(({ key, label, dot }) => {
              const isActive = activeCategory === key
              return (
                <Link key={key} href={`/program?category=${key}`}
                  style={{
                    flexShrink: 0, padding: '13px 16px',
                    fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                    borderBottom: `2px solid ${isActive ? dot : 'transparent'}`,
                    color: isActive ? dot : 'var(--text-dim)',
                    textDecoration: 'none', letterSpacing: '0.02em',
                    transition: 'color 0.2s, border-color 0.2s',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                  {isActive && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
                  )}
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto" style={{ padding: '32px 24px' }}>

        {/* ── UPCOMING ── */}
        {upcomingList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '12px', margin: '0 auto 20px',
              background: 'rgba(82,201,122,0.07)', border: '1px solid rgba(82,201,122,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Calendar style={{ width: '26px', height: '26px', color: '#52c97a' }} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '22px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '10px',
            }}>
              Tiada Program Akan Datang
            </h2>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', color: 'var(--text-dim)' }}>
              Semak semula kemudian untuk program terbaru.
            </p>
          </div>
        ) : (
          <>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)',
              }}>
                Akan Datang
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{
                fontFamily: 'var(--font-jetbrains)', fontSize: '11px', fontWeight: 600,
                color: '#52c97a', background: 'rgba(82,201,122,0.1)',
                padding: '3px 10px', borderRadius: '4px',
              }}>
                {upcomingList.length}
              </span>
            </div>

            {/* Program list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingList.map((program: any, i: number) => {
                const d = parseDate(program.program_date)
                const signupsArr = program.volunteer_signups as unknown as { id: string }[] | null
                const signups = Array.isArray(signupsArr) ? signupsArr.length : 0
                const slots = program.volunteer_slots ?? 0
                const slotsFull = slots > 0 && signups >= slots
                const pct = slots > 0 ? Math.min((signups / slots) * 100, 100) : 0
                const cfg = CAT_CONFIG[program.category] ?? CAT_CONFIG.umum
                const isFirst = i === 0
                const ordinal = String(i + 1).padStart(2, '0')

                return (
                  <Link key={program.id} href={`/program/${program.id}`}
                    style={{
                      display: 'flex', gap: '0', textDecoration: 'none',
                      background: isFirst ? 'var(--elevated)' : 'var(--surface)',
                      border: `1px solid ${isFirst ? 'rgba(82,201,122,0.25)' : 'var(--border)'}`,
                      boxShadow: `inset 3px 0 0 ${isFirst ? '#52c97a' : cfg.dot}`,
                      borderRadius: '12px', overflow: 'hidden',
                      transition: 'border-color 0.2s',
                      position: 'relative',
                    }}
                  >
                    {/* Ordinal column */}
                    <div style={{
                      width: '72px', flexShrink: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '20px 8px',
                      borderRight: '1px solid var(--border)',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {/* Big ordinal watermark */}
                      <div style={{
                        position: 'absolute', fontFamily: 'var(--font-jetbrains)',
                        fontSize: '52px', fontWeight: 700, lineHeight: 1,
                        color: 'var(--border)', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
                      }}>
                        {ordinal}
                      </div>
                      <div style={{
                        background: 'var(--elevated)', borderRadius: '8px',
                        padding: '6px 8px', textAlign: 'center', position: 'relative',
                      }}>
                        <p style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          color: isFirst ? '#52c97a' : 'var(--text-dim)',
                          marginBottom: '2px',
                        }}>
                          {MONTHS_MS[d.getMonth()]}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-jetbrains)', fontSize: '22px', fontWeight: 700,
                          color: isFirst ? '#52c97a' : 'var(--text-secondary)', lineHeight: 1,
                        }}>
                          {d.getDate()}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '9px',
                          color: 'var(--text-dim)', marginTop: '2px',
                        }}>
                          {DAYS_MS[d.getDay()]}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '18px 20px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                        <div style={{ flex: 1 }}>
                          {/* Category badge */}
                          <span style={{
                            fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: cfg.color, padding: '2px 7px',
                            background: `${cfg.dot}15`, borderRadius: '4px',
                            display: 'inline-block', marginBottom: '6px',
                          }}>
                            {cfg.label}
                          </span>
                          <h3 style={{
                            fontFamily: 'var(--font-playfair)', fontSize: isFirst ? '20px' : '16px',
                            fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25,
                          }}>
                            {program.title}
                          </h3>
                        </div>
                        {isFirst && (
                          <span style={{
                            fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: '#52c97a', padding: '4px 10px',
                            background: 'rgba(82,201,122,0.12)', borderRadius: '6px', flexShrink: 0,
                          }}>
                            Seterusnya
                          </span>
                        )}
                      </div>

                      {program.description && (
                        <p style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '13px', lineHeight: 1.6,
                          color: 'var(--text-dim)', marginBottom: '10px',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {program.description}
                        </p>
                      )}

                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'var(--font-jetbrains)', fontSize: '12px',
                          color: 'var(--text-secondary)',
                        }}>
                          {formatTime(program.start_time)}
                          {program.end_time && ` — ${formatTime(program.end_time)}`}
                        </span>
                        {program.location && (
                          <span style={{
                            fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                            color: 'var(--text-dim)',
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}>
                            <MapPin style={{ width: '11px', height: '11px' }} />
                            {program.location}
                          </span>
                        )}
                      </div>

                      {/* Volunteer bar */}
                      {program.needs_volunteers && slots > 0 && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{
                              fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 600,
                              color: slotsFull ? 'var(--text-dim)' : '#FCD34D',
                              display: 'flex', alignItems: 'center', gap: '5px',
                            }}>
                              <Users style={{ width: '11px', height: '11px' }} />
                              <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700 }}>
                                {signups}/{slots}
                              </span>
                              {' '}sukarelawan
                              {!slotsFull && ` · ${slots - signups} lagi`}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                              color: slotsFull ? 'var(--text-dim)' : '#FCD34D',
                              padding: '2px 8px', borderRadius: '4px',
                              background: slotsFull ? 'var(--border)' : 'rgba(245,158,11,0.12)',
                            }}>
                              {slotsFull ? 'Penuh' : 'Daftar →'}
                            </span>
                          </div>
                          <div style={{ height: '3px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '2px',
                              width: `${pct}%`,
                              background: slotsFull
                                ? 'var(--text-dim)'
                                : 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image thumbnail */}
                    {program.image_url && (
                      <div style={{
                        width: isFirst ? '140px' : '100px',
                        flexShrink: 0,
                        position: 'relative', overflow: 'hidden',
                        borderLeft: '1px solid var(--border)',
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={program.image_url}
                          alt={program.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
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

        {/* ── PAST PROGRAMS ── */}
        {pastList.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)',
              }}>
                Program Lalu
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {pastList.map((program: any) => {
                const d = parseDate(program.program_date)
                const cfg = CAT_CONFIG[program.category] ?? CAT_CONFIG.umum
                return (
                  <div key={program.id} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '14px', opacity: 0.5,
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-jetbrains)', fontSize: '11px',
                      color: cfg.color, marginBottom: '5px',
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
