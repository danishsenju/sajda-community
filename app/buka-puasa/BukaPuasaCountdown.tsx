'use client'

import { useState, useEffect } from 'react'

function toTotalMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function BukaPuasaCountdown({
  maghribTime,
  imsakTime,
}: {
  maghribTime: string
  imsakTime: string | null
}) {
  const [remaining, setRemaining] = useState<{ h: number; m: number; s: number } | null>(null)
  const [passed, setPassed] = useState(false)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    function update() {
      const now = new Date()
      const [mh, mm] = maghribTime.split(':').map(Number)
      const target = new Date()
      target.setHours(mh, mm, 0, 0)

      const diff = target.getTime() - now.getTime()
      if (diff <= 0) {
        setPassed(true)
        setRemaining(null)
        setPct(100)
        return
      }
      const totalSec = Math.floor(diff / 1000)
      setRemaining({
        h: Math.floor(totalSec / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
      })

      if (imsakTime) {
        const nowMin = now.getHours() * 60 + now.getMinutes()
        const startMin = toTotalMinutes(imsakTime)
        const endMin = toTotalMinutes(maghribTime)
        const elapsed = nowMin - startMin
        const total = endMin - startMin
        setPct(Math.min(100, Math.max(0, (elapsed / total) * 100)))
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [maghribTime, imsakTime])

  const pad = (n: number) => String(n).padStart(2, '0')

  if (passed) {
    return (
      <div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 10px', borderRadius: '8px',
          background: 'rgba(252,211,77,0.12)',
          border: '1px solid rgba(252,211,77,0.28)',
          marginBottom: '10px',
        }}>
          <span style={{ fontSize: '13px', lineHeight: 1 }}>🌙</span>
          <span style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#FCD34D',
          }}>
            Sudah Berbuka
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '11px',
          color: 'rgba(255,255,255,0.35)', lineHeight: 1.55,
        }}>
          Semoga ibadah puasa anda diterima Allah SWT.
        </p>
      </div>
    )
  }

  if (!remaining) return null

  const units = [
    { value: remaining.h, label: 'Jam' },
    { value: remaining.m, label: 'Minit' },
    { value: remaining.s, label: 'Saat' },
  ]

  return (
    <div>
      {/* Countdown row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-start' }}>
        {units.map((unit, i) => (
          <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '52px', height: '58px',
                background: 'rgba(252,211,77,0.1)',
                border: '1px solid rgba(252,211,77,0.22)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                  background: 'rgba(252,211,77,0.04)',
                }} />
                <div style={{
                  position: 'absolute', top: '50%', left: 0, right: 0,
                  height: '1px', background: 'rgba(252,211,77,0.08)',
                }} />
                <span style={{
                  fontFamily: 'var(--font-jetbrains)', fontSize: '20px', fontWeight: 700,
                  color: '#FCD34D', letterSpacing: '-0.02em', position: 'relative',
                }}>
                  {pad(unit.value)}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)', marginTop: '6px',
              }}>
                {unit.label}
              </p>
            </div>
            {i < 2 && (
              <span style={{
                fontFamily: 'var(--font-jetbrains)', fontSize: '16px', fontWeight: 300,
                color: 'rgba(252,211,77,0.3)', paddingBottom: '16px',
              }}>:</span>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {imsakTime && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)',
            }}>
              Imsak {imsakTime}
            </span>
            <span style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(252,211,77,0.5)',
            }}>
              {Math.round(pct)}%
            </span>
            <span style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(252,211,77,0.65)',
            }}>
              Berbuka {maghribTime}
            </span>
          </div>
          <div style={{
            height: '3px', borderRadius: '3px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${pct}%`,
              background: 'linear-gradient(90deg, rgba(252,211,77,0.4) 0%, #FCD34D 100%)',
              transition: 'width 1s linear',
              boxShadow: '0 0 6px rgba(252,211,77,0.5)',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
