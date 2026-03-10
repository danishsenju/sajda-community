'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetTime: string // "HH:MM"
}

export function CountdownTimer({ targetTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    function update() {
      const [hours, minutes] = targetTime.split(':').map(Number)
      const now = new Date()
      const target = new Date(now)
      target.setHours(hours, minutes, 0, 0)
      if (target <= now) target.setDate(target.getDate() + 1)

      const diff = target.getTime() - now.getTime()
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetTime])

  const pad = (n: number) => String(n).padStart(2, '0')

  const units = [
    { v: mounted ? pad(timeLeft.h) : '00', l: 'Jam' },
    { v: mounted ? pad(timeLeft.m) : '00', l: 'Minit' },
    { v: mounted ? pad(timeLeft.s) : '00', l: 'Saat' },
  ]

  return (
    <div className="flex items-center gap-2">
      {units.map((unit, i) => (
        <div key={unit.l} className="flex items-center gap-2">
          <div className="text-center">
            <div
              className="digit-box"
              style={{ minWidth: '52px' }}
            >
              <span
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--text-primary)' }}
              >
                {unit.v}
              </span>
            </div>
            <p
              className="text-[10px] mt-1"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}
            >
              {unit.l}
            </p>
          </div>
          {i < 2 && (
            <span
              className="text-lg font-bold pb-4 animate-tick"
              style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--text-dim)' }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
