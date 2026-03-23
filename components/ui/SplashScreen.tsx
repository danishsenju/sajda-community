'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import msuLogo from '@/images/masjidmsu-logo.png'

export function SplashScreen() {
  const [phase, setPhase] = useState<'show' | 'exit' | 'gone'>('show')

  useEffect(() => {
    if (sessionStorage.getItem('splash_done')) {
      setPhase('gone')
      return
    }
    const t1 = setTimeout(() => setPhase('exit'), 2800)
    const t2 = setTimeout(() => {
      setPhase('gone')
      sessionStorage.setItem('splash_done', '1')
    }, 3400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'gone') return null

  return (
    <>
      <style>{`
        @keyframes splashRingOuter {
          from { opacity: 0; transform: rotate(-20deg) scale(0.7); }
          to   { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        @keyframes splashRingInner {
          from { opacity: 0; transform: rotate(20deg) scale(0.6); }
          to   { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        @keyframes splashLogo {
          0%   { opacity: 0; transform: scale(0.8) translateY(10px); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1)   translateY(0);    filter: blur(0); }
        }
        @keyframes splashLine {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes splashName {
          from { opacity: 0; transform: translateY(18px); letter-spacing: 0.5em; }
          to   { opacity: 1; transform: translateY(0);    letter-spacing: 0.22em; }
        }
        @keyframes splashSub {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 0.4; transform: translateY(0); }
        }
        @keyframes splashProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes splashExit {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(1.06); }
        }
        @keyframes splashSpinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes splashSpinRev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
      `}</style>

      {/* Only on mobile */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#04080A',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: phase === 'exit' ? 'splashExit 0.6s ease forwards' : 'none',
        }}
      >
        {/* Green radial ambient */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(82,201,122,0.12) 0%, transparent 65%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        {/* Outer ring — slow spin */}
        <div style={{
          position: 'absolute',
          width: '260px', height: '260px',
          animation: 'splashRingOuter 1s cubic-bezier(0.34,1.2,0.64,1) 0.1s both, splashSpinSlow 18s linear 1.2s infinite',
          opacity: 0.18,
        }}>
          <svg viewBox="0 0 200 200" fill="none" width="100%" height="100%">
            <polygon points="100,6 117,65 176,65 129,99 148,158 100,124 52,158 71,99 24,65 83,65"
              stroke="#52c97a" strokeWidth="1" fill="none"/>
            <circle cx="100" cy="100" r="92" stroke="#52c97a" strokeWidth="0.6" fill="none"/>
            <rect x="48" y="48" width="104" height="104" stroke="#52c97a" strokeWidth="0.5" fill="none"
              transform="rotate(45 100 100)"/>
          </svg>
        </div>

        {/* Inner ring — reverse spin */}
        <div style={{
          position: 'absolute',
          width: '180px', height: '180px',
          animation: 'splashRingInner 1s cubic-bezier(0.34,1.2,0.64,1) 0.3s both, splashSpinRev 12s linear 1.2s infinite',
          opacity: 0.12,
        }}>
          <svg viewBox="0 0 200 200" fill="none" width="100%" height="100%">
            <circle cx="100" cy="100" r="60" stroke="#52c97a" strokeWidth="0.6" fill="none"/>
            <polygon points="100,40 110,70 142,70 118,88 128,118 100,100 72,118 82,88 58,70 90,70"
              stroke="#52c97a" strokeWidth="0.8" fill="none"/>
          </svg>
        </div>

        {/* Logo */}
        <div style={{
          animation: 'splashLogo 0.8s cubic-bezier(0.34,1.2,0.64,1) 0.5s both',
          marginBottom: '28px', position: 'relative', zIndex: 1,
          filter: 'drop-shadow(0 0 24px rgba(82,201,122,0.35))',
        }}>
          <Image
            src={msuLogo}
            alt="Kariah MSU"
            height={80}
            style={{ objectFit: 'contain', display: 'block' }}
            priority
          />
        </div>

        {/* Green rule line */}
        <div style={{
          width: '48px', height: '1.5px',
          background: 'linear-gradient(to right, transparent, #52c97a, transparent)',
          boxShadow: '0 0 12px rgba(82,201,122,0.8)',
          animation: 'splashLine 0.5s ease 1.2s both',
          marginBottom: '18px',
          transformOrigin: 'center',
          position: 'relative', zIndex: 1,
        }} />

        {/* Name */}
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '28px', fontWeight: 700,
          color: '#fff', lineHeight: 1, margin: 0,
          animation: 'splashName 0.7s cubic-bezier(0.16,1,0.3,1) 1.3s both',
          position: 'relative', zIndex: 1,
          textShadow: '0 0 40px rgba(82,201,122,0.3)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}>
          Kariah MSU
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
          color: 'rgba(255,255,255,0.4)', marginTop: '10px',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          animation: 'splashSub 0.6s ease 1.8s both',
          position: 'relative', zIndex: 1,
        }}>
          Masjid Saujana Utama
        </p>

        {/* Bottom progress bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
          background: 'rgba(255,255,255,0.04)',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(to right, #22863a, #52c97a, #86efac)',
            boxShadow: '0 0 8px rgba(82,201,122,0.8)',
            animation: 'splashProgress 2.8s cubic-bezier(0.4,0,0.2,1) 0.1s both',
          }} />
        </div>
      </div>
    </>
  )
}
