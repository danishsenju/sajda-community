'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { PrayerTimesSection } from './PrayerTimesSection'
import masjidImage from '@/images/masjidmsu.png'

/* ── Count-up hook ── */
function useCountUp(target: number, duration = 1400, delay = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const timer = setTimeout(() => {
      const t0 = Date.now()
      const tick = () => {
        const p = Math.min((Date.now() - t0) / duration, 1)
        setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return count
}

type Props = { totalUsers: number; totalPrograms: number; resolvedKeperluan: number }

export function HomeHero({ totalUsers, totalPrograms, resolvedKeperluan }: Props) {
  const u = useCountUp(totalUsers,          1500, 400)
  const p = useCountUp(totalPrograms,        1300, 600)
  const k = useCountUp(resolvedKeperluan,    1100, 800)

  const stats = [
    { v: u, label: 'Ahli Komuniti',     accent: '#52c97a', glow: 'rgba(82,201,122,0.3)' },
    { v: p, label: 'Program Aktif',     accent: '#FCD34D', glow: 'rgba(252,211,77,0.25)' },
    { v: k, label: 'Keperluan Selesai', accent: '#F87171', glow: 'rgba(248,113,113,0.22)' },
  ]

  return (
    <>
      {/* ══════════════════════════════════════════════════
          MOBILE — Full-bleed cinematic hero
      ══════════════════════════════════════════════════ */}
      <div
        className="md:hidden"
        style={{ position: 'relative', height: '62vh', overflow: 'hidden', background: '#04080A' }}
      >
        {/* Ken Burns background image */}
        <div style={{ position: 'absolute', inset: 0, animation: 'kenBurns 14s ease-out forwards' }}>
          <Image
            src={masjidImage}
            alt="Masjid Saujana Utama"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Gradient cinematic overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,8,10,0.0) 0%, rgba(4,8,10,0.25) 30%, rgba(4,8,10,0.78) 60%, rgba(4,8,10,0.97) 84%, #04080A 100%)' }} />
        {/* Side vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 0% 100%, rgba(82,201,122,0.16) 0%, transparent 55%)' }} />

        {/* Floating green aura — top right */}
        <div className="animate-float" style={{
          position: 'absolute', top: '-40px', right: '-60px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(82,201,122,0.16) 0%, transparent 65%)',
          filter: 'blur(50px)', pointerEvents: 'none', animationDuration: '5s',
        }} />

        {/* Spinning Islamic geometric watermark — top center */}
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%)', opacity: 0.055, pointerEvents: 'none' }}>
          <svg width="190" height="190" viewBox="0 0 200 200" fill="none" className="animate-spin-slow">
            <polygon points="100,8 116,65 174,65 128,99 146,156 100,122 54,156 72,99 26,65 84,65" stroke="#52c97a" strokeWidth="1.2" fill="none"/>
            <circle cx="100" cy="100" r="92" stroke="#52c97a" strokeWidth="0.5" fill="none"/>
            <circle cx="100" cy="100" r="62" stroke="#52c97a" strokeWidth="0.35" fill="none"/>
            <rect x="58" y="58" width="84" height="84" stroke="#52c97a" strokeWidth="0.5" fill="none" transform="rotate(45 100 100)"/>
          </svg>
        </div>

        {/* Bottom content overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 22px 22px' }}>

          {/* Eyebrow */}
          <p className="animate-fadeUp delay-1" style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '13px',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)', fontWeight: 700, marginBottom: '8px',
          }}>
            Komuniti Masjid Saujana Utama
          </p>

          {/* Green rule */}
          <div className="animate-fadeUp delay-1" style={{
            width: '30px', height: '2px', background: '#52c97a', marginBottom: '12px',
            boxShadow: '0 0 10px rgba(82,201,122,0.7), 0 0 20px rgba(82,201,122,0.3)',
          }} />

          {/* SAJDA — main title */}
          <h1 className="animate-springUp delay-2" style={{
            fontFamily: 'var(--font-poppins)',
            fontSize: 'clamp(4.2rem, 18vw, 6rem)',
            fontWeight: 800, color: '#fff', lineHeight: 0.86,
            letterSpacing: '-0.03em', marginBottom: '20px',
            textShadow: '0 0 80px rgba(82,201,122,0.2), 0 4px 24px rgba(0,0,0,0.6)',
          }}>
            Sajda
          </h1>

          {/* Stats bar */}
          <div className="animate-fadeUp delay-3" style={{
            display: 'flex',
            borderRadius: '14px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(4,8,10,0.68)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            marginBottom: '12px',
          }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                flex: 1, padding: '14px 10px', textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                position: 'relative',
              }}>
                {/* top accent line */}
                <div style={{
                  position: 'absolute', top: 0, left: '20%', right: '20%',
                  height: '1.5px', background: s.accent,
                  opacity: 0.55,
                }} />
                <p style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '26px', fontWeight: 800, fontStyle: 'italic',
                  color: s.accent, lineHeight: 1, letterSpacing: '-0.02em',
                  textShadow: `0 0 22px ${s.glow}`,
                }}>
                  {String(s.v).padStart(2, '0')}
                </p>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                  color: 'rgba(255,255,255,0.28)', letterSpacing: '0.18em',
                  textTransform: 'uppercase', marginTop: '5px', lineHeight: 1.2,
                  fontWeight: 600,
                }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="animate-fadeUp delay-4" style={{ display: 'flex', gap: '8px' }}>
            <Link href="/program" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '7px', padding: '13px',
              background: 'linear-gradient(135deg, #52c97a 0%, #2D6A4F 100%)',
              color: '#04080A', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              fontFamily: 'var(--font-jakarta)', textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(82,201,122,0.35)',
            }}>
              <Calendar style={{ width: '14px', height: '14px' }} /> Program
            </Link>
            <Link href="/keperluan" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px', background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.65)', borderRadius: '12px',
              fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-jakarta)',
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.09)',
            }}>
              Keperluan
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', right: '18px', bottom: '164px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
          opacity: 0.5,
        }}>
          <div style={{ width: '1px', height: '38px', background: 'linear-gradient(to bottom, transparent, #52c97a)', animation: 'breathe 2.5s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>terokai</span>
        </div>
      </div>

      {/* Prayer times — directly below mobile hero */}
      <div className="md:hidden">
        <PrayerTimesSection />
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP — Split editorial viewport layout
      ══════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col h-[calc(100dvh-64px)]">
        <section className="flex flex-1 min-h-0">

          {/* LEFT: Dark panel with orbs + geometric */}
          <div
            className="w-[44%] flex flex-col justify-between"
            style={{
              background: 'linear-gradient(160deg, #071410 0%, #0D1C12 55%, #091810 100%)',
              padding: 'clamp(28px, 3.5vw, 52px)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Orb — top right */}
            <div className="animate-float" style={{
              position: 'absolute', top: '-80px', right: '-100px',
              width: '380px', height: '380px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(82,201,122,0.11) 0%, transparent 65%)',
              filter: 'blur(60px)', pointerEvents: 'none', animationDuration: '7s',
            }} />
            {/* Orb — bottom left */}
            <div className="animate-float" style={{
              position: 'absolute', bottom: '-60px', left: '-80px',
              width: '260px', height: '260px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(82,201,122,0.07) 0%, transparent 65%)',
              filter: 'blur(45px)', pointerEvents: 'none',
              animationDuration: '9s', animationDelay: '3s',
            }} />

            {/* Spinning geometric watermark */}
            <div className="animate-spin-slow" style={{
              position: 'absolute', right: '-20px', top: '50%',
              transform: 'translateY(-50%)',
              width: 'clamp(200px, 24vw, 280px)',
              height: 'clamp(200px, 24vw, 280px)',
              opacity: 0.05, pointerEvents: 'none',
            }}>
              <svg viewBox="0 0 200 200" fill="none">
                <polygon points="100,6 117,65 176,65 129,99 148,158 100,124 52,158 71,99 24,65 83,65" stroke="#52c97a" strokeWidth="1.2" fill="none"/>
                <rect x="50" y="50" width="100" height="100" stroke="#52c97a" strokeWidth="0.7" fill="none" transform="rotate(45 100 100)"/>
                <circle cx="100" cy="100" r="92" stroke="#52c97a" strokeWidth="0.5" fill="none"/>
                <circle cx="100" cy="100" r="58" stroke="#52c97a" strokeWidth="0.35" fill="none"/>
                <polygon points="100,30 110,65 148,65 118,86 130,120 100,100 70,120 82,86 52,65 90,65" stroke="#52c97a" strokeWidth="0.5" fill="none"/>
              </svg>
            </div>

            {/* TOP: identity */}
            <div className="animate-fadeUp delay-1">
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                letterSpacing: '0.26em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.22)', fontWeight: 600, marginBottom: '10px',
              }}>
                Komuniti Masjid Saujana Utama
              </p>
              <div style={{
                width: '28px', height: '2px', background: '#52c97a',
                boxShadow: '0 0 10px rgba(82,201,122,0.6)',
              }} />
            </div>

            {/* MIDDLE: Title + count-up stats */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '16px', paddingBottom: '16px' }}>
              <h1 className="animate-springUp delay-2" style={{
                fontFamily: 'var(--font-poppins)',
                fontSize: 'clamp(2.6rem, 4.2vw, 5rem)',
                fontWeight: 800, color: '#fff', lineHeight: 0.85,
                letterSpacing: '-0.03em', marginBottom: '28px',
                textShadow: '0 0 60px rgba(82,201,122,0.15)',
              }}>
                Sajda
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {stats.map((s, i) => (
                  <div key={s.label} className={`animate-fadeUp delay-${i + 3}`} style={{ position: 'relative', paddingLeft: '16px' }}>
                    {/* Left accent bar */}
                    <div style={{
                      position: 'absolute', left: 0, top: '4px', bottom: '4px',
                      width: '2px', borderRadius: '2px',
                      background: s.accent, opacity: 0.7,
                      boxShadow: `0 0 8px ${s.glow}`,
                    }} />
                    {/* Number */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
                      <span style={{
                        fontFamily: 'var(--font-playfair)',
                        fontSize: 'clamp(1.9rem, 3vw, 2.8rem)',
                        fontWeight: 800, fontStyle: 'italic',
                        color: s.accent, lineHeight: 1, letterSpacing: '-0.02em',
                        textShadow: `0 0 28px ${s.glow}`,
                      }}>
                        {String(s.v).padStart(2, '0')}
                      </span>
                    </div>
                    {/* Label */}
                    <span style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                      color: 'rgba(255,255,255,0.28)',
                      letterSpacing: '0.22em', textTransform: 'uppercase',
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM: CTAs */}
            <div className="animate-fadeUp delay-6" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link href="/program" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '11px 24px',
                background: 'linear-gradient(135deg, #52c97a 0%, #2D6A4F 100%)',
                color: '#04080A', borderRadius: '100px',
                fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-jakarta)',
                textDecoration: 'none', boxShadow: '0 4px 24px rgba(82,201,122,0.3)',
              }}>
                <Calendar style={{ width: '13px', height: '13px' }} /> Program
              </Link>
              <Link href="/keperluan" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '11px 24px',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.55)', borderRadius: '100px',
                fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-jakarta)',
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                Keperluan
              </Link>
            </div>
          </div>

          {/* RIGHT: Mosque image — Ken Burns */}
          <div className="flex-1 relative" style={{ overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, animation: 'kenBurns 16s ease-out forwards' }}>
              <Image
                src={masjidImage}
                alt="Masjid Saujana Utama"
                fill
                className="object-cover object-center"
                priority
                sizes="56vw"
              />
            </div>
            {/* Gradient blends */}
            <div style={{
              position: 'absolute', inset: 0,
              background: [
                'linear-gradient(to right, rgba(7,20,16,0.7) 0%, rgba(7,20,16,0.15) 28%, transparent 50%)',
                'linear-gradient(to bottom, transparent 40%, rgba(7,20,16,0.6) 100%)',
              ].join(', '),
            }} />
            {/* Green lens flare top-right */}
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '350px', height: '350px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(82,201,122,0.1) 0%, transparent 60%)',
              filter: 'blur(40px)', pointerEvents: 'none',
            }} />
          </div>
        </section>

        <PrayerTimesSection />
      </div>
    </>
  )
}
