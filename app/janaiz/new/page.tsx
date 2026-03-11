'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, MapPin, X, Navigation } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'

const LocationPicker = dynamic(
  () => import('@/components/ui/LocationPicker').then(m => m.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: '380px', borderRadius: '12px',
        background: 'var(--elevated)', border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
      }}>
        <Loader2 style={{ width: '22px', height: '22px', color: 'var(--text-dim)', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
          Memuatkan peta…
        </span>
      </div>
    ),
  }
)

type LatLng = { lat: number; lng: number }

export default function NewJanaizPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()

  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [formError,   setFormError]   = useState('')
  const [mapOpen,     setMapOpen]     = useState(false)

  // Form fields
  const [deceasedName,       setDeceasedName]       = useState('')
  const [age,                setAge]                = useState('')
  const [deathDate,          setDeathDate]          = useState('')
  const [jenazahTime,        setJenazahTime]        = useState('')
  const [jenazahLocation,    setJenazahLocation]    = useState('')
  const [burialLocationText, setBurialLocationText] = useState('')
  const [burialPos,          setBurialPos]          = useState<LatLng | null>(null)
  const [notes,              setNotes]              = useState('')

  useEffect(() => {
    if (!userLoading && !user) router.push('/login?redirect=/janaiz/new')
  }, [user, userLoading, router])

  // Lock body scroll when map modal is open
  useEffect(() => {
    document.body.style.overflow = mapOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mapOpen])

  function handleLocationChange(pos: LatLng, label: string) {
    setBurialPos(pos)
    setBurialLocationText(label)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!deceasedName.trim()) { setFormError('Sila masukkan nama si mati.'); return }
    if (!deathDate)           { setFormError('Sila pilih tarikh kematian.'); return }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('janaiz_notices').insert({
        deceased_name:        deceasedName.trim(),
        age:                  age ? parseInt(age) : null,
        death_date:           deathDate,
        jenazah_time:         jenazahTime.trim() || null,
        jenazah_location:     jenazahLocation.trim() || null,
        burial_location_text: burialLocationText.trim() || null,
        burial_lat:           burialPos?.lat ?? null,
        burial_lng:           burialPos?.lng ?? null,
        notes:                notes.trim() || null,
        posted_by:            user!.id,
        is_verified:          false,
      })
      if (error) throw error
      setSubmitted(true)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message
        : (err && typeof err === 'object' && 'message' in err)
          ? String((err as { message: unknown }).message)
          : 'Ralat tidak diketahui'
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── LOADING ── */
  if (userLoading) {
    return (
      <div style={{ background: 'var(--void)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '24px', height: '24px', color: 'var(--text-dim)', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  /* ── SUCCESS ── */
  if (submitted) {
    return (
      <div style={{ background: 'var(--void)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          maxWidth: '420px', width: '100%',
          background: 'linear-gradient(145deg, var(--elevated) 0%, var(--surface) 100%)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '24px', padding: '48px 36px',
          textAlign: 'center',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.06) inset',
        }}>
          {/* Icon */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 30px rgba(34,197,94,0.12)',
          }}>
            <CheckCircle2 style={{ width: '28px', height: '28px', color: '#22C55E' }} />
          </div>

          {/* Arabic */}
          <p style={{
            fontFamily: 'var(--font-amiri)', fontSize: '22px',
            color: 'var(--text-dim)', direction: 'rtl',
            lineHeight: 2, marginBottom: '16px',
          }}>
            إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
          </p>

          <h2 style={{
            fontFamily: 'var(--font-playfair)', fontSize: '22px', fontWeight: 700,
            color: 'var(--text-primary)', margin: '0 0 10px',
          }}>
            Notis Dihantar
          </h2>

          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '13px',
            color: 'var(--text-dim)', lineHeight: 1.7, margin: '0 0 28px',
          }}>
            Notis kematian telah berjaya dihantar. Semoga rohnya dirahmati Allah dan
            keluarga yang ditinggalkan diberi kekuatan.
          </p>

          <a href="/janaiz" style={{
            display: 'block', padding: '14px', borderRadius: '14px',
            background: 'var(--primary)', color: '#04080A',
            fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 700,
            textDecoration: 'none', textAlign: 'center',
          }}>
            Kembali ke Papan Janaiz
          </a>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  /* ── FORM ── */
  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--elevated) 0%, var(--void) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '36px 24px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="j-geo" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#fff" strokeWidth="0.4"/>
                <circle cx="24" cy="24" r="8"  fill="none" stroke="#fff" strokeWidth="0.3"/>
                <line x1="24" y1="4" x2="24" y2="44" stroke="#fff" strokeWidth="0.2"/>
                <line x1="4" y1="24" x2="44" y2="24" stroke="#fff" strokeWidth="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#j-geo)"/>
          </svg>
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
          <Link href="/janaiz" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-jakarta)', fontSize: '12px',
            color: 'var(--text-dim)', textDecoration: 'none',
            marginBottom: '28px',
          }}>
            <ArrowLeft style={{ width: '13px', height: '13px' }} />
            Papan Janaiz
          </Link>

          {/* Arabic */}
          <p style={{
            fontFamily: 'var(--font-amiri)', fontSize: '18px',
            color: 'var(--text-dim)', direction: 'rtl',
            marginBottom: '16px',
          }}>
            إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
          </p>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 800, color: 'var(--text-primary)',
            margin: '0 0 8px', lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            Hantar Notis Kematian
          </h1>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '13px',
            color: 'var(--text-dim)', margin: 0,
          }}>
            Isi maklumat dengan tepat untuk memaklumkan komuniti
          </p>
        </div>
      </div>

      {/* ── FORM BODY ── */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

          {/* ── SECTION: Maklumat Si Mati ── */}
          <SectionLabel>Maklumat Si Mati</SectionLabel>

          <FormGroup>
            <Field label="Nama Penuh Si Mati" required>
              <input
                value={deceasedName}
                onChange={e => setDeceasedName(e.target.value)}
                placeholder="Nama penuh si mati"
                required
                style={inputCss}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
              <Field label="Umur">
                <input
                  type="number" value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="Tahun"
                  min={0} max={120}
                  style={inputCss}
                />
              </Field>
              <Field label="Tarikh Kematian" required>
                <input
                  type="date" value={deathDate}
                  onChange={e => setDeathDate(e.target.value)}
                  required style={inputCss}
                />
              </Field>
            </div>
          </FormGroup>

          {/* ── SECTION: Solat Jenazah ── */}
          <SectionLabel style={{ marginTop: '10px' }}>Solat Jenazah</SectionLabel>

          <FormGroup>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Waktu Solat Jenazah">
                <input
                  value={jenazahTime}
                  onChange={e => setJenazahTime(e.target.value)}
                  placeholder="cth: Selepas Zohor"
                  style={inputCss}
                />
              </Field>
              <Field label="Tempat Solat Jenazah">
                <input
                  value={jenazahLocation}
                  onChange={e => setJenazahLocation(e.target.value)}
                  placeholder="cth: Masjid Saujana Utama"
                  style={inputCss}
                />
              </Field>
            </div>
          </FormGroup>

          {/* ── SECTION: Lokasi Pengkebumian ── */}
          <SectionLabel style={{ marginTop: '10px' }}>Lokasi Pengkebumian</SectionLabel>

          <FormGroup>
            {/* Pin button */}
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              style={{
                width: '100%', padding: '14px 18px',
                borderRadius: '12px',
                background: burialPos
                  ? 'rgba(34,197,94,0.06)'
                  : 'var(--elevated)',
                border: burialPos
                  ? '1px solid rgba(34,197,94,0.25)'
                  : '1px dashed var(--border-lit)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
                textAlign: 'left', transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: burialPos ? 'rgba(34,197,94,0.12)' : 'var(--border)',
                border: `1px solid ${burialPos ? 'rgba(34,197,94,0.25)' : 'var(--border-lit)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {burialPos
                  ? <Navigation style={{ width: '16px', height: '16px', color: '#22C55E' }} />
                  : <MapPin style={{ width: '16px', height: '16px', color: 'var(--text-dim)' }} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {burialPos ? (
                  <>
                    <p style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                      color: '#22C55E', margin: '0 0 2px',
                    }}>
                      Lokasi Ditandakan
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                      color: 'var(--text-dim)', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {burialLocationText
                        ? burialLocationText.split(',').slice(0, 3).join(', ')
                        : `${burialPos.lat.toFixed(5)}, ${burialPos.lng.toFixed(5)}`}
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600,
                      color: 'var(--text-secondary)', margin: '0 0 2px',
                    }}>
                      Pin Lokasi Pengkebumian
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                      color: 'var(--text-dim)', margin: 0,
                    }}>
                      Klik untuk buka peta dan tandakan lokasi
                    </p>
                  </>
                )}
              </div>
              {burialPos && (
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 600,
                  color: 'rgba(34,197,94,0.7)', flexShrink: 0,
                }}>
                  Tukar →
                </span>
              )}
            </button>

            {/* Address text override */}
            <Field label="Nama Tanah Perkuburan (tambahan)">
              <input
                value={burialLocationText}
                onChange={e => setBurialLocationText(e.target.value)}
                placeholder="cth: Tanah Perkuburan Islam Saujana Utama"
                style={inputCss}
              />
            </Field>
          </FormGroup>

          {/* ── SECTION: Maklumat Tambahan ── */}
          <SectionLabel style={{ marginTop: '10px' }}>Maklumat Tambahan</SectionLabel>

          <FormGroup>
            <Field label="Nota / Takziah">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Sebarang maklumat tambahan, mesej takziah atau arahan khusus…"
                rows={4}
                style={{ ...inputCss, resize: 'vertical', lineHeight: 1.65 }}
              />
            </Field>
          </FormGroup>

          {/* Error */}
          {formError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '13px 16px', borderRadius: '12px', marginTop: '4px',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)',
            }}>
              <AlertCircle style={{ width: '15px', height: '15px', color: '#EF4444', flexShrink: 0 }} />
              <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: '#EF4444', margin: 0 }}>
                {formError}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '8px',
              padding: '15px',
              borderRadius: '14px',
              background: submitting ? 'rgba(34,197,94,0.4)' : 'var(--primary)',
              color: '#04080A',
              fontFamily: 'var(--font-jakarta)',
              fontSize: '14px', fontWeight: 700,
              border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              letterSpacing: '0.01em',
            }}
          >
            {submitting && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 0.8s linear infinite' }} />}
            {submitting ? 'Menghantar…' : 'Hantar Notis Kematian'}
          </button>

          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '11px',
            color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6, marginTop: '4px',
          }}>
            Notis ini akan kelihatan kepada semua pengguna. AJK masjid akan mengesahkan notis ini.
          </p>
        </form>
      </div>

      {/* ── MAP MODAL ── */}
      {mapOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setMapOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-end',
            padding: '0',
          }}
        >
          <div style={{
            width: '100%',
            maxWidth: '680px',
            margin: '0 auto',
            background: 'linear-gradient(180deg, var(--elevated) 0%, var(--surface) 100%)',
            border: '1px solid var(--border)',
            borderBottom: 'none',
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
            animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)',
            maxHeight: '92vh',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '20px 22px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'rgba(34,197,94,0.6)', marginBottom: '3px',
                }}>
                  // PIN LOKASI
                </p>
                <h3 style={{
                  fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700,
                  color: 'var(--text-primary)', margin: 0,
                }}>
                  Lokasi Pengkebumian
                </h3>
              </div>
              <button
                onClick={() => setMapOpen(false)}
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'var(--border)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X style={{ width: '15px', height: '15px', color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Map content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px' }}>
              <LocationPicker onChange={handleLocationChange} value={burialPos} />
            </div>

            {/* Confirm button */}
            <div style={{
              padding: '16px 22px 24px',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                disabled={!burialPos}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: '12px',
                  background: burialPos ? 'var(--primary)' : 'var(--border)',
                  color: burialPos ? '#04080A' : 'var(--text-dim)',
                  fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 700,
                  border: 'none', cursor: burialPos ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'background 0.2s',
                }}
              >
                <Navigation style={{ width: '15px', height: '15px' }} />
                {burialPos ? 'Sahkan Lokasi' : 'Pilih lokasi pada peta dahulu'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
      `}</style>
    </div>
  )
}

/* ── helpers ── */

const inputCss: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--elevated)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-jakarta)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 10px', ...style }}>
      <span style={{
        fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--primary)',
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

function FormGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '18px',
      display: 'flex', flexDirection: 'column', gap: '14px',
    }}>
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: '7px',
        letterSpacing: '0.04em',
      }}>
        {label}
        {required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}
