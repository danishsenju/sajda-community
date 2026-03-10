'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Circle, Lock, Users, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useSolatTracker, type PrayerKey } from '@/hooks/useSolatTracker'

const PRAYERS: { key: PrayerKey; bm: string; ar: string }[] = [
  { key: 'fajr',    bm: 'Subuh',   ar: 'الْفَجْر'   },
  { key: 'dhuhr',   bm: 'Zohor',   ar: 'الظُّهْر'   },
  { key: 'asr',     bm: 'Asar',    ar: 'الْعَصْر'   },
  { key: 'maghrib', bm: 'Maghrib', ar: 'الْمَغْرِب' },
  { key: 'isha',    bm: 'Isyak',   ar: 'الْعِشَاء'  },
]

type CommCount = Record<PrayerKey, number>

export default function SolatTrackerPage() {
  const { todayLog, streak, togglePrayer, mounted, today } = useSolatTracker()
  const [counts,  setCounts]  = useState<CommCount>({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 })
  const [tapping, setTapping] = useState<PrayerKey | null>(null)

  const doneSolat = PRAYERS.filter(p => todayLog[p.key]).length

  // Fetch community counts
  useEffect(() => {
    async function fetchCounts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('solat_counts')
        .select('prayer, count')
        .eq('pray_date', today)
      if (data) {
        const map: CommCount = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
        data.forEach(r => { map[r.prayer as PrayerKey] = r.count })
        setCounts(map)
      }
    }
    fetchCounts()

    // Realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel('solat_counts_rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solat_counts', filter: `pray_date=eq.${today}` },
        (payload) => {
          const row = payload.new as { prayer: PrayerKey; count: number }
          if (row?.prayer) setCounts(prev => ({ ...prev, [row.prayer]: row.count }))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [today])

  async function handleTap(prayer: PrayerKey) {
    setTapping(prayer)
    navigator.vibrate?.(30)
    await togglePrayer(prayer)
    setTimeout(() => setTapping(null), 300)
  }

  const totalCommunity = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 32px',
        background: 'linear-gradient(180deg, var(--elevated) 0%, var(--void) 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Geometric bg */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sol-geo" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                <polygon points="24,2 46,12 46,36 24,46 2,36 2,12" fill="none" stroke="#22C55E" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sol-geo)"/>
          </svg>
        </div>

        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            Utama
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Lock style={{ width: '12px', height: '12px', color: 'var(--text-dim)' }} />
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)',
            }}>
              Peribadi & Sulit
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1,
          }}>
            Jejak Solat
          </h1>

          {/* Community count banner */}
          <div style={{
            marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: '100px',
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.14)',
          }}>
            <Users style={{ width: '12px', height: '12px', color: '#22C55E' }} />
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, color: '#22C55E' }}>
                {totalCommunity}
              </span>
              {' '}jemaah solat hari ini
            </span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '28px 20px 96px' }}>

        {/* Progress + Streak row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '20px', gap: '12px',
        }}>
          {/* Dot progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {PRAYERS.map(p => (
              <div key={p.key} style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: mounted && todayLog[p.key]
                  ? '#22C55E'
                  : 'var(--border)',
                border: mounted && todayLog[p.key]
                  ? '1px solid rgba(34,197,94,0.4)'
                  : '1px solid var(--border)',
                transition: 'all 0.3s ease',
                boxShadow: mounted && todayLog[p.key]
                  ? '0 0 6px rgba(34,197,94,0.5)'
                  : 'none',
              }} />
            ))}
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
              color: 'var(--text-dim)', marginLeft: '4px',
            }}>
              {mounted ? doneSolat : 0} / 5 hari ini
            </span>
          </div>

          {/* Streak */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame style={{ width: '14px', height: '14px', color: streak > 0 ? '#F59E0B' : 'var(--text-dim)' }} />
            <span style={{
              fontFamily: 'var(--font-jetbrains)', fontSize: '16px', fontWeight: 700,
              color: streak > 0 ? '#F59E0B' : 'var(--text-dim)',
            }}>
              {mounted ? streak : 0}
            </span>
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)' }}>
              hari
            </span>
          </div>
        </div>

        {/* Streak milestone banner */}
        {mounted && streak >= 7 && (
          <div style={{
            marginBottom: '16px', padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <Flame style={{ width: '16px', height: '16px', color: '#F59E0B', flexShrink: 0 }} />
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(245,158,11,0.9)', margin: 0 }}>
              MasyaAllah! <strong>{streak} hari</strong> berturut-turut — Teruskan istiqamah!
            </p>
          </div>
        )}

        {/* Prayer list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PRAYERS.map((prayer, i) => {
            const done = mounted && todayLog[prayer.key]
            const isTapping = tapping === prayer.key
            const commCount = counts[prayer.key]

            return (
              <button
                key={prayer.key}
                onClick={() => handleTap(prayer.key)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 18px', borderRadius: '14px',
                  background: done ? 'rgba(34,197,94,0.07)' : 'var(--surface)',
                  border: `1px solid ${done ? 'rgba(34,197,94,0.22)' : 'var(--border)'}`,
                  transition: 'all 0.2s ease',
                  transform: isTapping ? 'scale(0.97)' : 'scale(1)',
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {/* Check icon */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'rgba(34,197,94,0.15)' : 'var(--elevated)',
                  border: `1.5px solid ${done ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.25s ease',
                  boxShadow: done ? '0 0 10px rgba(34,197,94,0.25)' : 'none',
                }}>
                  {done
                    ? <CheckCircle2 style={{ width: '18px', height: '18px', color: '#22C55E' }} />
                    : <Circle style={{ width: '18px', height: '18px', color: 'var(--text-dim)' }} />
                  }
                </div>

                {/* Name */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-amiri)',
                    fontSize: '18px',
                    color: done ? '#22C55E' : 'var(--text-dim)',
                    direction: 'rtl', textAlign: 'right',
                    lineHeight: 1, margin: '0 0 2px',
                    transition: 'color 0.2s',
                  }}>
                    {prayer.ar}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '16px', fontWeight: 600,
                    color: done ? 'var(--text-primary)' : 'var(--text-secondary)',
                    margin: 0, transition: 'color 0.2s',
                  }}>
                    {prayer.bm}
                  </p>
                </div>

                {/* Community count */}
                {commCount > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    flexShrink: 0,
                  }}>
                    <Users style={{ width: '10px', height: '10px', color: 'var(--text-dim)' }} />
                    <span style={{
                      fontFamily: 'var(--font-jetbrains)', fontSize: '12px',
                      color: 'var(--text-dim)',
                    }}>
                      {commCount}
                    </span>
                  </div>
                )}

                {/* Done label */}
                {done && (
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '10px',
                    fontWeight: 700, letterSpacing: '0.08em',
                    color: '#22C55E',
                    padding: '3px 8px', borderRadius: '100px',
                    background: 'rgba(34,197,94,0.10)',
                  }}>
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Privacy note */}
        <div style={{
          marginTop: '24px', display: 'flex', alignItems: 'flex-start', gap: '8px',
          padding: '12px 14px', borderRadius: '10px',
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <Lock style={{ width: '11px', height: '11px', color: 'var(--text-dim)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
            color: 'var(--text-dim)', margin: 0, lineHeight: 1.6,
          }}>
            Rekod solat anda tersimpan di peranti ini sahaja. Tiada nama atau profil dipaparkan kepada jemaah lain.
            Kiraan komuniti adalah tanpa nama.
          </p>
        </div>

        {/* Muhasabah reminder */}
        <div style={{
          marginTop: '12px', padding: '16px 18px', borderRadius: '12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-amiri)', fontSize: '16px',
            color: 'var(--text-dim)', direction: 'rtl',
            lineHeight: 2, margin: '0 0 6px',
          }}>
            حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
            color: 'var(--text-dim)', margin: 0,
          }}>
            "Hitung dirimu sebelum kamu dihitung" — Umar ibn al-Khattab (ra)
          </p>
        </div>
      </div>
    </div>
  )
}
