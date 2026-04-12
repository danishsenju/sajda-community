'use client'

// UX RATIONALE: Prayer time is the #1 reason users open this app.
// Design decisions:
// 1. Full-width glassmorphism card — unmissable, premium feel
// 2. Large Oswald countdown — glanceable from across a room
// 3. Gold for Islamic temporal markers (hijri date) — culturally resonant
// 4. 5-prayer strip at bottom — no horizontal scroll needed, always visible
// 5. Live pulse dot — confirms data is current, not stale
// 6. Geolocation handled by child component — server-side fallback to Aladhan API
//    ensures prayer times always show even if DB is empty

import { useState, useEffect, useCallback } from 'react'
import { MapPin } from 'lucide-react'

interface PrayerData {
  fajr:    string
  syuruk:  string
  dhuhr:   string
  asr:     string
  maghrib: string
  isha:    string
  fajrRaw:    string | null
  dhuhrRaw:   string | null
  asrRaw:     string | null
  maghribRaw: string | null
  ishaRaw:    string | null
  dateLabel:  string
  today:      string
}

interface PrayerItem {
  name:    string
  time:    string
  rawTime: string | null
}

// UX RATIONALE: Malay prayer names throughout — brief specifies Subuh not Fajr
function buildPrayers(data: PrayerData): PrayerItem[] {
  return [
    { name: 'Subuh',   time: data.fajr,    rawTime: data.fajrRaw },
    { name: 'Zohor',   time: data.dhuhr,   rawTime: data.dhuhrRaw },
    { name: 'Asar',    time: data.asr,     rawTime: data.asrRaw },
    { name: 'Maghrib', time: data.maghrib,  rawTime: data.maghribRaw },
    { name: 'Isyak',   time: data.isha,    rawTime: data.ishaRaw },
  ]
}

function parseTimeToMinutes(timeStr: string | null, today: string): number | null {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(`${today}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+08:00`)
  return d.getTime()
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0')
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${padTwo(h)}:${padTwo(m)}:${padTwo(s)}`
  return `${padTwo(m)}:${padTwo(s)}`
}

// UX RATIONALE: Fallback Hijri calculation — shown even without network.
// Simple estimation accurate to ±1 day (good enough for UI display purposes).
function getHijriDate(): string {
  try {
    const fmt = new Intl.DateTimeFormat('ms-MY-u-ca-islamic', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    return fmt.format(new Date())
  } catch {
    return ''
  }
}

export function PrayerHeroSection({ prayerData }: { prayerData: PrayerData }) {
  const prayers = buildPrayers(prayerData)
  const [countdown, setCountdown] = useState<string>('--:--:--')
  const [nextPrayer, setNextPrayer] = useState<PrayerItem | null>(null)
  const [nextPrayerTime, setNextPrayerTime] = useState<string>('')
  const [hijriDate] = useState(getHijriDate)

  const computeNext = useCallback(() => {
    const now = Date.now()
    // Find next prayer that hasn't passed yet
    const next = prayers.find(p => {
      const ms = parseTimeToMinutes(p.rawTime, prayerData.today)
      return ms !== null && ms > now
    })

    if (!next) {
      // Past Isyak — show tomorrow's Subuh label
      setNextPrayer(null)
      setCountdown('Esok')
      return
    }

    setNextPrayer(next)
    const nextMs = parseTimeToMinutes(next.rawTime, prayerData.today)!
    const diff = nextMs - now
    setCountdown(formatCountdown(diff))

    // Format next prayer entry time
    const [h, m] = (next.rawTime ?? '').split(':').map(Number)
    const period = h >= 12 ? 'PTG' : 'PG'
    const h12 = h % 12 || 12
    setNextPrayerTime(`${h12}:${padTwo(m)} ${period}`)
  }, [prayers, prayerData.today])

  useEffect(() => {
    computeNext()
    const interval = setInterval(computeNext, 1000)
    return () => clearInterval(interval)
  }, [computeNext])

  // Which prayers have passed (for dimming in strip)
  const passedSet = new Set<string>()
  prayers.forEach(p => {
    const ms = parseTimeToMinutes(p.rawTime, prayerData.today)
    if (ms !== null && ms < Date.now()) passedSet.add(p.name)
  })

  const nextName = nextPrayer?.name ?? ''

  return (
    <div
      style={{
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(45,215,113,0.18)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.30), 0 0 0 1px rgba(45,215,113,0.06) inset',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle top glow strip — accent color bleeds from top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(45,215,113,0.40) 50%, transparent)',
      }} />

      <div style={{ padding: '18px 20px 16px' }}>
        {/* Top row: location + hijri date */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin style={{ width: '12px', height: '12px', color: 'var(--gold,#C9A84C)', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
              fontSize: '12px', fontWeight: 600,
              color: 'var(--gold,#C9A84C)',
            }}>
              Malaysia
            </span>
          </div>
          {hijriDate && (
            <span style={{
              fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
              fontSize: '12px', fontWeight: 500,
              color: 'var(--gold,#C9A84C)',
            }}>
              {hijriDate}
            </span>
          )}
        </div>

        {/* Countdown center section */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <p style={{
            fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
            fontSize: '11px', fontWeight: 700,
            color: 'var(--text-muted)', letterSpacing: '0.12em',
            textTransform: 'uppercase', margin: '0 0 4px',
          }}>
            {nextPrayer ? 'Waktu Seterusnya' : 'Semua Selesai'}
          </p>

          {/* UX RATIONALE: Oswald 600 at clamp(3rem,10vw,4rem) — glanceable from
              across a desk. The condensed typeface allows this size without overflow.
              Live update every second — shows app is "alive", not stale. */}
          <div
            style={{
              fontFamily: 'var(--font-oswald,"Oswald",sans-serif)',
              fontSize: 'clamp(2.6rem, 10vw, 3.8rem)',
              fontWeight: 600, lineHeight: 1,
              color: 'var(--accent,#2DD771)',
              letterSpacing: '0.02em',
              margin: '0 0 4px',
              // Glow — accent color bleeds into background
              textShadow: '0 0 32px rgba(45,215,113,0.25)',
              // Live pulse dot */}
            }}
          >
            {countdown}
          </div>

          {nextPrayer && (
            <>
              <p style={{
                fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
                fontSize: '18px', fontWeight: 700,
                color: 'var(--text-primary)', margin: '0 0 4px',
              }}>
                {nextPrayer.name}
              </p>
              {nextPrayerTime && (
                <p style={{
                  fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                  fontSize: '13px', color: 'var(--text-muted)', margin: 0,
                }}>
                  Masuk pukul {nextPrayerTime}
                </p>
              )}
            </>
          )}
        </div>

        {/* Prayer strip — 5 prayers in a row
            UX RATIONALE: flex space-between so all 5 prayers visible without scroll.
            Active prayer gets pill wrap. Past prayers dim (not removed — users need reference).
            Syuruk excluded from strip (sunrise, not a fardhu prayer). */}
        <div style={{
          display: 'flex', alignItems: 'stretch', justifyContent: 'space-between',
          gap: '4px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(45,215,113,0.10)',
        }}>
          {prayers.map((prayer) => {
            const isNext   = prayer.name === nextName
            const isPassed = passedSet.has(prayer.name) && !isNext

            return (
              <div
                key={prayer.name}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '3px',
                  padding: isNext ? '8px 6px' : '6px 4px',
                  borderRadius: '12px',
                  background: isNext ? 'rgba(45,215,113,0.10)' : 'transparent',
                  border: isNext ? '1px solid rgba(45,215,113,0.28)' : '1px solid transparent',
                  opacity: isPassed ? 0.38 : 1,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Live dot — only on next prayer */}
                {isNext && (
                  <span style={{ position: 'absolute', top: '5px', right: '5px', width: '5px', height: '5px' }}>
                    <span
                      className="animate-ping"
                      style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent,#2DD771)', opacity: 0.5 }}
                    />
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent,#2DD771)' }} />
                  </span>
                )}

                <span style={{
                  fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                  fontSize: '9px', fontWeight: 700,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  color: isNext ? 'var(--accent,#2DD771)' : 'var(--text-dim)',
                  lineHeight: 1,
                }}>
                  {prayer.name}
                </span>

                <span style={{
                  fontFamily: 'var(--font-oswald,"Oswald",sans-serif)',
                  fontSize: isNext ? '15px' : '13px',
                  fontWeight: isNext ? 600 : 500,
                  color: isNext ? 'var(--text-primary)' : 'var(--text-muted)',
                  lineHeight: 1, letterSpacing: '0.01em',
                }}>
                  {prayer.time === '—' ? '—' : prayer.time.replace(' PG','').replace(' PTG','')}
                </span>

                {/* AM/PM indicator — very small */}
                {prayer.time !== '—' && (
                  <span style={{
                    fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                    fontSize: '8px', fontWeight: 600,
                    color: isNext ? 'var(--accent,#2DD771)' : 'var(--text-dim)',
                    lineHeight: 1,
                  }}>
                    {prayer.time.includes('PTG') ? 'PTG' : 'PG'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
