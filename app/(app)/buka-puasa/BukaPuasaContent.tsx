'use client'

import { useState, useEffect } from 'react'
import { Moon, LocateFixed, Loader2 } from 'lucide-react'
import { BukaPuasaCountdown } from './BukaPuasaCountdown'
import Link from 'next/link'

const DEFAULT_ZONE  = 'SGR01'
const DEFAULT_LABEL = 'Zon Gombak · Selangor'

interface PrayerTimes {
  imsak:   string | null
  fajr:    string | null
  syuruk:  string | null
  dhuhr:   string | null
  asr:     string | null
  maghrib: string | null
  isha:    string | null
}

export function BukaPuasaContent() {
  const [zone,      setZone]      = useState(DEFAULT_ZONE)
  const [zoneLabel, setZoneLabel] = useState(DEFAULT_LABEL)
  const [zoneCity,  setZoneCity]  = useState('')
  const [times,     setTimes]     = useState<PrayerTimes | null>(null)
  const [source,    setSource]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [locState,  setLocState]  = useState<'idle' | 'detecting' | 'done' | 'error'>('idle')

  const todayFormatted = new Date().toLocaleDateString('ms-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
  })
  const hijriDate = new Intl.DateTimeFormat('ms-MY-u-ca-islamic-umalqura', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())

  async function fetchTimes(z: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/prayer?zone=${encodeURIComponent(z)}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const [imsak, fajr, syuruk, dhuhr, asr, maghrib, isha] = json.times as (string | null)[]
      setTimes({ imsak, fajr, syuruk, dhuhr, asr, maghrib, isha })
      setSource(json.source === 'jakim' ? 'JAKIM e-Solat' : 'Aladhan API')
    } catch {
      setTimes(null)
    } finally {
      setLoading(false)
    }
  }

  // On mount: restore zone from localStorage then fetch
  useEffect(() => {
    let z = DEFAULT_ZONE
    let label = DEFAULT_LABEL
    let city = ''
    try {
      z     = localStorage.getItem('kariah_zone')       ?? DEFAULT_ZONE
      label = localStorage.getItem('kariah_zone_label') ?? DEFAULT_LABEL
      city  = localStorage.getItem('kariah_zone_city')  ?? ''
    } catch {}
    setZone(z)
    setZoneLabel(label)
    setZoneCity(city)
    if (z !== DEFAULT_ZONE) setLocState('done')
    fetchTimes(z)
  }, [])

  async function detectLocation() {
    if (!navigator.geolocation) { setLocState('error'); return }
    setLocState('detecting')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords
          const res  = await fetch(`/api/prayer/zone?lat=${lat}&lng=${lng}`)
          const data = await res.json()
          const newZone  = data.code  ?? DEFAULT_ZONE
          const newLabel = data.label ?? DEFAULT_LABEL
          const newCity  = data.city  ?? ''
          setZone(newZone)
          setZoneLabel(newLabel)
          setZoneCity(newCity)
          setLocState('done')
          try {
            localStorage.setItem('kariah_zone',       newZone)
            localStorage.setItem('kariah_zone_label', newLabel)
            localStorage.setItem('kariah_zone_city',  newCity)
          } catch {}
          fetchTimes(newZone)
        } catch {
          setLocState('error')
        }
      },
      () => setLocState('error'),
      { timeout: 10000, maximumAge: 300000 }
    )
  }

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

        {/* Zone badge + detect button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '5px 13px', borderRadius: '20px',
            background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.25)',
          }}>
            <Moon style={{ width: '12px', height: '12px', color: '#F59E0B' }} />
            <span style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F59E0B',
            }}>
              Ramadan Kareem
            </span>
          </div>
          <span style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
            letterSpacing: '0.12em', color: 'var(--text-dim)',
          }}>
            {zoneLabel}{zoneCity ? ` · ${zoneCity}` : ''}
          </span>

          {/* Location detect button */}
          <button
            onClick={detectLocation}
            disabled={locState === 'detecting'}
            title={locState === 'done' ? 'Lokasi dikesan' : 'Kesan lokasi semasa'}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
              border: `1px solid ${locState === 'done' ? 'rgba(82,201,122,0.4)' : locState === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.10)'}`,
              background: locState === 'done' ? 'rgba(82,201,122,0.10)' : 'rgba(255,255,255,0.04)',
              cursor: locState === 'detecting' ? 'default' : 'pointer',
            }}
          >
            {locState === 'detecting'
              ? <Loader2 style={{ width: '12px', height: '12px', color: '#52c97a', animation: 'spin 1s linear infinite' }} />
              : <LocateFixed style={{ width: '12px', height: '12px', color: locState === 'done' ? '#52c97a' : locState === 'error' ? '#EF4444' : 'rgba(255,255,255,0.35)' }} />
            }
          </button>
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
          fontFamily: 'var(--font-jakarta)', fontSize: '13px',
          color: 'rgba(245,158,11,0.65)', letterSpacing: '0.04em',
        }}>
          {hijriDate}
        </p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 24px 48px' }}>

        {loading ? (
          /* Skeleton */
          <div style={{
            borderRadius: '20px', height: '200px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(252,211,77,0.08)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ) : times?.maghrib ? (
          <>
            {/* ── PREMIUM TIMEPIECE CARD ── */}
            <div style={{
              borderRadius: '20px', overflow: 'hidden', marginBottom: '16px',
              background: 'linear-gradient(145deg, #08100C 0%, #0D1A11 50%, #0A120E 100%)',
              border: '1px solid rgba(252,211,77,0.18)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(252,211,77,0.06) inset',
            }}>
              <div style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #F59E0B 30%, #FCD34D 50%, #F59E0B 70%, transparent)',
              }} />
              <div style={{
                padding: '14px 22px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'rgba(252,211,77,0.6)',
                }}>
                  Maghrib &bull; Berbuka Puasa
                </span>
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                  color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em',
                }}>
                  {source}
                </span>
              </div>
              <div style={{
                padding: '28px 22px 24px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
                gap: '20px', alignItems: 'center',
              }}>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: 'rgba(252,211,77,0.4)', marginBottom: '8px',
                  }}>
                    Waktu Berbuka
                  </p>
                  <div style={{
                    fontFamily: 'var(--font-jetbrains)', fontWeight: 700,
                    fontSize: 'clamp(2rem, 5.5vw, 2.8rem)',
                    lineHeight: 1, letterSpacing: '-0.03em',
                    color: '#FCD34D', textShadow: '0 0 40px rgba(252,211,77,0.3)',
                  }}>
                    {times.maghrib}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#FCD34D', boxShadow: '0 0 8px rgba(252,211,77,0.8)',
                    }} />
                    <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                      Hari ini
                    </span>
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '20px' }}>
                  <p style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)', marginBottom: '14px',
                  }}>
                    Masa Berbaki
                  </p>
                  <BukaPuasaCountdown maghribTime={times.maghrib} imsakTime={times.imsak} />
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
                <div style={{
                  padding: '12px 18px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)',
                  }}>
                    Waktu Solat Hari Ini
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
                  {prayers.map((p, i) => (
                    <div key={p.key} style={{
                      padding: '14px 16px',
                      borderRight: i < prayers.length - 1 ? '1px solid var(--border)' : 'none',
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
                        fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: p.highlight ? 'rgba(252,211,77,0.7)' : 'var(--text-dim)', marginBottom: '6px',
                      }}>
                        {p.label}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-jetbrains)', fontSize: '18px', fontWeight: 700,
                        color: p.highlight ? '#FCD34D' : 'var(--text-primary)', letterSpacing: '-0.01em',
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
              border: '1px solid var(--border)', background: 'var(--surface)',
            }}>
              <div style={{
                padding: '12px 20px', borderBottom: '1px solid var(--border)',
                background: 'rgba(82,201,122,0.04)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'var(--primary)' }} />
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--primary)',
                }}>
                  Doa Berbuka Puasa
                </span>
              </div>
              <div style={{ padding: '20px' }}>
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
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontStyle: 'italic',
                  color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '10px',
                }}>
                  &quot;Allahumma laka sumtu wa bika amantu wa &apos;alaika tawakkaltu wa &apos;ala rizqika aftartu&quot;
                </p>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                  color: 'var(--text-dim)', lineHeight: 1.75,
                  paddingTop: '12px', borderTop: '1px solid var(--border)',
                }}>
                  &quot;Ya Allah, kerana-Mu aku berpuasa, dengan-Mu aku beriman, kepada-Mu aku bertawakkal, dan dengan rezeki-Mu aku berbuka.&quot;
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: '20px', flexWrap: 'wrap', gap: '8px',
            }}>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                color: 'var(--text-dim)', opacity: 0.6,
              }}>
                {source} · Zon {zone}
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
          <div style={{
            textAlign: 'center', padding: '64px 20px',
            borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)',
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
