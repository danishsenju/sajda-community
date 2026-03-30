'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CalendarDays, Star, Moon } from 'lucide-react'

/* ── Malaysia timezone offset = UTC+8 ─────────────────────────────────── */
function getMalaysiaDate(): Date {
  const now = new Date()
  // Adjust to Malaysia time (UTC+8)
  return new Date(now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60000)
}

/* ── Islamic events for Hijri months (day: label) ──────────────────────── */
const ISLAMIC_EVENTS: Record<number, Record<number, { label: string; type: 'holiday' | 'special' | 'info' }>> = {
  1: {  // Muharram
    1:  { label: 'Awal Muharram', type: 'holiday' },
    10: { label: 'Hari Asyura', type: 'special' },
  },
  2: {  // Safar
  },
  3: {  // Rabiul Awwal
    12: { label: 'Maulidur Rasul ﷺ', type: 'holiday' },
  },
  7: {  // Rejab
    27: { label: 'Isra\' & Mi\'raj', type: 'special' },
  },
  8: {  // Syaaban
    15: { label: 'Nisfu Syaaban', type: 'info' },
  },
  9: {  // Ramadan
    1:  { label: 'Awal Ramadan', type: 'holiday' },
    17: { label: 'Nuzul Quran', type: 'holiday' },
    27: { label: 'Lailatul Qadr (est.)', type: 'special' },
  },
  10: { // Syawal
    1:  { label: 'Hari Raya Aidilfitri', type: 'holiday' },
    2:  { label: 'Hari Raya Aidilfitri (2)', type: 'holiday' },
  },
  12: { // Zulhijjah
    1:  { label: 'Awal Zulhijjah', type: 'info' },
    9:  { label: 'Hari Arafah', type: 'special' },
    10: { label: 'Hari Raya Aidiladha', type: 'holiday' },
    11: { label: 'Hari Raya Aidiladha (2)', type: 'holiday' },
    18: { label: 'Hari Raya Haji (Malaysia)', type: 'holiday' },
  },
}

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiul Awwal', 'Rabiul Akhir',
  'Jamadil Awwal', 'Jamadil Akhir', 'Rejab', 'Syaaban',
  'Ramadan', 'Syawal', 'Zulkaedah', 'Zulhijjah',
]

const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'رَبِيع الأَوَّل', 'رَبِيع الآخِر',
  'جُمَادَى الأُولَى', 'جُمَادَى الآخِرَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو الْقَعْدَة', 'ذُو الْحِجَّة',
]

const DAYS_SHORT = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab']

type DayData = {
  gregorian: { day: string; month: { number: string }; year: string; weekday: { name: string } }
  hijri: { day: string; month: { number: string; en: string }; year: string }
}

type CalendarData = {
  code: number
  data: DayData[]
}

export default function HijriCalendarPage() {
  const malaysiaToday = getMalaysiaDate()

  const [gregMonth, setGregMonth] = useState(malaysiaToday.getMonth() + 1)  // 1-12
  const [gregYear,  setGregYear]  = useState(malaysiaToday.getFullYear())
  const [calData,   setCalData]   = useState<DayData[] | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [todayHijri, setTodayHijri] = useState<{ day: string; month: string; year: string } | null>(null)

  const fetchCalendar = useCallback(async (month: number, year: number) => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}?latitude=3.1716&longitude=101.5344&method=11`,
        { next: { revalidate: 3600 } }
      )
      const json: CalendarData = await res.json()
      if (json.code === 200 && json.data) {
        setCalData(json.data)
        // Find today's Hijri date
        const todayGregDay = String(malaysiaToday.getDate())
        const todayEntry = json.data.find(d => d.gregorian.day === todayGregDay)
        if (todayEntry && month === malaysiaToday.getMonth() + 1 && year === malaysiaToday.getFullYear()) {
          setTodayHijri({
            day: todayEntry.hijri.day,
            month: todayEntry.hijri.month.en,
            year: todayEntry.hijri.year,
          })
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCalendar(gregMonth, gregYear)
  }, [gregMonth, gregYear, fetchCalendar])

  function prevMonth() {
    if (gregMonth === 1) { setGregMonth(12); setGregYear(y => y - 1) }
    else setGregMonth(m => m - 1)
  }

  function nextMonth() {
    if (gregMonth === 12) { setGregMonth(1); setGregYear(y => y + 1) }
    else setGregMonth(m => m + 1)
  }

  // Build calendar grid
  const firstDay = calData?.[0]
  const startDayOfWeek = firstDay
    ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
        .indexOf(firstDay.gregorian.weekday.name)
    : 0

  // Group events for this month's Hijri months
  const hijriMonthsInView = calData
    ? [...new Set(calData.map(d => parseInt(d.hijri.month.number)))]
    : []

  const eventBadges = hijriMonthsInView.flatMap(mNum => {
    const monthEvents = ISLAMIC_EVENTS[mNum] ?? {}
    return Object.entries(monthEvents).map(([day, ev]) => ({
      hijriDay: parseInt(day),
      hijriMonth: mNum,
      ...ev,
    }))
  })

  // Find Greg day for a hijri event in this calendar view
  function getGregDayForHijri(hijriDay: number, hijriMonth: number): number | null {
    if (!calData) return null
    const found = calData.find(d =>
      parseInt(d.hijri.day) === hijriDay &&
      parseInt(d.hijri.month.number) === hijriMonth
    )
    return found ? parseInt(found.gregorian.day) : null
  }

  // Display state for the header
  const displayHijriMonth = calData?.[14]  // mid-month = most likely dominant Hijri month
  const hijriMonthNum = displayHijriMonth ? parseInt(displayHijriMonth.hijri.month.number) : 0
  const hijriYear = displayHijriMonth?.hijri.year ?? '—'

  const gregMonthName = new Date(gregYear, gregMonth - 1, 1).toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--elevated) 0%, var(--void) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Islamic Geometric Background */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hijri-geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,4 76,20 76,60 40,76 4,60 4,20"
                  fill="none" stroke="#22C55E" strokeWidth="0.7"/>
                <polygon points="40,14 66,26 66,54 40,66 14,54 14,26"
                  fill="none" stroke="#22C55E" strokeWidth="0.4"/>
                <circle cx="40" cy="40" r="6" fill="none" stroke="#22C55E" strokeWidth="0.4"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hijri-geo)"/>
          </svg>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Back link */}
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none',
            marginBottom: '28px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            Utama
          </Link>

          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Moon style={{ width: '14px', height: '14px', color: '#22C55E' }} />
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
              fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#22C55E',
            }}>
              Kalendar Hijri
            </span>
          </div>

          {/* Today's Hijri date — big display */}
          {todayHijri && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                color: 'var(--text-dim)',
                direction: 'rtl',
                marginBottom: '6px',
              }}>
                {HIJRI_MONTHS_AR[HIJRI_MONTHS.findIndex(m => m.toLowerCase() === todayHijri.month.toLowerCase())] ?? todayHijri.month}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: 'clamp(3rem, 8vw, 5rem)',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#22C55E',
                  letterSpacing: '-0.04em',
                }}>
                  {todayHijri.day}
                </span>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0, lineHeight: 1.1,
                  }}>
                    {todayHijri.month}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}>
                    {todayHijri.year} H
                  </p>
                </div>
              </div>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                color: 'var(--text-dim)', marginTop: '8px',
              }}>
                {malaysiaToday.toLocaleDateString('ms-MY', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })} · Masa Malaysia (UTC+8)
              </p>
            </div>
          )}

          {/* Events this month */}
          {eventBadges.length > 0 && calData && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {eventBadges.map((ev, i) => {
                const gregDay = getGregDayForHijri(ev.hijriDay, ev.hijriMonth)
                if (!gregDay) return null
                const color = ev.type === 'holiday' ? '#22C55E' : ev.type === 'special' ? '#F59E0B' : '#3B82F6'
                const bg = ev.type === 'holiday' ? 'rgba(34,197,94,0.10)' : ev.type === 'special' ? 'rgba(245,158,11,0.10)' : 'rgba(59,130,246,0.10)'
                return (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '100px',
                    background: bg, border: `1px solid ${color}44`,
                    fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                    color,
                  }}>
                    <Star style={{ width: '8px', height: '8px' }} />
                    {ev.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── CALENDAR ── */}
      <div className="cal-outer" style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Month navigation */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px', gap: '16px',
        }}>
          <button
            onClick={prevMonth}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700,
              color: 'var(--text-primary)', margin: 0,
            }}>
              {HIJRI_MONTHS_AR[hijriMonthNum - 1] && (
                <span style={{ display: 'block', fontFamily: 'var(--font-amiri)', fontSize: '20px', color: 'rgba(34,197,94,0.7)', marginBottom: '2px' }}>
                  {HIJRI_MONTHS_AR[hijriMonthNum - 1]}
                </span>
              )}
              {HIJRI_MONTHS[hijriMonthNum - 1] ?? '—'} {hijriYear} H
            </p>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
              color: 'var(--text-dim)', margin: '4px 0 0',
            }}>
              {gregMonthName}
            </p>
          </div>

          <button
            onClick={nextMonth}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Calendar grid */}
        <div style={{
          background: 'var(--surface)', borderRadius: '16px',
          border: '1px solid var(--border)', overflow: 'hidden',
        }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {DAYS_SHORT.map((d, i) => (
              <div key={d} style={{
                padding: '10px 4px',
                textAlign: 'center',
                fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(9px, 2vw, 10px)',
                fontWeight: 700, letterSpacing: '0.04em',
                color: i === 5 ? '#22C55E' : 'var(--text-dim)',
                borderBottom: '1px solid var(--border)',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '2px solid rgba(34,197,94,0.20)',
                borderTopColor: '#22C55E',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto',
              }} />
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-dim)', marginTop: '12px' }}>
                Memuatkan kalendar...
              </p>
            </div>
          ) : calData ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {/* Empty cells for offset */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="cal-cell" style={{ borderBottom: '1px solid rgba(29,31,44,0.4)', borderRight: '1px solid rgba(29,31,44,0.4)' }} />
              ))}

              {calData.map((day, idx) => {
                const gregDay = parseInt(day.gregorian.day)
                const hijriDay = parseInt(day.hijri.day)
                const hijriMonthNum = parseInt(day.hijri.month.number)
                const isToday =
                  gregDay === malaysiaToday.getDate() &&
                  gregMonth === malaysiaToday.getMonth() + 1 &&
                  gregYear === malaysiaToday.getFullYear()
                const isFriday = day.gregorian.weekday.name === 'Friday'
                const event = ISLAMIC_EVENTS[hijriMonthNum]?.[hijriDay]
                const colIdx = (startDayOfWeek + idx) % 7
                const isLastInRow = colIdx === 6
                const eventColor = event?.type === 'holiday' ? '#22C55E'
                  : event?.type === 'special' ? '#F59E0B'
                  : '#3B82F6'
                const eventBg = event?.type === 'holiday' ? 'rgba(34,197,94,0.15)'
                  : event?.type === 'special' ? 'rgba(245,158,11,0.15)'
                  : 'rgba(59,130,246,0.15)'

                return (
                  <div
                    key={idx}
                    className="cal-cell"
                    style={{
                      borderBottom: '1px solid rgba(29,31,44,0.4)',
                      borderRight: isLastInRow ? 'none' : '1px solid rgba(29,31,44,0.4)',
                      background: isToday
                        ? 'rgba(34,197,94,0.07)'
                        : event?.type === 'holiday'
                          ? 'rgba(34,197,94,0.03)'
                          : 'transparent',
                      position: 'relative',
                    }}
                  >
                    {/* Today indicator dot */}
                    {isToday && (
                      <div style={{
                        position: 'absolute', top: '5px', right: '5px',
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: '#22C55E',
                        boxShadow: '0 0 6px rgba(34,197,94,0.8)',
                      }} />
                    )}

                    {/* Gregorian day */}
                    <p className="cal-greg" style={{
                      fontFamily: 'var(--font-jetbrains)',
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#22C55E' : isFriday ? 'rgba(34,197,94,0.7)' : 'var(--text-primary)',
                      margin: 0, lineHeight: 1,
                    }}>
                      {gregDay}
                    </p>

                    {/* Hijri day */}
                    <p className="cal-hijri" style={{
                      fontFamily: 'var(--font-jetbrains)',
                      color: isToday ? 'rgba(34,197,94,0.7)' : 'var(--text-dim)',
                      margin: '2px 0 0',
                    }}>
                      {hijriDay}
                    </p>

                    {/* Event — dot on mobile, label on desktop */}
                    {event && (
                      <>
                        {/* Dot indicator (mobile) */}
                        <div className="cal-event-dot" style={{
                          display: 'none',
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: eventColor, marginTop: '4px',
                        }} />
                        {/* Text label (desktop) */}
                        <div className="cal-event-label" style={{
                          marginTop: '4px', padding: '2px 4px', borderRadius: '3px',
                          background: eventBg, lineHeight: 1.2,
                        }}>
                          <p style={{
                            fontFamily: 'var(--font-dm-sans)', fontSize: '8px', fontWeight: 600,
                            color: eventColor, margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap', maxWidth: '100%',
                          }}>
                            {event.label}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)' }}>
                Gagal memuatkan data kalendar
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{
          marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap',
        }}>
          {[
            { color: '#22C55E', bg: 'rgba(34,197,94,0.10)', label: 'Cuti / Perayaan' },
            { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', label: 'Hari Istimewa' },
            { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', label: 'Maklumat' },
          ].map(({ color, bg, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: bg, border: `1px solid ${color}44` }} />
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Attribution */}
        <div style={{
          marginTop: '24px', padding: '14px 18px', borderRadius: '12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <CalendarDays style={{ width: '14px', height: '14px', color: 'var(--text-dim)', flexShrink: 0 }} />
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
            color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6,
          }}>
            Tarikh Hijri berdasarkan pengiraan Ummul Qura. Data waktu solat Malaysia dari JAKIM.
            Tarikh cuti umum mengikut pengumuman rasmi Kerajaan Malaysia.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Calendar cell base ── */
        .cal-cell {
          min-height: 68px;
          padding: 8px 7px;
        }
        .cal-greg { font-size: 14px; }
        .cal-hijri { font-size: 10px; }
        .cal-event-label { display: block; }
        .cal-event-dot { display: none; }

        /* ── Mobile: ≤ 480px ── */
        @media (max-width: 480px) {
          .cal-outer { padding: 20px 8px 80px !important; }
          .cal-cell {
            min-height: 48px !important;
            padding: 5px 3px !important;
          }
          .cal-greg { font-size: 12px !important; }
          .cal-hijri { font-size: 8px !important; margin-top: 1px !important; }
          .cal-event-label { display: none !important; }
          .cal-event-dot { display: block !important; }
        }

        /* ── Small tablets: 481–640px ── */
        @media (min-width: 481px) and (max-width: 640px) {
          .cal-outer { padding: 24px 12px 80px !important; }
          .cal-cell { min-height: 58px !important; padding: 6px 5px !important; }
          .cal-greg { font-size: 13px !important; }
          .cal-hijri { font-size: 9px !important; }
          .cal-event-label p { font-size: 7px !important; }
        }
      `}</style>
    </div>
  )
}
