'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Mail, Eye, EyeOff, User, Lock, CheckCircle2 } from 'lucide-react'
import { signIn, signUp, signInWithGoogle } from './actions'
import sajdaLogo from '@/images/sajda-logo.png'
import masjidBg  from '@/images/masjidmsu.png'

type Props = {
  error?: string
  message?: string
  redirectTo: string
  initialMode: 'login' | 'signup'
}

export function LoginForm({ error, message, redirectTo, initialMode }: Props) {
  const [mode, setMode]               = useState<'login' | 'signup'>(initialMode)
  const [showPw, setShowPw]           = useState(false)
  const [showPw2, setShowPw2]         = useState(false)
  const [origin, setOrigin]           = useState('')
  const [pending, setPending]         = useState(false)
  const [googlePending, setGooglePending] = useState(false)
  const [clientError, setClientError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { setOrigin(window.location.origin) }, [])
  useEffect(() => { setClientError('') }, [mode])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setClientError('')
    const data = new FormData(e.currentTarget)

    if (mode === 'signup') {
      const pw  = data.get('password') as string
      const pw2 = data.get('confirmPassword') as string
      if (pw.length < 6) { setClientError('Kata laluan minimum 6 aksara.'); return }
      if (pw !== pw2)    { setClientError('Kata laluan tidak sepadan. Cuba semula.'); return }
    }

    setPending(true)
    try {
      await (mode === 'login' ? signIn : signUp)(data)
    } catch { /* redirect() throws — expected */ } finally {
      setPending(false)
    }
  }

  async function handleGoogle() {
    setGooglePending(true)
    const data = new FormData()
    data.set('next',   redirectTo)
    data.set('origin', origin)
    try {
      await signInWithGoogle(data)
    } catch { /* redirect() throws — expected */ } finally {
      setGooglePending(false)
    }
  }

  const displayError = clientError || error

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#F0FDF4',
    fontSize: '14px',
    fontFamily: 'var(--font-dm-sans)',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(186,230,200,0.85)',
    fontFamily: 'var(--font-dm-sans)',
    marginBottom: '6px',
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>

      {/* ── BACKGROUND — masjid image with dark vignette ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <Image
          src={masjidBg}
          alt=""
          fill
          className="object-cover"
          style={{ filter: 'blur(3px) brightness(0.28)', transform: 'scale(1.06)' }}
          priority
        />
        {/* Radial vignette — darkest at edges, slightly lighter in center */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(8,9,14,0.35) 0%, rgba(8,9,14,0.75) 100%)',
        }} />
        {/* Green tint glow around the card area */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(34,197,94,0.06) 0%, transparent 65%)',
        }} />
      </div>

      {/* ── CARD ── */}
      <div style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Image
            src={sajdaLogo}
            alt="Sajda"
            height={44}
            width={115}
            style={{ filter: 'brightness(0) invert(1)', display: 'inline-block', marginBottom: '10px' }}
          />
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '12px',
            color: 'rgba(186,230,200,0.55)',
            letterSpacing: '0.06em',
          }}>
            Komuniti Masjid Saujana Utama
          </p>
        </div>

        {/* Glassmorphism card */}
        <div style={{
          background: 'rgba(15,16,22,0.80)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '20px',
          padding: '28px 24px',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}>

          {/* Mode tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            padding: '3px',
            marginBottom: '22px',
            gap: '2px',
          }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-dm-sans)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: mode === m ? 'rgba(255,255,255,0.10)' : 'transparent',
                  color: mode === m ? '#F0FDF4' : 'rgba(186,230,200,0.50)',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.30)' : 'none',
                }}
              >
                {m === 'login' ? 'Log Masuk' : 'Daftar Akaun'}
              </button>
            ))}
          </div>

          {/* ── GOOGLE BUTTON ── */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googlePending}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '11px',
              borderRadius: '10px',
              background: googlePending ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#F0FDF4',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--font-dm-sans)',
              cursor: googlePending ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              marginBottom: '16px',
            }}
          >
            {/* Google G icon */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googlePending ? 'Sila tunggu…' : 'Teruskan dengan Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.10)' }} />
            <span style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
              color: 'rgba(186,230,200,0.55)',
              fontWeight: 500,
            }}>
              atau dengan emel
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.10)' }} />
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            <input type="hidden" name="next"   value={redirectTo} />
            <input type="hidden" name="origin" value={origin} />

            {/* Full name — signup only */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>
                  <User style={{ width: '11px', height: '11px', display: 'inline', marginRight: '5px' }} />
                  Nama Penuh
                </label>
                <input type="text" name="fullName" placeholder="Ahmad bin Ali"
                  required autoComplete="name" style={inputStyle} />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>
                <Mail style={{ width: '11px', height: '11px', display: 'inline', marginRight: '5px' }} />
                Emel
              </label>
              <input type="email" name="email" placeholder="ahmad@email.com"
                required autoComplete="email" style={inputStyle} />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>
                <Lock style={{ width: '11px', height: '11px', display: 'inline', marginRight: '5px' }} />
                Kata Laluan
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{ ...inputStyle, paddingRight: '42px' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(186,230,200,0.55)', padding: '2px',
                }}>
                  {showPw ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                </button>
              </div>
            </div>

            {/* Confirm password — signup only */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>
                  <CheckCircle2 style={{ width: '11px', height: '11px', display: 'inline', marginRight: '5px' }} />
                  Sahkan Kata Laluan
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw2 ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{ ...inputStyle, paddingRight: '42px' }}
                  />
                  <button type="button" onClick={() => setShowPw2(v => !v)} style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(186,230,200,0.55)', padding: '2px',
                  }}>
                    {showPw2 ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <p style={{ fontSize: '13px', color: 'rgba(186,230,200,0.55)', fontFamily: 'var(--font-dm-sans)', marginTop: '-4px' }}>
                Min. 6 aksara. Semak emel untuk mengesahkan akaun selepas daftar.
              </p>
            )}

            {/* Error */}
            {displayError && (
              <div style={{
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
                fontSize: '12px', color: '#F87171', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5,
              }}>
                {displayError}
              </div>
            )}

            {/* Success message */}
            {message && !displayError && (
              <div style={{
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)',
                fontSize: '12px', color: '#4ADE80', fontFamily: 'var(--font-dm-sans)', lineHeight: 1.5,
              }}>
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                borderRadius: '12px',
                background: pending ? 'rgba(34,197,94,0.50)' : '#22C55E',
                color: '#08090E',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'var(--font-dm-sans)',
                border: 'none',
                cursor: pending ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease',
                marginTop: '4px',
              }}
            >
              {pending ? 'Sila tunggu…' : mode === 'login' ? 'Log Masuk' : 'Buat Akaun'}
            </button>
          </form>

          {/* Guest link */}
          <div style={{ marginTop: '18px', textAlign: 'center' }}>
            <a href="/" style={{
              fontSize: '12px', color: 'rgba(186,230,200,0.55)',
              fontFamily: 'var(--font-dm-sans)', textDecoration: 'none',
            }}>
              Teruskan sebagai tetamu →
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
