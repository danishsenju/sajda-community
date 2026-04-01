'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Users } from 'lucide-react'
import { PrayerTimesSection } from './PrayerTimesSection'
import { NextPrayerMini } from './NextPrayerMini'
import masjidImage from '@/images/masjidmsu.png'

type Props = { totalUsers: number; totalPrograms: number; resolvedKeperluan: number }

export function HomeHero({ totalUsers, totalPrograms, resolvedKeperluan }: Props) {
  void totalUsers; void totalPrograms; void resolvedKeperluan

  return (
    <>
      {/* ══════════════════════════════════════════════════
          MOBILE — 50vh cinematic hero (content-first)
          iOS HIG: hero serves context, not art.
          Prayer countdown is the primary CTA surface.
      ══════════════════════════════════════════════════ */}
      <div
        className="md:hidden"
        style={{ position: 'relative', height: '50vh', minHeight: '320px', maxHeight: '480px', overflow: 'hidden', background: '#04080A' }}
      >
        {/* Ken Burns background */}
        <div style={{ position: 'absolute', inset: 0, animation: 'kenBurns 14s ease-out forwards' }}>
          <Image
            src={masjidImage}
            alt="Masjid Saujana Utama"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Gradient overlay — heavier at bottom so text pops */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(4,8,10,0.15) 0%, rgba(4,8,10,0.30) 25%, rgba(4,8,10,0.72) 55%, rgba(4,8,10,0.96) 80%, #04080A 100%)',
        }} />

        {/* Green aura — top right */}
        <div className="animate-float" style={{
          position: 'absolute', top: '-40px', right: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(82,201,122,0.14) 0%, transparent 65%)',
          filter: 'blur(50px)', pointerEvents: 'none', animationDuration: '5s',
        }} />

        {/* Geometric watermark — subtle, top center */}
        <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', opacity: 0.04, pointerEvents: 'none' }}>
          <svg width="160" height="160" viewBox="0 0 200 200" fill="none" className="animate-spin-slow">
            <polygon points="100,8 116,65 174,65 128,99 146,156 100,122 54,156 72,99 26,65 84,65" stroke="#52c97a" strokeWidth="1.2" fill="none"/>
            <circle cx="100" cy="100" r="92" stroke="#52c97a" strokeWidth="0.5" fill="none"/>
            <rect x="58" y="58" width="84" height="84" stroke="#52c97a" strokeWidth="0.5" fill="none" transform="rotate(45 100 100)"/>
          </svg>
        </div>

        {/* Bottom content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 24px' }}>

          {/* Eyebrow */}
          <p className="animate-fadeUp delay-1" style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
            letterSpacing: '0.30em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.40)', fontWeight: 600, marginBottom: '6px',
          }}>
            Komuniti Masjid Saujana Utama
          </p>

          {/* Green rule */}
          <div className="animate-fadeUp delay-1" style={{
            width: '24px', height: '2px', background: '#52c97a', marginBottom: '10px',
          }} />

          {/* SAJDA title */}
          <h1 className="animate-springUp delay-2" style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 'clamp(3.6rem, 16vw, 5.5rem)',
            fontWeight: 800, color: '#fff', lineHeight: 0.88,
            letterSpacing: '-0.03em', marginBottom: '16px',
          }}>
            Sajda
          </h1>

          {/* Prayer countdown — frosted glass surface */}
          <div className="animate-fadeUp delay-3" style={{
            background: 'rgba(4,8,10,0.60)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(82,201,122,0.18)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'inline-block',
            width: '100%',
          }}>
            <NextPrayerMini />
          </div>

          {/* CTAs — 8pt gap, no box-shadow, radius 8px */}
          <div className="animate-fadeUp delay-4" style={{ display: 'flex', gap: '8px' }}>
            <Link href="/program" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', padding: '13px',
              background: '#22C55E',
              color: '#04080A', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              fontFamily: 'var(--font-dm-sans)', textDecoration: 'none',
            }}>
              <Calendar style={{ width: '14px', height: '14px' }} /> Program
            </Link>
            <Link href="/keperluan" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', padding: '13px',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.72)', borderRadius: '8px',
              fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-dm-sans)',
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <Users style={{ width: '14px', height: '14px' }} /> Keperluan
            </Link>
          </div>
        </div>
      </div>

      {/* Prayer times — directly below mobile hero */}
      <div className="md:hidden">
        <PrayerTimesSection />
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP — Split editorial viewport
          Left: dark brand panel — prayer countdown is hero
          Right: mosque image
      ══════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col h-[calc(100dvh-64px)]">
        <section className="flex flex-1 min-h-0">

          {/* LEFT — dark panel */}
          <div
            className="w-[42%] flex flex-col justify-between"
            style={{
              background: 'linear-gradient(160deg, #071410 0%, #0D1C12 55%, #091810 100%)',
              padding: 'clamp(32px, 3.5vw, 56px)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Orb top right */}
            <div className="animate-float" style={{
              position: 'absolute', top: '-80px', right: '-100px',
              width: '380px', height: '380px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(82,201,122,0.10) 0%, transparent 65%)',
              filter: 'blur(60px)', pointerEvents: 'none', animationDuration: '7s',
            }} />
            {/* Orb bottom left */}
            <div className="animate-float" style={{
              position: 'absolute', bottom: '-60px', left: '-80px',
              width: '240px', height: '240px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(82,201,122,0.06) 0%, transparent 65%)',
              filter: 'blur(45px)', pointerEvents: 'none',
              animationDuration: '9s', animationDelay: '3s',
            }} />

            {/* Geometric watermark */}
            <div className="animate-spin-slow" style={{
              position: 'absolute', right: '-24px', top: '50%',
              transform: 'translateY(-50%)',
              width: 'clamp(180px, 22vw, 256px)',
              height: 'clamp(180px, 22vw, 256px)',
              opacity: 0.04, pointerEvents: 'none',
            }}>
              <svg viewBox="0 0 200 200" fill="none">
                <polygon points="100,6 117,65 176,65 129,99 148,158 100,124 52,158 71,99 24,65 83,65" stroke="#52c97a" strokeWidth="1.2" fill="none"/>
                <rect x="50" y="50" width="100" height="100" stroke="#52c97a" strokeWidth="0.7" fill="none" transform="rotate(45 100 100)"/>
                <circle cx="100" cy="100" r="92" stroke="#52c97a" strokeWidth="0.5" fill="none"/>
              </svg>
            </div>

            {/* TOP: identity */}
            <div className="animate-fadeUp delay-1">
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
                letterSpacing: '0.28em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.24)', fontWeight: 600, marginBottom: '8px',
              }}>
                Komuniti Masjid Saujana Utama
              </p>
              <div style={{ width: '24px', height: '2px', background: '#52c97a' }} />
            </div>

            {/* MIDDLE — title + prayer countdown */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '16px', paddingBottom: '16px' }}>
              <h1 className="animate-springUp delay-2" style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 'clamp(2.4rem, 4.0vw, 4.8rem)',
                fontWeight: 800, color: '#fff', lineHeight: 0.86,
                letterSpacing: '-0.03em', marginBottom: '24px',
              }}>
                Sajda
              </h1>

              {/* Prayer countdown — frosted glass card */}
              <div className="animate-fadeUp delay-3" style={{
                background: 'rgba(4,8,10,0.45)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(82,201,122,0.14)',
                borderRadius: '12px',
                padding: '16px 20px',
              }}>
                <NextPrayerMini />
              </div>
            </div>

            {/* BOTTOM — CTAs */}
            <div className="animate-fadeUp delay-6" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link href="/program" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '11px 24px',
                background: '#22C55E',
                color: '#04080A', borderRadius: '8px',
                fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-dm-sans)',
                textDecoration: 'none',
              }}>
                <Calendar style={{ width: '13px', height: '13px' }} /> Program
              </Link>
              <Link href="/keperluan" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '11px 24px',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.60)', borderRadius: '8px',
                fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-dm-sans)',
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.10)',
              }}>
                <Users style={{ width: '13px', height: '13px' }} /> Keperluan
              </Link>
            </div>
          </div>

          {/* RIGHT — Mosque image */}
          <div className="flex-1 relative" style={{ overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, animation: 'kenBurns 16s ease-out forwards' }}>
              <Image
                src={masjidImage}
                alt="Masjid Saujana Utama"
                fill
                className="object-cover object-center"
                priority
                sizes="58vw"
              />
            </div>
            {/* Gradient blends */}
            <div style={{
              position: 'absolute', inset: 0,
              background: [
                'linear-gradient(to right, rgba(7,20,16,0.72) 0%, rgba(7,20,16,0.18) 28%, transparent 50%)',
                'linear-gradient(to bottom, transparent 40%, rgba(7,20,16,0.55) 100%)',
              ].join(', '),
            }} />
          </div>
        </section>

        <PrayerTimesSection />
      </div>
    </>
  )
}
