'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'

type ImamInfo = { name: string; title: string | null }

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
type Prayer = typeof PRAYERS[number]

const PRAYER_LABELS: Record<Prayer, { bm: string; ar: string }> = {
  fajr:    { bm: 'Subuh',   ar: 'الفجر' },
  dhuhr:   { bm: 'Zohor',   ar: 'الظهر' },
  asr:     { bm: 'Asr',     ar: 'العصر' },
  maghrib: { bm: 'Maghrib', ar: 'المغرب' },
  isha:    { bm: 'Isyak',   ar: 'العشاء' },
}

const DAY_LABELS = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad']
const DAY_SHORT  = ['ISN', 'SEL', 'RAB', 'KHA', 'JUM', 'SAB', 'AHD']

function dateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function JadualImamPage() {
  const supabase = createClient()
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(new Date()))
  // schedule[date][prayer] = ImamInfo | null
  const [schedule, setSchedule] = useState<Record<string, Record<string, ImamInfo | null>>>({})
  const [loading, setLoading] = useState(true)

  const weekDates = getWeekDates(weekStart)
  const todayStr  = dateStr(new Date())

  const loadSchedule = useCallback(async () => {
    setLoading(true)
    const from = dateStr(weekDates[0])
    const to   = dateStr(weekDates[6])
    const { data } = await supabase
      .from('imam_schedule')
      .select('date, prayer, imams(name, title)')
      .gte('date', from)
      .lte('date', to)

    const map: Record<string, Record<string, ImamInfo | null>> = {}
    for (const row of (data ?? [])) {
      if (!map[row.date]) map[row.date] = {}
      map[row.date][row.prayer] = row.imams as unknown as ImamInfo | null
    }
    setSchedule(map)
    setLoading(false)
  }, [weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadSchedule() }, [loadSchedule])

  function imamDisplay(im: ImamInfo | null | undefined): string | null {
    if (!im) return null
    return im.title ? `${im.title} ${im.name}` : im.name
  }

  function prevWeek() {
    setWeekStart(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd })
  }
  function nextWeek() {
    setWeekStart(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd })
  }
  function thisWeek() {
    setWeekStart(getMondayOf(new Date()))
  }

  const hasAnyImam = weekDates.some(d =>
    PRAYERS.some(p => schedule[dateStr(d)]?.[p])
  )

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--elevated) 0%, var(--elevated) 50%, var(--void) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: 'clamp(32px, 5vw, 52px) clamp(16px, 4vw, 40px) clamp(24px, 4vw, 40px)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Geometric watermark */}
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.03, pointerEvents: 'none' }} width="320" height="200" viewBox="0 0 320 200" fill="none">
          <defs>
            <pattern id="geo2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,5 35,20 50,20 38,30 43,45 30,36 17,45 22,30 10,20 25,20" fill="none" stroke="#52c97a" strokeWidth="0.6"/>
              <rect x="20" y="20" width="20" height="20" fill="none" stroke="#52c97a" strokeWidth="0.3" transform="rotate(45 30 30)"/>
            </pattern>
          </defs>
          <rect width="320" height="200" fill="url(#geo2)"/>
        </svg>

        <div className="max-w-4xl mx-auto">
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px',
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 600,
          }}>
            Masjid Saujana Utama
          </p>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800, color: 'var(--text-primary)',
            letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '6px',
          }}>
            Jadual Imam
          </h1>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '13px',
            color: 'var(--text-dim)', lineHeight: 1.5,
          }}>
            Senarai imam yang memimpin solat berjemaah
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto" style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 32px)' }}>

        {/* Week navigation */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '24px', flexWrap: 'wrap',
        }}>
          <button
            onClick={prevWeek}
            style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
          </button>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              {weekDates[0].toLocaleDateString('ms-MY', { day: 'numeric', month: 'long' })}
              {' – '}
              {weekDates[6].toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <button
            onClick={nextWeek}
            style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>

          <button
            onClick={thisWeek}
            style={{
              padding: '7px 16px', borderRadius: '8px', flexShrink: 0,
              border: '1px solid rgba(82,201,122,0.25)', background: 'rgba(82,201,122,0.07)',
              color: '#52c97a', fontFamily: 'var(--font-jakarta)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Minggu Ini
          </button>
        </div>

        {/* ── MOBILE: card-per-day layout ── */}
        <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {weekDates.map((d, di) => {
            const ds = dateStr(d)
            const isToday = ds === todayStr
            const dayHasImam = PRAYERS.some(p => schedule[ds]?.[p])

            return (
              <div
                key={ds}
                style={{
                  borderRadius: '14px',
                  border: isToday
                    ? '1px solid rgba(82,201,122,0.25)'
                    : '1px solid var(--border)',
                  background: isToday ? 'rgba(82,201,122,0.04)' : 'var(--surface)',
                  overflow: 'hidden',
                }}
              >
                {/* Day header */}
                <div style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border)',
                  background: isToday ? 'rgba(82,201,122,0.07)' : 'var(--elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: isToday ? 'rgba(82,201,122,0.18)' : 'var(--elevated)',
                      border: isToday ? '1px solid rgba(82,201,122,0.3)' : '1px solid var(--border)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-jetbrains)', fontSize: '14px', fontWeight: 700,
                        color: isToday ? '#52c97a' : 'var(--text-primary)', lineHeight: 1,
                      }}>
                        {String(d.getDate()).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '8px',
                        color: isToday ? 'rgba(82,201,122,0.7)' : 'var(--text-dim)',
                        letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px',
                      }}>
                        {d.toLocaleDateString('ms-MY', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <p style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 700,
                        color: isToday ? '#52c97a' : 'var(--text-primary)',
                      }}>
                        {DAY_LABELS[di]}
                      </p>
                      {isToday && (
                        <p style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 600,
                          letterSpacing: '0.16em', textTransform: 'uppercase',
                          color: 'rgba(82,201,122,0.6)', marginTop: '1px',
                        }}>
                          Hari Ini
                        </p>
                      )}
                    </div>
                  </div>

                  {!dayHasImam && !loading && (
                    <span style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '10px',
                      color: 'var(--text-dim)', letterSpacing: '0.06em',
                    }}>
                      Belum ditetapkan
                    </span>
                  )}
                </div>

                {/* Prayer rows */}
                <div>
                  {PRAYERS.map((prayer, pi) => {
                    const imam = schedule[ds]?.[prayer]
                    const display = imamDisplay(imam)
                    const isJumaat = prayer === 'dhuhr' && d.getDay() === 5

                    return (
                      <div
                        key={prayer}
                        style={{
                          display: 'flex', alignItems: 'center',
                          padding: '9px 14px',
                          borderTop: pi > 0 ? '1px solid var(--border)' : 'none',
                          background: display && isToday ? 'rgba(82,201,122,0.02)' : 'transparent',
                        }}
                      >
                        <div style={{ width: '70px', flexShrink: 0 }}>
                          <p style={{
                            fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                            color: display ? 'var(--text-secondary)' : 'var(--text-dim)',
                          }}>
                            {PRAYER_LABELS[prayer].bm}
                            {isJumaat && (
                              <span style={{ marginLeft: '4px', fontSize: '9px', color: 'rgba(252,211,77,0.6)', fontWeight: 400 }}>
                                Jumaat
                              </span>
                            )}
                          </p>
                          <p style={{
                            fontFamily: 'var(--font-amiri)', fontSize: '11px',
                            color: 'var(--text-dim)', direction: 'rtl',
                          }}>
                            {PRAYER_LABELS[prayer].ar}
                          </p>
                        </div>

                        <div style={{ flex: 1, marginLeft: '12px' }}>
                          {loading ? (
                            <div style={{
                              height: '10px', width: '80px', borderRadius: '4px',
                              background: 'var(--border)',
                              animation: 'breathe 1.5s ease-in-out infinite',
                            }} />
                          ) : display ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <div style={{
                                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                background: isToday ? 'rgba(82,201,122,0.15)' : 'var(--elevated)',
                                border: isToday ? '1px solid rgba(82,201,122,0.25)' : '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <User style={{ width: '11px', height: '11px', color: isToday ? '#52c97a' : 'var(--text-dim)' }} />
                              </div>
                              <p style={{
                                fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600,
                                color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                              }}>
                                {display}
                              </p>
                            </div>
                          ) : (
                            <p style={{
                              fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                              color: 'var(--text-dim)', fontStyle: 'italic',
                            }}>
                              —
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── DESKTOP: grid table ── */}
        <div className="hidden md:block">
          <div style={{
            borderRadius: '14px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{
                    padding: '14px 20px', textAlign: 'left', width: '110px',
                    fontFamily: 'var(--font-jakarta)', fontSize: '10px',
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'var(--text-dim)', fontWeight: 600,
                    background: 'var(--surface)',
                  }}>
                    Solat
                  </th>
                  {weekDates.map((d, i) => {
                    const isToday = dateStr(d) === todayStr
                    return (
                      <th key={i} style={{
                        padding: '12px 10px', textAlign: 'center',
                        background: isToday ? 'rgba(82,201,122,0.06)' : 'transparent',
                      }}>
                        <p style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                          color: isToday ? '#52c97a' : 'var(--text-secondary)', marginBottom: '2px',
                        }}>
                          {DAY_SHORT[i]}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-jetbrains)', fontSize: '13px', fontWeight: 600,
                          color: isToday ? '#52c97a' : 'var(--text-primary)',
                        }}>
                          {String(d.getDate()).padStart(2, '0')}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '9px',
                          color: isToday ? 'rgba(82,201,122,0.5)' : 'var(--text-dim)',
                          marginTop: '1px',
                        }}>
                          {d.toLocaleDateString('ms-MY', { month: 'short' })}
                        </p>
                        {isToday && (
                          <div style={{
                            width: '4px', height: '4px', borderRadius: '50%',
                            background: '#52c97a', margin: '4px auto 0',
                            boxShadow: '0 0 6px rgba(82,201,122,0.6)',
                          }} />
                        )}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {PRAYERS.map((prayer, pi) => (
                  <tr key={prayer} style={{ borderTop: pi > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{
                      padding: '14px 20px',
                      background: 'var(--surface)',
                    }}>
                      <p style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                        fontWeight: 600, color: 'var(--text-secondary)',
                      }}>
                        {PRAYER_LABELS[prayer].bm}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-amiri)', fontSize: '12px',
                        color: 'var(--text-dim)', marginTop: '1px',
                        direction: 'rtl',
                      }}>
                        {PRAYER_LABELS[prayer].ar}
                      </p>
                    </td>
                    {weekDates.map((d, di) => {
                      const ds = dateStr(d)
                      const isToday = ds === todayStr
                      const imam = schedule[ds]?.[prayer]
                      const display = imamDisplay(imam)

                      return (
                        <td key={di} style={{
                          padding: '12px 10px', textAlign: 'center',
                          background: isToday ? 'rgba(82,201,122,0.025)' : 'transparent',
                        }}>
                          {loading ? (
                            <div style={{
                              height: '10px', width: '70px', borderRadius: '4px', margin: '0 auto',
                              background: 'var(--border)',
                              animation: 'breathe 1.5s ease-in-out infinite',
                            }} />
                          ) : display ? (
                            <div>
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                margin: '0 auto 5px',
                                background: isToday ? 'rgba(82,201,122,0.14)' : 'var(--elevated)',
                                border: isToday ? '1px solid rgba(82,201,122,0.25)' : '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <User style={{
                                  width: '13px', height: '13px',
                                  color: isToday ? '#52c97a' : 'var(--text-dim)',
                                }} />
                              </div>
                              <p style={{
                                fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 600,
                                color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                                lineHeight: 1.3,
                              }}>
                                {display}
                              </p>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '16px' }}>—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && !hasAnyImam && (
            <div style={{
              marginTop: '20px', padding: '28px', textAlign: 'center', borderRadius: '12px',
              border: '1px solid var(--border)', background: 'var(--surface)',
            }}>
              <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)' }}>
                Jadual imam belum ditetapkan untuk minggu ini.
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{
          marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#52c97a', boxShadow: '0 0 6px rgba(82,201,122,0.5)' }} />
            <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)' }}>
              Hari Ini
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User style={{ width: '12px', height: '12px', color: 'var(--text-dim)' }} />
            <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)' }}>
              Nama imam yang telah ditetapkan oleh AJK
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
