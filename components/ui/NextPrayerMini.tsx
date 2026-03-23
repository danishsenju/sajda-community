'use client'

import { useState, useEffect } from 'react'

const PRAYER_NAMES = ['Imsak', 'Subuh', 'Syuruk', 'Zohor', 'Asr', 'Maghrib', 'Isyak']
const IS_PRAYER   = [false, true, false, true, true, true, true]

function toSecs(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 3600 + m * 60
}

function nowSecs(): number {
  const d = new Date()
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()
}

function getZone(): string {
  if (typeof window === 'undefined') return 'SGR01'
  return localStorage.getItem('kariah_zone') ?? 'SGR01'
}

type NextInfo = {
  name: string
  time: string
  diffSecs: number
  progress: number
}

function compute(times: string[]): NextInfo {
  const now = nowSecs()
  for (let i = 0; i < times.length; i++) {
    if (!IS_PRAYER[i] || !times[i] || times[i] === '—') continue
    const t = toSecs(times[i])
    if (t > now) {
      let prevT = 0
      for (let j = i - 1; j >= 0; j--) {
        if (IS_PRAYER[j] && times[j] && times[j] !== '—') { prevT = toSecs(times[j]); break }
      }
      const total   = t - prevT
      const elapsed = now - prevT
      return {
        name: PRAYER_NAMES[i], time: times[i],
        diffSecs: t - now,
        progress: total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0,
      }
    }
  }
  const subuhSecs = toSecs(times[1])
  return { name: 'Subuh', time: times[1], diffSecs: (86400 - now) + subuhSecs, progress: 92 }
}

function pad(n: number) { return String(n).padStart(2, '0') }

function DigitBox({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(82,201,122,0.18)',
        borderRadius: '6px',
        padding: '6px 10px',
        minWidth: '42px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* inner top sheen */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(82,201,122,0.3), transparent)',
        }} />
        <span style={{
          fontFamily: 'var(--font-jetbrains)', fontSize: '22px', fontWeight: 700,
          color: '#52c97a', lineHeight: 1,
          textShadow: '0 0 16px rgba(82,201,122,0.7)',
          display: 'block',
        }}>
          {value}
        </span>
      </div>
      <span style={{
        fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)',
      }}>
        {label}
      </span>
    </div>
  )
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const size = 10
  const thickness = 1.5
  const color = 'rgba(82,201,122,0.5)'
  const styles: Record<string, React.CSSProperties> = {
    tl: { top: 6, left: 6, borderTop: `${thickness}px solid ${color}`, borderLeft:  `${thickness}px solid ${color}` },
    tr: { top: 6, right: 6, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` },
    bl: { bottom: 6, left: 6, borderBottom: `${thickness}px solid ${color}`, borderLeft:  `${thickness}px solid ${color}` },
    br: { bottom: 6, right: 6, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` },
  }
  return (
    <div style={{
      position: 'absolute', width: size, height: size,
      pointerEvents: 'none', ...styles[pos],
    }} />
  )
}

export function NextPrayerMini() {
  const [info, setInfo] = useState<NextInfo | null>(null)
  const [tick, setTick]   = useState(0)

  useEffect(() => {
    let times: string[] = []
    let interval: ReturnType<typeof setInterval>

    async function load() {
      try {
        const zone = getZone()
        const res  = await fetch(`/api/prayer?zone=${encodeURIComponent(zone)}`, { cache: 'no-store' })
        const json = await res.json()
        times = (json.times as (string | null)[]).map(t => t ?? '—')
        setInfo(compute(times))
        // tick every second for live countdown
        interval = setInterval(() => {
          setInfo(compute(times))
          setTick(t => t + 1)
        }, 1000)
      } catch {
        // silently fail
      }
    }

    load()
    return () => clearInterval(interval)
  }, [])

  if (!info) {
    return (
      <div style={{
        borderRadius: '10px', marginBottom: '12px', height: '120px',
        background: 'rgba(4,8,10,0.5)',
        border: '1px solid rgba(82,201,122,0.08)',
      }} />
    )
  }

  const h = Math.floor(info.diffSecs / 3600)
  const m = Math.floor((info.diffSecs % 3600) / 60)
  const s = info.diffSecs % 60

  return (
    <div style={{
      position: 'relative',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, rgba(4,8,10,0.92) 0%, rgba(8,20,14,0.88) 100%)',
      border: '1px solid rgba(82,201,122,0.12)',
      backdropFilter: 'blur(28px) saturate(200%)',
      WebkitBackdropFilter: 'blur(28px) saturate(200%)',
      marginBottom: '12px',
      overflow: 'hidden',
    }}>
      {/* Bracket corners */}
      <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

      {/* Radial green glow behind content */}
      <div style={{
        position: 'absolute', bottom: '-20px', right: '-20px',
        width: '160px', height: '160px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(82,201,122,0.1) 0%, transparent 65%)',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />

      {/* Scan line */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
      }} />

      <div style={{ padding: '14px 16px 12px', position: 'relative' }}>

        {/* Top row — LIVE + label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          {/* Pulsing LIVE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative', width: '7px', height: '7px' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: '#52c97a', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                opacity: 0.4,
              }} />
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#52c97a' }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-jetbrains)', fontSize: '10px', fontWeight: 700,
              color: '#52c97a', letterSpacing: '0.2em',
            }}>
              LIVE
            </span>
          </div>

          {/* Label */}
          <span style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.22)',
          }}>
            Solat Seterusnya
          </span>
        </div>

        {/* Prayer name + iqamah time */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{
            fontFamily: 'var(--font-playfair)', fontSize: '26px',
            fontWeight: 700, fontStyle: 'italic', color: '#fff',
            lineHeight: 1, margin: 0,
            textShadow: '0 0 30px rgba(82,201,122,0.2)',
          }}>
            {info.name}
          </h3>
          <span style={{
            fontFamily: 'var(--font-jetbrains)', fontSize: '16px', fontWeight: 600,
            color: 'rgba(255,255,255,0.45)',
          }}>
            {info.time}
          </span>
        </div>

        {/* Digit countdown boxes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          <DigitBox value={pad(h)} label="jam" />
          <span style={{
            fontFamily: 'var(--font-jetbrains)', fontSize: '18px',
            color: 'rgba(82,201,122,0.4)', fontWeight: 700,
            marginBottom: '18px',
          }}>:</span>
          <DigitBox value={pad(m)} label="minit" />
          <span style={{
            fontFamily: 'var(--font-jetbrains)', fontSize: '18px',
            color: 'rgba(82,201,122,0.4)', fontWeight: 700,
            marginBottom: '18px',
          }}>:</span>
          <DigitBox value={pad(s)} label="saat" />

          {/* Progress % on the right */}
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <span style={{
              fontFamily: 'var(--font-jetbrains)', fontSize: '22px', fontWeight: 700,
              color: 'rgba(255,255,255,0.15)',
            }}>
              {info.progress}
              <span style={{ fontSize: '13px' }}>%</span>
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '2px', borderRadius: '2px',
          background: 'rgba(255,255,255,0.05)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: `${info.progress}%`,
            background: 'linear-gradient(to right, #22863a, #52c97a, #86efac)',
            boxShadow: '0 0 8px rgba(82,201,122,0.8)',
            transition: 'width 1s linear',
          }} />
          {/* Moving glint */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            width: '40px',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
            left: `calc(${info.progress}% - 20px)`,
            transition: 'left 1s linear',
          }} />
        </div>
      </div>
    </div>
  )
}
