'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react'

const MECCA_LAT = 21.4225
const MECCA_LNG = 39.8262

function toRad(deg: number) { return (deg * Math.PI) / 180 }
function toDeg(rad: number) { return (rad * 180) / Math.PI }

function calcQibla(lat: number, lng: number): number {
  const φ1 = toRad(lat)
  const φ2 = toRad(MECCA_LAT)
  const Δλ = toRad(MECCA_LNG - lng)
  const x = Math.sin(Δλ) * Math.cos(φ2)
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const bearing = toDeg(Math.atan2(x, y))
  return (bearing + 360) % 360
}

function calcDistance(lat: number, lng: number): string {
  const R = 6371
  const φ1 = toRad(lat), φ2 = toRad(MECCA_LAT)
  const Δφ = toRad(MECCA_LAT - lat), Δλ = toRad(MECCA_LNG - lng)
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  const d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return d > 1000 ? `${(d / 1000).toFixed(1)}k km` : `${Math.round(d)} km`
}

function directionName(deg: number): string {
  const dirs = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut']
  return dirs[Math.round(deg / 45) % 8]
}

export default function QiblatPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'>('idle')
  const [qibla, setQibla] = useState<number | null>(null)
  const [deviceHeading, setDeviceHeading] = useState<number>(0)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [distance, setDistance] = useState<string>('')
  const [compassReady, setCompassReady] = useState(false)
  const [needsOrientationPermission, setNeedsOrientationPermission] = useState(false)

  const startCompass = useCallback(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const h = (e as any).webkitCompassHeading
      if (h != null) {
        setDeviceHeading(h)
        setCompassReady(true)
      } else if (e.absolute && e.alpha != null) {
        setDeviceHeading((360 - e.alpha + 360) % 360)
        setCompassReady(true)
      } else if (e.alpha != null) {
        setDeviceHeading((360 - e.alpha + 360) % 360)
        setCompassReady(true)
      }
    }
    window.addEventListener('deviceorientationabsolute', handler as EventListener, true)
    window.addEventListener('deviceorientation', handler as EventListener, true)
    return handler
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setStatus('unsupported'); return }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCoords({ lat, lng })
        setQibla(calcQibla(lat, lng))
        setDistance(calcDistance(lat, lng))
        setStatus('granted')

        // iOS 13+ requires explicit permission for DeviceOrientationEvent
        const DevOri = DeviceOrientationEvent as any
        if (typeof DevOri.requestPermission === 'function') {
          setNeedsOrientationPermission(true)
        } else {
          startCompass()
        }
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [startCompass])

  const requestOrientationPermission = useCallback(async () => {
    try {
      const DevOri = DeviceOrientationEvent as any
      const result = await DevOri.requestPermission()
      if (result === 'granted') {
        setNeedsOrientationPermission(false)
        startCompass()
      }
    } catch {
      // Permission denied or not supported — compass stays static
      setNeedsOrientationPermission(false)
      startCompass()
    }
  }, [startCompass])

  useEffect(() => {
    // Android: auto-start compass without permission prompt
    if (status !== 'granted') return
    const DevOri = DeviceOrientationEvent as any
    if (typeof DevOri.requestPermission !== 'function') {
      const handler = startCompass()
      return () => {
        window.removeEventListener('deviceorientationabsolute', handler as EventListener)
        window.removeEventListener('deviceorientation', handler as EventListener)
      }
    }
  }, [status, startCompass])

  // needleAngle: how far the needle is from pointing straight up (=user facing qibla)
  const needleAngle = qibla !== null ? (qibla - deviceHeading + 360) % 360 : 0
  // isAligned: compass has data AND needle is within ±15° of straight up
  const isAligned = compassReady && qibla !== null && (needleAngle <= 15 || needleAngle >= 345)

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--elevated) 0%, var(--void) 70%)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Compass rose watermark */}
        <div style={{
          position: 'absolute', right: '-30px', top: '50%', transform: 'translateY(-50%)',
          opacity: 0.04, pointerEvents: 'none',
        }}>
          <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
            <circle cx="140" cy="140" r="130" stroke="#52c97a" strokeWidth="1"/>
            <circle cx="140" cy="140" r="90" stroke="#52c97a" strokeWidth="0.5"/>
            <circle cx="140" cy="140" r="50" stroke="#52c97a" strokeWidth="0.5"/>
            {[0,45,90,135,180,225,270,315].map((a) => {
              const rad = (a - 90) * Math.PI / 180
              const x1 = 140 + 90 * Math.cos(rad), y1 = 140 + 90 * Math.sin(rad)
              const x2 = 140 + 130 * Math.cos(rad), y2 = 140 + 130 * Math.sin(rad)
              return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#52c97a" strokeWidth="0.8"/>
            })}
            <polygon points="140,10 146,80 140,100 134,80" fill="#52c97a" opacity="0.6"/>
            <polygon points="140,270 146,200 140,180 134,200" fill="#52c97a" opacity="0.3"/>
          </svg>
        </div>

        <div className="max-w-xl mx-auto" style={{ padding: '40px 24px 28px', position: 'relative' }}>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: '#52c97a', fontWeight: 700, marginBottom: '14px',
          }}>
            // ALAT ISLAM
          </p>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800, lineHeight: 1.05,
            color: 'var(--text-primary)', letterSpacing: '-0.025em',
            marginBottom: '8px',
          }}>
            Pencari<br />
            <em style={{ color: '#52c97a', fontStyle: 'italic' }}>Qiblat</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)' }}>
            Arah tepat ke Kaabah, Mekah Al-Mukarramah
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto" style={{ padding: '40px 24px' }}>

        {/* ── IDLE / LOADING ── */}
        {(status === 'idle' || status === 'loading') && (
          <div style={{ textAlign: 'center' }}>
            {/* Compass ring */}
            <div style={{
              width: '220px', height: '220px', borderRadius: '50%', margin: '0 auto 32px',
              border: '2px solid rgba(82,201,122,0.15)',
              background: 'radial-gradient(circle, rgba(82,201,122,0.04) 0%, transparent 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 0 40px rgba(82,201,122,0.06)',
            }}>
              <div style={{
                width: '160px', height: '160px', borderRadius: '50%',
                border: '1px solid rgba(82,201,122,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ opacity: 0.2 }}>
                  <polygon points="30,4 34,26 30,32 26,26" fill="#52c97a"/>
                  <polygon points="30,56 34,34 30,32 26,34" fill="rgba(82,201,122,0.4)"/>
                  <circle cx="30" cy="30" r="4" fill="#52c97a"/>
                </svg>
              </div>
              {/* Cardinal markers */}
              {[
                { label: 'U', angle: 0, top: '8px', left: '50%', transform: 'translateX(-50%)' },
                { label: 'S', angle: 180, bottom: '8px', left: '50%', transform: 'translateX(-50%)' },
                { label: 'T', angle: 90, right: '8px', top: '50%', transform: 'translateY(-50%)' },
                { label: 'B', angle: 270, left: '8px', top: '50%', transform: 'translateY(-50%)' },
              ].map((p) => (
                <span key={p.label} style={{
                  position: 'absolute', fontFamily: 'var(--font-jetbrains)', fontSize: '10px',
                  fontWeight: 700, color: 'rgba(82,201,122,0.35)',
                  top: (p as any).top, bottom: (p as any).bottom,
                  left: (p as any).left, right: (p as any).right,
                  transform: p.transform,
                }}>
                  {p.label}
                </span>
              ))}
            </div>

            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '10px',
            }}>
              Benarkan Akses Lokasi
            </h2>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px',
              color: 'var(--text-dim)', marginBottom: '28px', lineHeight: 1.6,
            }}>
              Kami perlukan lokasi anda untuk mengira arah kiblat yang tepat.<br />Lokasi anda tidak disimpan.
            </p>
            <button
              onClick={requestLocation}
              disabled={status === 'loading'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 28px', borderRadius: '10px',
                background: '#52c97a', color: '#04080A',
                fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 700,
                border: 'none', cursor: 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
            >
              {status === 'loading' ? (
                <><RefreshCw style={{ width: '15px', height: '15px' }} className="animate-spin" /> Mendapatkan lokasi...</>
              ) : (
                <><MapPin style={{ width: '15px', height: '15px' }} /> Dapatkan Lokasi Saya</>
              )}
            </button>
          </div>
        )}

        {/* ── DENIED ── */}
        {status === 'denied' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '12px', margin: '0 auto 20px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertCircle style={{ width: '26px', height: '26px', color: '#EF4444' }} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '10px',
            }}>
              Akses Lokasi Ditolak
            </h2>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px',
              color: 'var(--text-dim)', marginBottom: '24px', lineHeight: 1.6,
            }}>
              Sila benarkan akses lokasi pada tetapan pelayar anda, kemudian cuba semula.
            </p>
            <button onClick={requestLocation} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '10px',
              background: '#52c97a', color: '#04080A',
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
              border: 'none', cursor: 'pointer',
            }}>
              <RefreshCw style={{ width: '14px', height: '14px' }} /> Cuba Semula
            </button>
          </div>
        )}

        {/* ── GRANTED — compass ── */}
        {status === 'granted' && qibla !== null && (
          <div>
            {/* ── COMPASS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ position: 'relative', width: '260px', height: '260px' }}>
                {/* Outer glow ring — pulses bright green when aligned */}
                <div style={{
                  position: 'absolute', inset: '-4px', borderRadius: '50%',
                  background: isAligned
                    ? 'radial-gradient(circle, rgba(82,201,122,0.35) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(82,201,122,0.1) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                  transition: 'background 0.3s ease',
                }} />
                {/* Alignment ring — solid green circle border when aligned */}
                {isAligned && (
                  <div style={{
                    position: 'absolute', inset: '-2px', borderRadius: '50%',
                    border: '3px solid #52c97a',
                    boxShadow: '0 0 20px rgba(82,201,122,0.6), inset 0 0 20px rgba(82,201,122,0.08)',
                    animation: 'breathe 1.5s ease-in-out infinite',
                  }} />
                )}
                {/* Main ring */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: isAligned ? '2px solid rgba(82,201,122,0.6)' : '2px solid rgba(82,201,122,0.25)',
                  background: isAligned
                    ? 'radial-gradient(circle, rgba(82,201,122,0.12) 0%, transparent 60%)'
                    : 'radial-gradient(circle, rgba(82,201,122,0.05) 0%, transparent 60%)',
                  boxShadow: isAligned ? '0 0 30px rgba(82,201,122,0.25)' : '0 0 30px rgba(82,201,122,0.08)',
                  transition: 'all 0.3s ease',
                }}>
                  {/* Inner ring */}
                  <div style={{
                    position: 'absolute', inset: '16px', borderRadius: '50%',
                    border: '1px solid rgba(82,201,122,0.12)',
                  }} />
                  {/* Cardinal labels */}
                  {[
                    { label: 'U', top: '8px', left: '50%', transform: 'translateX(-50%)', color: '#52c97a' },
                    { label: 'S', bottom: '8px', left: '50%', transform: 'translateX(-50%)' },
                    { label: 'T', right: '8px', top: '50%', transform: 'translateY(-50%)' },
                    { label: 'B', left: '8px', top: '50%', transform: 'translateY(-50%)' },
                  ].map((p) => (
                    <span key={p.label} style={{
                      position: 'absolute',
                      top: (p as any).top, bottom: (p as any).bottom,
                      left: (p as any).left, right: (p as any).right,
                      transform: p.transform,
                      fontFamily: 'var(--font-jetbrains)', fontSize: '11px', fontWeight: 700,
                      color: p.color ?? 'rgba(255,255,255,0.3)',
                    }}>
                      {p.label}
                    </span>
                  ))}

                  {/* Tick marks */}
                  {Array.from({ length: 36 }).map((_, idx) => {
                    const angle = idx * 10
                    const rad = (angle - 90) * Math.PI / 180
                    const r = 126
                    const len = idx % 9 === 0 ? 10 : 5
                    const x1 = 130 + (r - len) * Math.cos(rad)
                    const y1 = 130 + (r - len) * Math.sin(rad)
                    const x2 = 130 + r * Math.cos(rad)
                    const y2 = 130 + r * Math.sin(rad)
                    return (
                      <svg key={idx} style={{ position: 'absolute', inset: 0 }} width="260" height="260" viewBox="0 0 260 260">
                        <line x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="rgba(82,201,122,0.2)" strokeWidth={idx % 9 === 0 ? 1.5 : 0.8}/>
                      </svg>
                    )
                  })}
                </div>

                {/* Needle — rotates */}
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `rotate(${needleAngle}deg)`,
                  transition: 'transform 0.3s cubic-bezier(0.34,1.2,0.64,1)',
                }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    {/* North needle (Qibla direction) — bright green */}
                    <polygon points="50,8 55,50 50,58 45,50"
                      fill="#52c97a"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(82,201,122,0.8))' }}/>
                    {/* South needle */}
                    <polygon points="50,92 55,50 50,58 45,50" fill="rgba(255,255,255,0.15)"/>
                    {/* Center dot */}
                    <circle cx="50" cy="50" r="5" fill="#52c97a"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(82,201,122,0.9))' }}/>
                    <circle cx="50" cy="50" r="3" fill="#04080A"/>
                  </svg>
                </div>

                {/* Kaabah center badge */}
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    background: 'rgba(82,201,122,0.15)', border: '1px solid rgba(82,201,122,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '0px',
                  }}>
                    <span style={{ fontSize: '14px' }}>🕋</span>
                  </div>
                </div>
              </div>

              {/* Aligned indicator */}
              <div style={{
                marginTop: '16px',
                height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isAligned ? (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '6px 16px', borderRadius: '100px',
                    background: 'rgba(82,201,122,0.15)',
                    border: '1px solid rgba(82,201,122,0.45)',
                  }}>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#52c97a',
                      boxShadow: '0 0 8px rgba(82,201,122,0.9)',
                      animation: 'breathe 1.5s ease-in-out infinite',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
                      color: '#52c97a', letterSpacing: '0.04em',
                    }}>
                      Arah Kiblat Tepat
                    </span>
                  </div>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                    color: 'var(--text-dim)',
                  }}>
                    {compassReady ? 'Pusing peranti ke arah kiblat' : 'Menunggu kompas…'}
                  </span>
                )}
              </div>

              {/* Degree display */}
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'var(--font-jetbrains)', fontSize: '52px', fontWeight: 700,
                  color: isAligned ? '#52c97a' : 'rgba(82,201,122,0.75)', lineHeight: 1,
                  textShadow: isAligned ? '0 0 30px rgba(82,201,122,0.6)' : '0 0 20px rgba(82,201,122,0.25)',
                  transition: 'color 0.3s, text-shadow 0.3s',
                }}>
                  {Math.round(qibla)}°
                </p>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                  color: 'var(--text-dim)', marginTop: '4px',
                }}>
                  Arah {directionName(qibla)} dari lokasi anda
                </p>
              </div>
            </div>

            {/* ── INFO CARDS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                padding: '18px', borderRadius: '12px', textAlign: 'center',
                background: 'rgba(82,201,122,0.06)', border: '1px solid rgba(82,201,122,0.15)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--text-dim)', marginBottom: '6px',
                }}>
                  Bearing ke Mekah
                </p>
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '28px', fontWeight: 700, color: '#52c97a' }}>
                  {Math.round(qibla)}°
                </p>
              </div>
              <div style={{
                padding: '18px', borderRadius: '12px', textAlign: 'center',
                background: 'rgba(252,211,77,0.05)', border: '1px solid rgba(252,211,77,0.14)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--text-dim)', marginBottom: '6px',
                }}>
                  Jarak ke Mekah
                </p>
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '28px', fontWeight: 700, color: '#FCD34D' }}>
                  {distance}
                </p>
              </div>
            </div>

            {/* Location */}
            {coords && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderRadius: '10px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                marginBottom: '12px',
              }}>
                <MapPin style={{ width: '13px', height: '13px', color: '#52c97a', flexShrink: 0 }} />
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                </p>
              </div>
            )}

            {/* iOS orientation permission prompt */}
            {needsOrientationPermission && (
              <div style={{
                padding: '16px 20px', borderRadius: '12px', marginBottom: '12px',
                background: 'rgba(82,201,122,0.06)', border: '1px solid rgba(82,201,122,0.2)',
                textAlign: 'center',
              }}>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                  color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5,
                }}>
                  Benarkan akses sensor gerakan untuk kompas hidup
                </p>
                <button
                  onClick={requestOrientationPermission}
                  style={{
                    padding: '10px 24px', borderRadius: '10px',
                    background: '#52c97a', color: '#04080A',
                    fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  Aktifkan Kompas
                </button>
              </div>
            )}

            <p style={{
              textAlign: 'center', fontFamily: 'var(--font-jakarta)', fontSize: '11px',
              color: 'var(--text-dim)', lineHeight: 1.6,
            }}>
              {compassReady
                ? '✓ Kompas aktif — pusing peranti anda perlahan-lahan'
                : 'Condongkan peranti anda untuk kompas hidup.'
              }<br />Pastikan kalibrasi kompas peranti tepat.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
