'use client'

import { useState, useEffect } from 'react'

const PRAYER_NAMES = ['Imsak', 'Subuh', 'Syuruk', 'Zohor', 'Asr', 'Maghrib', 'Isyak']
const IS_PRAYER   = [false, true, false, true, true, true, true]

function toMins(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function nowMins(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function formatDiff(diff: number): string {
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h === 0) return `${m}m lagi`
  if (m === 0) return `${h}j lagi`
  return `${h}j ${m}m lagi`
}

function getZone(): string {
  if (typeof window === 'undefined') return 'SGR01'
  return localStorage.getItem('kariah_zone') ?? 'SGR01'
}

type NextInfo = { name: string; time: string; diff: number; progress: number }

function compute(times: string[]): NextInfo {
  const now = nowMins()
  for (let i = 0; i < times.length; i++) {
    if (!IS_PRAYER[i] || !times[i] || times[i] === '—') continue
    const t = toMins(times[i])
    if (t > now) {
      // prev prayer start (for progress bar)
      let prevT = 0
      for (let j = i - 1; j >= 0; j--) {
        if (IS_PRAYER[j] && times[j] && times[j] !== '—') { prevT = toMins(times[j]); break }
      }
      const total = t - prevT
      const elapsed = now - prevT
      return {
        name: PRAYER_NAMES[i],
        time: times[i],
        diff: t - now,
        progress: total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0,
      }
    }
  }
  // After Isyak — next is Subuh
  const subuhT = toMins(times[1])
  const diff   = (24 * 60 - now) + subuhT
  return { name: 'Subuh', time: times[1], diff, progress: 90 }
}

export function NextPrayerMini() {
  const [info, setInfo] = useState<NextInfo | null>(null)

  useEffect(() => {
    let times: string[] = []
    let timer: ReturnType<typeof setInterval>

    async function load() {
      try {
        const zone = getZone()
        const res  = await fetch(`/api/prayer?zone=${encodeURIComponent(zone)}`, { cache: 'no-store' })
        const json = await res.json()
        times = (json.times as (string | null)[]).map(t => t ?? '—')
        setInfo(compute(times))
        timer = setInterval(() => setInfo(compute(times)), 30_000)
      } catch {
        // silently fail — PrayerTimesSection below will still show full data
      }
    }

    load()
    return () => clearInterval(timer)
  }, [])

  // skeleton while loading
  if (!info) {
    return (
      <div style={{
        borderRadius: '14px', marginBottom: '12px', height: '72px',
        background: 'rgba(4,8,10,0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }} />
    )
  }

  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(4,8,10,0.68)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      marginBottom: '12px',
      position: 'relative',
    }}>
      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{
          width: `${info.progress}%`, height: '100%',
          background: 'linear-gradient(to right, #52c97a, #86efac)',
          boxShadow: '0 0 10px rgba(82,201,122,0.7)',
          transition: 'width 1s ease',
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
        {/* Left — label + prayer name */}
        <div>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)', fontWeight: 700, marginBottom: '5px',
          }}>
            Solat Seterusnya
          </p>
          <p style={{
            fontFamily: 'var(--font-playfair)', fontSize: '20px',
            fontWeight: 700, fontStyle: 'italic', color: '#fff', lineHeight: 1,
          }}>
            {info.name}
          </p>
        </div>

        {/* Right — time + countdown */}
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: 'var(--font-jetbrains)', fontSize: '22px',
            fontWeight: 700, color: '#52c97a', lineHeight: 1,
            textShadow: '0 0 20px rgba(82,201,122,0.55)',
          }}>
            {info.time}
          </p>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '12px',
            color: 'rgba(255,255,255,0.32)', marginTop: '4px', fontWeight: 500,
          }}>
            {formatDiff(info.diff)}
          </p>
        </div>
      </div>
    </div>
  )
}
