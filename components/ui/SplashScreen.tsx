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
    const t1 = setTimeout(() => setPhase('exit'), 2200)
    const t2 = setTimeout(() => {
      setPhase('gone')
      sessionStorage.setItem('splash_done', '1')
    }, 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'gone') return null

  return (
    <>
      <style>{`
        @keyframes logoIn {
          0%   { opacity: 0; transform: scale(0.75); filter: blur(12px); }
          60%  { opacity: 1; transform: scale(1.04); filter: blur(0); }
          100% { opacity: 1; transform: scale(1);    filter: blur(0); }
        }
        @keyframes splashFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      <div
        className="md:hidden"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#04080A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: phase === 'exit' ? 'splashFadeOut 0.6s ease forwards' : 'none',
        }}
      >
        {/* Subtle ambient glow behind logo */}
        <div style={{
          position: 'absolute',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(82,201,122,0.18) 0%, transparent 65%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <Image
          src={msuLogo}
          alt="Kariah MSU"
          height={120}
          width={120}
          style={{
            objectFit: 'contain',
            animation: 'logoIn 0.9s cubic-bezier(0.34, 1.3, 0.64, 1) 0.2s both',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 0 32px rgba(82,201,122,0.4))',
          }}
          priority
        />
      </div>
    </>
  )
}
