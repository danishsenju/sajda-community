'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, RefreshCw, LocateFixed, Loader2 } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { createClient } from '@/lib/supabase'
import { DEFAULT_ZONE, DEFAULT_LABEL, type ZoneInfo } from '@/lib/prayer-zones'

// Display order: Imsak is shown but not treated as a "next prayer" trigger
const PRAYER_NAMES   = ['Imsak', 'Subuh', 'Syuruk', 'Zohor', 'Asr', 'Maghrib', 'Isyak'] as const
// Only these are "call to prayer" entries for next-prayer calculation (skip Imsak & Syuruk)
const IS_SOLAT_WAKTU = [false, true, false, true, true, true, true] as const
// Maps index → imam_schedule DB key (null = no imam entry for that prayer)
const IMAM_DB_KEY    = [null, 'fajr', null, 'dhuhr', 'asr', 'maghrib', 'isha'] as const

type PrayerState = {
  times:   string[]   // length 7, matching PRAYER_NAMES
  nextIdx: number     // index of the next solat waktu
  hijri:   string
}

/* ── Server-side cached prayer API (proxies JAKIM, falls back to Aladhan) ── */
async function fetchPrayerTimes(zone: string): Promise<{ times: string[]; hijri: string; source: 'jakim' | 'aladhan' }> {
  const res = await fetch(`/api/prayer?zone=${encodeURIComponent(zone)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  const times = (json.times as (string | null)[]).map(t => t ?? '—')
  return { times, hijri: json.hijri ?? '', source: json.source === 'jakim' ? 'jakim' : 'aladhan' }
}

function calcNextIdx(times: string[]): number {
  const now  = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  for (let i = 0; i < times.length; i++) {
    if (IS_SOLAT_WAKTU[i] && times[i] !== '—' && times[i] > hhmm) return i
  }
  return 1 // default to Subuh
}

async function fetchTodayImams(): Promise<Record<string, string>> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('imam_schedule')
    .select('prayer, imams(name, title)')
    .eq('date', today)
  const map: Record<string, string> = {}
  for (const row of (data ?? [])) {
    const imam = row.imams as unknown as { name: string; title: string | null } | null
    if (imam) map[row.prayer] = imam.title ? `${imam.title} ${imam.name}` : imam.name
  }
  return map
}

type LocState = 'idle' | 'detecting' | 'done' | 'error'
type DetectedZone = ZoneInfo & { city: string }

export function PrayerTimesSection() {
  const [state,    setState]    = useState<PrayerState | null>(null)
  const [source,   setSource]   = useState<'jakim' | 'fallback' | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [imamMap,  setImamMap]  = useState<Record<string, string>>({})
  const [locState, setLocState] = useState<LocState>('idle')
  const [detected, setDetected] = useState<DetectedZone | null>(null)
  const fetched = useRef(false)

  // Restore zone saved from previous detect
  useEffect(() => {
    try {
      const saved      = localStorage.getItem('kariah_zone')
      const savedLabel = localStorage.getItem('kariah_zone_label')
      const savedCity  = localStorage.getItem('kariah_zone_city')
      if (saved && savedLabel) {
        setDetected({ code: saved, label: savedLabel, city: savedCity ?? '' })
        setLocState('done')
      }
    } catch {}
  }, [])

  const activeZone  = detected?.code  ?? DEFAULT_ZONE
  const activeLabel = detected?.label ?? DEFAULT_LABEL

  async function load(zone = activeZone) {
    setLoading(true)
    setError(false)
    try {
      const result = await fetchPrayerTimes(zone)
      setSource(result.source === 'jakim' ? 'jakim' : 'fallback')
      setState({ times: result.times, nextIdx: calcNextIdx(result.times), hijri: result.hijri })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function detectLocation() {
    if (!navigator.geolocation) { setLocState('error'); return }
    setLocState('detecting')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords
          // Resolve zone server-side (Nominatim + district lookup)
          const res  = await fetch(`/api/prayer/zone?lat=${lat}&lng=${lng}`)
          const data = await res.json()
          const zone: ZoneInfo = { code: data.code, label: data.label }
          const city: string   = data.city ?? ''
          const det: DetectedZone = { ...zone, city }
          setDetected(det)
          try {
            localStorage.setItem('kariah_zone',       zone.code)
            localStorage.setItem('kariah_zone_label', zone.label)
            localStorage.setItem('kariah_zone_city',  city)
          } catch {}
          setLocState('done')
          load(zone.code)
        } catch {
          setLocState('error')
        }
      },
      () => setLocState('error'),
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetchTodayImams().then(setImamMap)
    load()
  }, [])

  const panelStyle: React.CSSProperties = {
    background:   '#0C1E14',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  }

  /* ── SKELETON ── */
  if (loading) {
    return (
      <div style={panelStyle}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 16px' }}>
            <div className="skeleton h-3 w-52 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="skeleton h-8 w-28 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {PRAYER_NAMES.map(name => (
                <div key={name} style={{ padding: '16px 8px', borderRight: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                  <div className="skeleton h-2 w-10 rounded mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <div className="skeleton h-5 w-14 rounded mx-auto"      style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── ERROR ── */
  if (error || !state) {
    return (
      <div style={{ ...panelStyle, padding: '20px' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-4">
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'rgba(255,255,255,0.40)' }}>
            Gagal memuatkan waktu solat
          </p>
          <button
            onClick={() => { fetched.current = false; load() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '100px',
              border: '1px solid rgba(45,106,79,0.40)',
              background: 'transparent', color: '#52c97a', cursor: 'pointer',
              fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 500,
            }}
          >
            <RefreshCw className="w-3 h-3" /> Cuba Semula
          </button>
        </div>
      </div>
    )
  }

  const now     = new Date()
  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  /* ── MAIN ── */
  return (
    <div style={panelStyle}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">

        {/* Top row: zone label + next prayer countdown */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', padding: '16px 0 14px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
              <MapPin style={{ width: '11px', height: '11px', color: '#52c97a', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em',
              }}>
                {activeLabel}{detected?.city && ` · ${detected.city}`}
              </span>
              <span style={{
                fontFamily: 'var(--font-jetbrains)', fontSize: '9px',
                color: '#52c97a', background: 'rgba(82,201,122,0.12)',
                border: '1px solid rgba(82,201,122,0.25)',
                padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.10em',
              }}>
                {activeZone}
              </span>
              {source === 'jakim' && (
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '9px',
                  color: 'rgba(82,201,122,0.55)', letterSpacing: '0.08em',
                }}>
                  JAKIM e-Solat
                </span>
              )}

              {/* Location detect button */}
              <button
                onClick={detectLocation}
                disabled={locState === 'detecting'}
                title={locState === 'done' ? 'Lokasi dikesan' : 'Kesan lokasi semasa'}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                  border: `1px solid ${locState === 'done' ? 'rgba(82,201,122,0.4)' : locState === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.10)'}`,
                  background: locState === 'done' ? 'rgba(82,201,122,0.10)' : 'rgba(255,255,255,0.04)',
                  cursor: locState === 'detecting' ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {locState === 'detecting'
                  ? <Loader2 style={{ width: '11px', height: '11px', color: '#52c97a', animation: 'spin 1s linear infinite' }} />
                  : <LocateFixed style={{ width: '11px', height: '11px', color: locState === 'done' ? '#52c97a' : locState === 'error' ? '#EF4444' : 'rgba(255,255,255,0.35)' }} />
                }
              </button>
            </div>
            {state.hijri && (
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px',
                color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em',
              }}>
                {state.hijri}
              </p>
            )}
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '10px',
              color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em',
              textTransform: 'uppercase', marginBottom: '3px',
            }}>
              {PRAYER_NAMES[state.nextIdx]}
            </p>
            <CountdownTimer targetTime={state.times[state.nextIdx]} />
          </div>
        </div>
      </div>

      {/* Prayer grid — 7 columns (includes Imsak) */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }} className="scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(64px, 1fr))', minWidth: '448px' }}>
            {PRAYER_NAMES.map((name, i) => {
              const isNext = i === state.nextIdx
              const isInfo = !IS_SOLAT_WAKTU[i]
              const isPast = !isInfo && !isNext && state.times[i] !== '—' && state.times[i] < nowHHMM
              return (
                <div
                  key={name}
                  style={{
                    padding:      '14px 6px',
                    borderRight:  i < 6 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    borderBottom: isNext ? '2px solid #52c97a' : '2px solid transparent',
                    background:   isNext ? 'rgba(45,106,79,0.16)' : 'transparent',
                    opacity:      (isPast || isInfo) ? (isInfo ? 0.45 : 0.28) : 1,
                    textAlign:    'center',
                    transition:   'background 0.2s',
                  }}
                >
                  <p style={{
                    fontFamily:    'var(--font-jakarta)',
                    fontSize:      '9px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color:         isNext ? '#52c97a' : 'rgba(255,255,255,0.32)',
                    fontWeight:    600,
                    marginBottom:  '6px',
                  }}>
                    {name}
                  </p>
                  <p style={{
                    fontFamily:    'var(--font-jetbrains)',
                    fontSize:      isNext ? '17px' : '13px',
                    fontWeight:    isNext ? 600 : 400,
                    color:         isNext ? '#fff' : 'rgba(255,255,255,0.60)',
                    letterSpacing: '-0.02em',
                    transition:    'font-size 0.2s',
                  }}>
                    {state.times[i]}
                  </p>
                  {isNext && (
                    <div style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: '#52c97a', margin: '5px auto 0',
                      animation: 'breathe 2s ease-in-out infinite',
                    }} />
                  )}
                  {IMAM_DB_KEY[i] && imamMap[IMAM_DB_KEY[i]!] && (
                    <p style={{
                      fontFamily:   'var(--font-jakarta)',
                      fontSize:     '8px',
                      color:        isNext ? 'rgba(82,201,122,0.65)' : 'rgba(255,255,255,0.20)',
                      marginTop:    '4px',
                      lineHeight:   1.3,
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                      maxWidth:     '100%',
                    }}>
                      {imamMap[IMAM_DB_KEY[i]!]}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
