export const dynamic = 'force-dynamic'

import { Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { BukaPuasaCountdown } from './BukaPuasaCountdown'
import Link from 'next/link'

const JAKIM_ZONE = 'SGR01' // Petaling / Sungai Buloh, Selangor

interface PrayerData {
  imsak:   string | null
  fajr:    string | null
  syuruk:  string | null
  dhuhr:   string | null
  asr:     string | null
  maghrib: string | null
  isha:    string | null
}

async function fetchJakimPrayerTimes(): Promise<PrayerData | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000) // 3s timeout
    const res = await fetch(
      `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${JAKIM_ZONE}`,
      { next: { revalidate: 3600 }, signal: controller.signal }
    )
    clearTimeout(timer)
    if (!res.ok) return null
    const json = await res.json()
    const pt = json?.prayerTime?.[0]
    if (!pt) return null
    return {
      imsak:   pt.imsak   ?? null,
      fajr:    pt.fajr    ?? null,
      syuruk:  pt.syuruk  ?? null,
      dhuhr:   pt.dhuhr   ?? null,
      asr:     pt.asr     ?? null,
      maghrib: pt.maghrib ?? null,
      isha:    pt.isha    ?? null,
    }
  } catch {
    return null
  }
}

async function fetchAladhanFallback(): Promise<PrayerData | null> {
  try {
    const d   = new Date()
    const dd  = String(d.getDate()).padStart(2, '0')
    const mm  = String(d.getMonth() + 1).padStart(2, '0')
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${dd}-${mm}-${d.getFullYear()}?latitude=3.1716&longitude=101.5344&method=11`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const json = await res.json()
    const t = json?.data?.timings
    return {
      imsak:   t?.Imsak?.slice(0, 5) ?? null,
      fajr:    t?.Fajr?.slice(0, 5)  ?? null,
      syuruk:  t?.Sunrise?.slice(0, 5) ?? null,
      dhuhr:   t?.Dhuhr?.slice(0, 5) ?? null,
      asr:     t?.Asr?.slice(0, 5)   ?? null,
      maghrib: t?.Maghrib?.slice(0, 5) ?? null,
      isha:    t?.Isha?.slice(0, 5)  ?? null,
    }
  } catch {
    return null
  }
}

export default async function BukaPuasaPage() {
  const supabase = await createClient()
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })

  // Fetch JAKIM + Supabase + Aladhan in parallel — use first good result
  const [jakimResult, supabaseResult, aladhanResult] = await Promise.all([
    fetchJakimPrayerTimes(),
    supabase.from('prayer_times').select('fajr, maghrib, date').eq('date', today).maybeSingle(),
    fetchAladhanFallback(),
  ])

  let times: PrayerData | null = null
  let source = ''

  if (jakimResult?.maghrib) {
    times = jakimResult
    source = 'JAKIM e-Solat'
  } else if (supabaseResult.data?.maghrib) {
    const row = supabaseResult.data
    times = {
      imsak: null, fajr: row.fajr ?? null, syuruk: null,
      dhuhr: null, asr: null, maghrib: row.maghrib, isha: null,
    }
    source = 'Data AJK'
  } else if (aladhanResult?.maghrib) {
    times = aladhanResult
    source = 'Aladhan API'
  }

  const todayFormatted = new Date().toLocaleDateString('ms-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
  })

  const hijriDate = new Intl.DateTimeFormat('ms-MY-u-ca-islamic-umalqura', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())

  const prayers = [
    { key: 'imsak',   label: 'Imsak',   time: times?.imsak,   accent: 'rgba(148,163,184,0.9)' },
    { key: 'fajr',    label: 'Subuh',   time: times?.fajr,    accent: '#6EE7B7' },
    { key: 'syuruk',  label: 'Syuruk',  time: times?.syuruk,  accent: 'rgba(148,163,184,0.9)' },
    { key: 'dhuhr',   label: 'Zohor',   time: times?.dhuhr,   accent: '#93C5FD' },
    { key: 'asr',     label: 'Asar',    time: times?.asr,     accent: '#C4B5FD' },
    { key: 'maghrib', label: 'Maghrib', time: times?.maghrib, accent: '#FCD34D', highlight: true },
    { key: 'isha',    label: 'Isyak',   time: times?.isha,    accent: '#6EE7B7' },
  ].filter(p => p.time)

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px 0' }}>

        {/* Zone badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '5px 13px', borderRadius: '20px',
            background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.25)',
          }}>
            <Moon style={{ width: '12px', height: '12px', color: '#F59E0B' }} />
            <span style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F59E0B',
            }}>
              Ramadan Kareem
            </span>
          </div>
          <span style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 600,
            letterSpacing: '0.12em', color: 'var(--text-dim)',
          }}>
            Zon {JAKIM_ZONE} · Selangor
          </span>
        </div>

        {/* Main heading */}
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(2.4rem, 7vw, 4rem)',
          fontWeight: 800, lineHeight: 1,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          marginBottom: '10px',
        }}>
          Waktu<br />
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 60%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Berbuka
          </span>
        </h1>

        {/* Dates */}
        <p style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 500,
          color: 'var(--text-secondary)', marginBottom: '2px', textTransform: 'capitalize',
        }}>
          {todayFormatted}
        </p>
        <p style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '11px',
          color: 'rgba(245,158,11,0.65)', letterSpacing: '0.04em',
        }}>
          {hijriDate}
        </p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 24px 48px' }}>

        {times?.maghrib ? (
          <>
            {/* ── PREMIUM TIMEPIECE CARD ── always dark ── */}
            <div style={{
              borderRadius: '20px', overflow: 'hidden', marginBottom: '16px',
              background: 'linear-gradient(145deg, #08100C 0%, #0D1A11 50%, #0A120E 100%)',
              border: '1px solid rgba(252,211,77,0.18)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(252,211,77,0.06) inset',
            }}>
              {/* Top accent line */}
              <div style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #F59E0B 30%, #FCD34D 50%, #F59E0B 70%, transparent)',
              }} />

              {/* Header row */}
              <div style={{
                padding: '14px 22px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'rgba(252,211,77,0.6)',
                }}>
                  Maghrib &bull; Berbuka Puasa
                </span>
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 600,
                  color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em',
                }}>
                  {source}
                </span>
              </div>

              {/* Main content */}
              <div style={{
                padding: '28px 22px 24px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
                gap: '20px',
                alignItems: 'center',
              }}>
                {/* Left: Big time display */}
                <div>
                  <p style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: 'rgba(252,211,77,0.4)', marginBottom: '8px',
                  }}>
                    Waktu Berbuka
                  </p>
                  <div style={{
                    fontFamily: 'var(--font-jetbrains)', fontWeight: 700,
                    fontSize: 'clamp(2rem, 5.5vw, 2.8rem)',
                    lineHeight: 1, letterSpacing: '-0.03em',
                    color: '#FCD34D',
                    textShadow: '0 0 40px rgba(252,211,77,0.3)',
                  }}>
                    {times.maghrib}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px',
                  }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#FCD34D',
                      boxShadow: '0 0 8px rgba(252,211,77,0.8)',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                      Hari ini
                    </span>
                  </div>
                </div>

                {/* Right: Countdown */}
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '20px' }}>
                  <p style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)', marginBottom: '14px',
                  }}>
                    Masa Berbaki
                  </p>
                  <BukaPuasaCountdown
                    maghribTime={times.maghrib}
                    imsakTime={times.imsak}
                  />
                </div>
              </div>
            </div>

            {/* ── PRAYER TIMES GRID ── */}
            {prayers.length > 0 && (
              <div style={{
                borderRadius: '16px', overflow: 'hidden',
                background: 'var(--surface)', border: '1px solid var(--border)',
                marginBottom: '16px',
              }}>
                {/* Header */}
                <div style={{
                  padding: '12px 18px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                  }}>
                    Waktu Solat Hari Ini
                  </span>
                </div>

                {/* Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                }}>
                  {prayers.map((p, i) => (
                    <div key={p.key} style={{
                      padding: '14px 16px',
                      borderRight: i < prayers.length - 1 ? '1px solid var(--border)' : 'none',
                      borderBottom: '0',
                      background: p.highlight ? 'rgba(252,211,77,0.05)' : 'transparent',
                      position: 'relative',
                    }}>
                      {p.highlight && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                          background: 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                        }} />
                      )}
                      <p style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: p.highlight ? 'rgba(252,211,77,0.7)' : 'var(--text-dim)',
                        marginBottom: '6px',
                      }}>
                        {p.label}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-jetbrains)', fontSize: '18px', fontWeight: 700,
                        color: p.highlight ? '#FCD34D' : 'var(--text-primary)',
                        letterSpacing: '-0.01em',
                      }}>
                        {p.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DUA BERBUKA ── */}
            <div style={{
              borderRadius: '16px', overflow: 'hidden',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              {/* Top bar */}
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(82,201,122,0.04)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <div style={{
                  width: '3px', height: '14px', borderRadius: '2px',
                  background: 'var(--primary)',
                }} />
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--primary)',
                }}>
                  Doa Berbuka Puasa
                </span>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Arabic text */}
                <div style={{
                  padding: '16px', borderRadius: '10px', marginBottom: '14px',
                  background: 'rgba(82,201,122,0.04)', border: '1px solid rgba(82,201,122,0.1)',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-amiri)', fontSize: '24px', lineHeight: 2.0,
                    color: 'var(--text-primary)', direction: 'rtl', textAlign: 'right',
                  }}>
                    اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
                  </p>
                </div>

                {/* Transliteration */}
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontStyle: 'italic',
                  color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '10px',
                }}>
                  &quot;Allahumma laka sumtu wa bika amantu wa &apos;alaika tawakkaltu wa &apos;ala rizqika aftartu&quot;
                </p>

                {/* Translation */}
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                  color: 'var(--text-dim)', lineHeight: 1.75,
                  paddingTop: '12px', borderTop: '1px solid var(--border)',
                }}>
                  &quot;Ya Allah, kerana-Mu aku berpuasa, dengan-Mu aku beriman, kepada-Mu aku bertawakkal, dan dengan rezeki-Mu aku berbuka.&quot;
                </p>
              </div>
            </div>

            {/* Footer links */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: '20px', flexWrap: 'wrap', gap: '8px',
            }}>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                color: 'var(--text-dim)', opacity: 0.6,
              }}>
                Waktu JAKIM Zon {JAKIM_ZONE} · Saujana Utama
              </p>
              <Link href="/" style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                color: 'var(--primary)', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                Semua waktu solat →
              </Link>
            </div>
          </>
        ) : (
          /* Error state */
          <div style={{
            textAlign: 'center', padding: '64px 20px',
            borderRadius: '16px', border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <p style={{
              fontFamily: 'var(--font-playfair)', fontSize: '22px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '10px',
            }}>
              Gagal Memuatkan Waktu
            </p>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px',
              color: 'var(--text-dim)', lineHeight: 1.6,
            }}>
              Semak sambungan internet dan muat semula halaman ini.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
