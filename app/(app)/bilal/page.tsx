import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { ArrowLeft, Mic } from 'lucide-react'

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
type Prayer = typeof PRAYERS[number]

const PRAYER_LABELS: Record<Prayer, { ms: string; ar: string }> = {
  fajr:    { ms: 'Subuh',   ar: 'الفجر' },
  dhuhr:   { ms: 'Zohor',   ar: 'الظهر' },
  asr:     { ms: 'Asar',    ar: 'العصر' },
  maghrib: { ms: 'Maghrib', ar: 'المغرب' },
  isha:    { ms: 'Isyak',   ar: 'العشاء' },
}

const DAY_LABELS = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad']

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

function dateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

export default async function BilalPage() {
  const supabase = await createClient()

  const monday = getMondayOf(new Date())
  const weekDates = getWeekDates(monday)
  const from = dateStr(weekDates[0])
  const to = dateStr(weekDates[6])
  const todayStr = dateStr(new Date())

  // Fetch bilals and this week's schedule
  const [{ data: bilals }, { data: scheduleRows }] = await Promise.all([
    supabase.from('bilals').select('id, name, phone').eq('is_active', true).order('name'),
    supabase
      .from('bilal_schedule')
      .select('date, prayer, bilal_id')
      .gte('date', from)
      .lte('date', to),
  ])

  // Map bilal_id → name
  const bilalMap: Record<string, string> = {}
  for (const b of (bilals ?? [])) bilalMap[b.id] = b.name

  // Build schedule map: date → prayer → bilal_id
  const schedMap: Record<string, Record<string, string>> = {}
  for (const row of (scheduleRows ?? [])) {
    if (!schedMap[row.date]) schedMap[row.date] = {}
    if (row.bilal_id) schedMap[row.date][row.prayer] = row.bilal_id
  }

  const weekLabel = `${weekDates[0].toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })} – ${weekDates[6].toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back */}
        <Link href="/"
          className="inline-flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-60"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--primary-pale)' }}>
            <Mic className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
              Jadual Bilal
            </h1>
            <p className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Jadual azan mingguan Masjid Saujana Utama
            </p>
            <p className="text-xs mt-1 font-medium" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>
              {weekLabel}
            </p>
          </div>
        </div>

        {/* Desktop — grid table */}
        <div className="hidden md:block" style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{
                  padding: '14px 20px', textAlign: 'left', width: '110px',
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--text-dim)', fontWeight: 600,
                }}>
                  Solat
                </th>
                {weekDates.map((d, i) => {
                  const ds = dateStr(d)
                  const isToday = ds === todayStr
                  return (
                    <th key={i} style={{
                      padding: '14px 10px', textAlign: 'center',
                      fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                      color: isToday ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isToday ? 700 : 500,
                      background: isToday ? 'var(--primary-pale)' : 'transparent',
                    }}>
                      <div>{DAY_LABELS[i]}</div>
                      <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>
                        {d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {PRAYERS.map((prayer, pi) => (
                <tr key={prayer} style={{ borderTop: pi > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {PRAYER_LABELS[prayer].ms}
                    </div>
                    <div style={{ fontFamily: 'var(--font-amiri)', fontSize: '13px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {PRAYER_LABELS[prayer].ar}
                    </div>
                  </td>
                  {weekDates.map((d, di) => {
                    const ds = dateStr(d)
                    const bilalId = schedMap[ds]?.[prayer]
                    const bilalName = bilalId ? bilalMap[bilalId] : null
                    const isToday = ds === todayStr
                    return (
                      <td key={di} style={{
                        padding: '12px 10px', textAlign: 'center',
                        background: isToday ? 'var(--primary-pale)' : 'transparent',
                      }}>
                        {bilalName ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px', borderRadius: '20px',
                            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                            fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                            fontWeight: 600, color: 'var(--primary)',
                          }}>
                            {bilalName}
                          </span>
                        ) : (
                          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile — day cards */}
        <div className="md:hidden flex flex-col gap-4">
          {weekDates.map((d, i) => {
            const ds = dateStr(d)
            const isToday = ds === todayStr
            const daySchedule = schedMap[ds] ?? {}
            const hasAny = PRAYERS.some(p => daySchedule[p])

            return (
              <div key={i} style={{
                borderRadius: '16px',
                border: `1px solid ${isToday ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`,
                background: isToday ? 'rgba(34,197,94,0.04)' : 'var(--surface)',
                overflow: 'hidden',
              }}>
                {/* Day header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: isToday ? 'rgba(34,197,94,0.07)' : 'transparent',
                }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700, color: isToday ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {DAY_LABELS[i]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)', marginLeft: '8px' }}>
                      {d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {isToday && (
                    <span style={{
                      padding: '2px 8px', borderRadius: '20px',
                      background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                      fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600, color: 'var(--primary)',
                    }}>
                      Hari Ini
                    </span>
                  )}
                </div>

                {/* Prayers */}
                <div style={{ padding: '8px 0' }}>
                  {PRAYERS.map((prayer, pi) => {
                    const bilalId = daySchedule[prayer]
                    const bilalName = bilalId ? bilalMap[bilalId] : null
                    return (
                      <div key={prayer} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 16px',
                        borderTop: pi > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '56px' }}>
                            {PRAYER_LABELS[prayer].ms}
                          </span>
                          <span style={{ fontFamily: 'var(--font-amiri)', fontSize: '12px', color: 'var(--text-dim)', marginLeft: '8px' }}>
                            {PRAYER_LABELS[prayer].ar}
                          </span>
                        </div>
                        {bilalName ? (
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px',
                            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                            fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600, color: 'var(--primary)',
                          }}>
                            {bilalName}
                          </span>
                        ) : (
                          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>—</span>
                        )}
                      </div>
                    )
                  })}

                  {!hasAny && (
                    <p style={{ padding: '8px 16px', fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center' }}>
                      Jadual belum ditetapkan
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        {(bilals?.length ?? 0) > 0 && (
          <div style={{ marginTop: '32px', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
              Bilal Aktif
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {bilals?.map(b => (
                <span key={b.id} style={{
                  padding: '4px 12px', borderRadius: '20px',
                  background: 'rgba(34,197,94,0.07)', border: '1px solid var(--border)',
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-secondary)',
                }}>
                  {b.name}
                  {b.phone && <span style={{ color: 'var(--text-dim)', marginLeft: '6px' }}>· {b.phone}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
