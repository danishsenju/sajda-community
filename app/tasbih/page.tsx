'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, RotateCcw } from 'lucide-react'

const ZIKIR = [
  { key: 'subhanallah',    ar: 'سُبْحَانَ اللَّهِ',       bm: 'SubhanAllah',    target: 33  },
  { key: 'alhamdulillah',  ar: 'الْحَمْدُ لِلَّهِ',       bm: 'Alhamdulillah',  target: 33  },
  { key: 'allahuakbar',    ar: 'اللَّهُ أَكْبَرُ',         bm: 'Allahuakbar',    target: 33  },
  { key: 'astaghfirullah', ar: 'أَسْتَغْفِرُ اللَّهَ',   bm: 'Astaghfirullah', target: 100 },
] as const

type ZikirKey = typeof ZIKIR[number]['key']

const STORAGE_KEY = 'sajda_tasbih'

type TasbihState = {
  active: ZikirKey
  count: number
  totals: Record<ZikirKey, number>
}

const INITIAL: TasbihState = {
  active: 'subhanallah',
  count: 0,
  totals: { subhanallah: 0, alhamdulillah: 0, allahuakbar: 0, astaghfirullah: 0 },
}

function safeLoad(): TasbihState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...INITIAL, ...JSON.parse(raw) } : { ...INITIAL }
  } catch { return { ...INITIAL } }
}

function safeSave(s: TasbihState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* silent */ }
}

export default function TasbihPage() {
  const [state,   setState]   = useState<TasbihState>(INITIAL)
  const [flash,   setFlash]   = useState(false)
  const [mounted, setMounted] = useState(false)
  const tapRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setState(safeLoad()); setMounted(true) }, [])

  const activeZikir = ZIKIR.find(z => z.key === state.active)!

  const handleTap = useCallback(() => {
    navigator.vibrate?.(25)
    setState(prev => {
      const newCount = prev.count + 1
      const reached = newCount >= activeZikir.target

      const next: TasbihState = {
        ...prev,
        count: reached ? 0 : newCount,
        totals: { ...prev.totals, [prev.active]: prev.totals[prev.active] + 1 },
      }

      if (reached) {
        navigator.vibrate?.([50, 30, 50])
        setFlash(true)
        setTimeout(() => setFlash(false), 600)
      }

      safeSave(next)
      return next
    })
  }, [activeZikir.target])

  function switchZikir(key: ZikirKey) {
    setState(prev => {
      const next = { ...prev, active: key, count: 0 }
      safeSave(next)
      return next
    })
  }

  function resetAll() {
    const next = { ...INITIAL }
    safeSave(next)
    setState(next)
  }

  const progress = state.count / activeZikir.target
  const circumference = 2 * Math.PI * 90  // r=90
  const dashOffset = circumference * (1 - progress)

  const totalSession = Object.values(state.totals).reduce((a, b) => a + b, 0)

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 28px',
        background: 'var(--surface)',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '20px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            Utama
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.6rem, 4vw, 2rem)',
            fontWeight: 700, color: 'var(--text-primary)', margin: 0,
          }}>
            Tasbih Digital
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Zikir pembersih jiwa
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Zikir selector */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px', marginBottom: '32px',
        }}>
          {ZIKIR.map(z => (
            <button
              key={z.key}
              onClick={() => switchZikir(z.key)}
              style={{
                padding: '10px 12px', borderRadius: '12px', border: 'none',
                cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left',
                background: state.active === z.key
                  ? 'rgba(34,197,94,0.12)'
                  : 'var(--surface)',
                borderWidth: '1px', borderStyle: 'solid',
                borderColor: state.active === z.key
                  ? 'rgba(34,197,94,0.30)'
                  : 'var(--border)',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                color: state.active === z.key ? '#22C55E' : 'var(--text-secondary)',
                margin: '0 0 2px',
              }}>
                {z.bm}
              </p>
              <p style={{
                fontFamily: 'var(--font-jetbrains)', fontSize: '10px',
                color: 'var(--text-dim)', margin: 0,
              }}>
                {state.active === z.key && mounted ? `${state.totals[z.key]}` : `${mounted ? state.totals[z.key] : 0}`} kali sesi ini
              </p>
            </button>
          ))}
        </div>

        {/* Main tap area */}
        <button
          ref={tapRef}
          onClick={handleTap}
          style={{
            width: '100%', border: 'none', cursor: 'pointer',
            background: 'transparent', padding: 0, display: 'block',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <div style={{
            position: 'relative', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '48px 24px',
            borderRadius: '20px',
            background: flash
              ? 'rgba(34,197,94,0.10)'
              : 'var(--surface)',
            border: `1px solid ${flash ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`,
            transition: 'background 0.2s, border-color 0.2s',
            overflow: 'hidden',
          }}>

            {/* SVG circular progress */}
            <svg
              width="220" height="220"
              viewBox="0 0 220 220"
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.5 }}
            >
              <circle cx="110" cy="110" r="90" fill="none" stroke="var(--border)" strokeWidth="4" />
              <circle
                cx="110" cy="110" r="90" fill="none"
                stroke="#22C55E" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={mounted ? dashOffset : circumference}
                transform="rotate(-90 110 110)"
                style={{ transition: 'stroke-dashoffset 0.2s ease' }}
              />
            </svg>

            {/* Count */}
            <p style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 'clamp(4rem, 18vw, 6rem)',
              fontWeight: 700,
              color: flash ? '#22C55E' : 'var(--text-primary)',
              lineHeight: 1, margin: 0,
              transition: 'color 0.2s',
              position: 'relative', zIndex: 1,
            }}>
              {mounted ? state.count : 0}
            </p>

            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
              color: 'var(--text-dim)', margin: '6px 0 16px',
              position: 'relative', zIndex: 1,
            }}>
              / {activeZikir.target}
            </p>

            {/* Arabic zikir */}
            <p style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: 'clamp(1.4rem, 5vw, 2rem)',
              color: 'var(--text-secondary)',
              direction: 'rtl',
              lineHeight: 1.8,
              margin: 0,
              position: 'relative', zIndex: 1,
            }}>
              {activeZikir.ar}
            </p>

            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
              color: 'var(--text-dim)', marginTop: '6px',
              position: 'relative', zIndex: 1,
            }}>
              Ketuk untuk tambah
            </p>
          </div>
        </button>

        {/* Session total */}
        <div style={{
          marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderRadius: '12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Jumlah sesi ini
          </p>
          <span style={{
            fontFamily: 'var(--font-jetbrains)', fontSize: '20px',
            fontWeight: 700, color: '#22C55E',
          }}>
            {mounted ? totalSession : 0}
          </span>
        </div>

        {/* Per-zikir breakdown */}
        {mounted && totalSession > 0 && (
          <div style={{
            marginTop: '10px', padding: '14px 18px', borderRadius: '12px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            {ZIKIR.filter(z => state.totals[z.key] > 0).map(z => (
              <div key={z.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  {z.bm}
                </p>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: 'var(--text-dim)' }}>
                  {state.totals[z.key]}×
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Reset */}
        <button
          onClick={resetAll}
          style={{
            marginTop: '16px', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '11px', borderRadius: '12px',
            background: 'transparent', border: '1px solid var(--border)',
            cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px', color: 'var(--text-secondary)',
          }}
        >
          <RotateCcw style={{ width: '13px', height: '13px' }} />
          Mulakan Semula
        </button>
      </div>
    </div>
  )
}
