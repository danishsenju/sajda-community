'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PlanTier, PLAN_LABEL, PLAN_PRICE_RM, PLAN_FEATURES, FEATURE_LABELS } from '@/lib/planFeatures'
import { Check, ChevronRight, ChevronLeft, Building2, User, CreditCard, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import sajdaLogo from '@/images/sajda-logo.png'

type Step = 1 | 2 | 3

interface MosqueInfo {
  name:       string
  category:   string
  state:      string
  address:    string
  phone:      string
  jakim_zone: string
}

interface AdminInfo {
  fullName:  string
  email:     string
  password:  string
  password2: string
}

const MALAYSIAN_STATES = [
  'Johor','Kedah','Kelantan','Melaka','Negeri Sembilan',
  'Pahang','Perak','Perlis','Pulau Pinang','Sabah','Sarawak',
  'Selangor','Terengganu','Kuala Lumpur','Labuan','Putrajaya',
]

const JAKIM_ZONES = [
  { value: 'SGR01', label: 'Selangor (SGR01)' },
  { value: 'KUL01', label: 'Kuala Lumpur (KUL01)' },
  { value: 'JHR01', label: 'Johor (JHR01)' },
  { value: 'KDH01', label: 'Kedah (KDH01)' },
  { value: 'KTN01', label: 'Kelantan (KTN01)' },
  { value: 'MLK01', label: 'Melaka (MLK01)' },
  { value: 'NGS01', label: 'Negeri Sembilan (NGS01)' },
  { value: 'PHG01', label: 'Pahang (PHG01)' },
  { value: 'PRK01', label: 'Perak (PRK01)' },
  { value: 'PLS01', label: 'Perlis (PLS01)' },
  { value: 'PNG01', label: 'Pulau Pinang (PNG01)' },
  { value: 'SBH01', label: 'Sabah (SBH01)' },
  { value: 'SRW01', label: 'Sarawak (SRW01)' },
  { value: 'TRG01', label: 'Terengganu (TRG01)' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  minHeight: '52px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '12px',
  color: '#F0FDF4',
  fontSize: '15px',
  fontFamily: 'var(--font-dm-sans)',
  outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  colorScheme: 'dark',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: '#A6C9B0',
  fontFamily: 'var(--font-dm-sans)',
  marginBottom: '8px',
}

function CustomSelect({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          ...inputStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span>{selected?.label ?? value}</span>
        <ChevronDown size={15} style={{ opacity: 0.5, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#0F1712',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          zIndex: 50,
          maxHeight: '220px',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              style={{
                display: 'block',
                width: '100%',
                padding: '13px 16px',
                minHeight: '48px',
                background: o.value === value ? 'rgba(74,222,128,0.12)' : 'transparent',
                color: o.value === value ? '#4ADE80' : '#F0FDF4',
                fontSize: '15px',
                fontFamily: 'var(--font-dm-sans)',
                textAlign: 'left',
                cursor: 'pointer',
                border: 'none',
                borderRadius: i === 0 ? '10px 10px 0 0' : i === options.length - 1 ? '0 0 10px 10px' : '0',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DaftarWizard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [plan, setPlan]  = useState<PlanTier>((searchParams.get('plan') as PlanTier) ?? 'kariah')
  const [mosque, setMosque]   = useState<MosqueInfo>({
    name: '', category: 'masjid', state: 'Selangor',
    address: '', phone: '', jakim_zone: 'SGR01',
  })
  const [admin, setAdmin]     = useState<AdminInfo>({
    fullName: '', email: '', password: '', password2: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const steps = [
    { num: 1, label: 'Maklumat Masjid', icon: Building2 },
    { num: 2, label: 'Akaun Pentadbir', icon: User },
    { num: 3, label: 'Pilih Plan & Bayar', icon: CreditCard },
  ]

  async function handleProceedToPayment() {
    if (!admin.email || !admin.password || !admin.fullName) {
      setError('Sila lengkapkan semua maklumat pentadbir.')
      return
    }
    if (admin.password.length < 6) {
      setError('Kata laluan minimum 6 aksara.')
      return
    }
    if (admin.password !== admin.password2) {
      setError('Kata laluan tidak sepadan.')
      return
    }
    setError('')
    setStep(3)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/daftar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mosque, admin, plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Terjadi ralat. Cuba semula.')
        setLoading(false)
        return
      }
      // Redirect to Billplz checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch {
      setError('Terjadi ralat. Sila cuba semula.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px 80px',
    }}>
      {/* Logo */}
      <a href="/" style={{ marginBottom: '32px', display: 'block' }}>
        <Image
          src={sajdaLogo}
          alt="Sajda"
          height={36}
          width={116}
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </a>

      {/* Step indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        marginBottom: '32px',
        width: '100%',
        maxWidth: '480px',
      }}>
        {steps.map((s, i) => {
          const done    = step > s.num
          const active  = step === s.num
          const Icon    = s.icon
          return (
            <div key={s.num} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                flex: 1,
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: done ? '#22C55E' : active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${done ? '#22C55E' : active ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {done
                    ? <Check style={{ width: '16px', height: '16px', color: '#08090E' }} />
                    : <Icon style={{ width: '15px', height: '15px', color: active ? '#22C55E' : 'rgba(186,230,200,0.3)' }} />
                  }
                </div>
                <span style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '11px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#22C55E' : done ? 'rgba(34,197,94,0.6)' : 'rgba(186,230,200,0.35)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  height: '2px',
                  flex: 0.4,
                  background: step > s.num ? '#22C55E' : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.3s',
                  marginBottom: '22px',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(15,16,22,0.9)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '20px',
        padding: '28px 24px',
        backdropFilter: 'blur(20px)',
      }}>

        {/* ── STEP 1: Mosque info ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#F0FDF4',
              marginBottom: '4px',
            }}>Maklumat Masjid</h2>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
              color: 'rgba(186,230,200,0.5)',
              marginTop: '-8px',
            }}>
              Masukkan maklumat asas masjid atau surau anda.
            </p>

            <div>
              <label style={labelStyle}>Nama Masjid / Surau *</label>
              <input
                style={inputStyle}
                placeholder="Masjid Al-Mukminin"
                value={mosque.name}
                onChange={e => setMosque(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div>
              <label style={labelStyle}>Jenis</label>
              <CustomSelect
                value={mosque.category}
                onChange={v => setMosque(p => ({ ...p, category: v }))}
                options={[
                  { value: 'masjid', label: 'Masjid' },
                  { value: 'surau', label: 'Surau' },
                  { value: 'musolla', label: 'Musolla' },
                ]}
              />
            </div>

            <div>
              <label style={labelStyle}>Negeri *</label>
              <CustomSelect
                value={mosque.state}
                onChange={v => setMosque(p => ({ ...p, state: v }))}
                options={MALAYSIAN_STATES.map(s => ({ value: s, label: s }))}
              />
            </div>

            <div>
              <label style={labelStyle}>Alamat</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
                placeholder="No. 1, Jalan Masjid, 47000 ..."
                value={mosque.address}
                onChange={e => setMosque(p => ({ ...p, address: e.target.value }))}
              />
            </div>

            <div>
              <label style={labelStyle}>No. Telefon</label>
              <input
                style={inputStyle}
                placeholder="03-6156XXXX"
                value={mosque.phone}
                onChange={e => setMosque(p => ({ ...p, phone: e.target.value }))}
              />
            </div>

            <div>
              <label style={labelStyle}>Zon JAKIM (untuk waktu solat)</label>
              <CustomSelect
                value={mosque.jakim_zone}
                onChange={v => setMosque(p => ({ ...p, jakim_zone: v }))}
                options={JAKIM_ZONES}
              />
            </div>

            <button
              onClick={() => {
                if (!mosque.name || !mosque.state) {
                  setError('Nama masjid dan negeri diperlukan.')
                  return
                }
                setError('')
                setStep(2)
              }}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                background: '#22C55E',
                color: '#08090E',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              Seterusnya <ChevronRight style={{ width: '15px', height: '15px' }} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Admin account ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#F0FDF4',
              marginBottom: '4px',
            }}>Akaun Pentadbir</h2>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
              color: 'rgba(186,230,200,0.5)',
              marginTop: '-8px',
            }}>
              Buat akaun untuk pengurusan masjid anda.
            </p>

            <div>
              <label style={labelStyle}>Nama Penuh *</label>
              <input
                style={inputStyle}
                placeholder="Ahmad bin Ali"
                value={admin.fullName}
                onChange={e => setAdmin(p => ({ ...p, fullName: e.target.value }))}
              />
            </div>

            <div>
              <label style={labelStyle}>E-mel *</label>
              <input
                type="email"
                style={inputStyle}
                placeholder="admin@masjid.com"
                value={admin.email}
                onChange={e => setAdmin(p => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div>
              <label style={labelStyle}>Kata Laluan *</label>
              <input
                type="password"
                style={inputStyle}
                placeholder="Min. 6 aksara"
                value={admin.password}
                onChange={e => setAdmin(p => ({ ...p, password: e.target.value }))}
              />
            </div>

            <div>
              <label style={labelStyle}>Sahkan Kata Laluan *</label>
              <input
                type="password"
                style={inputStyle}
                placeholder="Ulang kata laluan"
                value={admin.password2}
                onChange={e => setAdmin(p => ({ ...p, password2: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setError(''); setStep(1) }}
                style={{
                  flex: 1,
                  padding: '13px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.20)',
                  color: '#E0EDE5',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <ChevronLeft style={{ width: '15px', height: '15px' }} /> Kembali
              </button>
              <button
                onClick={handleProceedToPayment}
                style={{
                  flex: 2,
                  padding: '13px',
                  borderRadius: '12px',
                  background: '#22C55E',
                  color: '#08090E',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Seterusnya <ChevronRight style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Plan selection + pay ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#F0FDF4',
              marginBottom: '4px',
            }}>Pilih Plan</h2>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
              color: 'rgba(186,230,200,0.5)',
              marginTop: '-8px',
            }}>
              Pilih plan yang sesuai. Boleh naik taraf bila-bila masa.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(['surau', 'kariah', 'komuniti'] as PlanTier[]).map(p => {
                const selected = plan === p
                const features = PLAN_FEATURES[p].includes('*')
                  ? Object.keys(FEATURE_LABELS).slice(0, 5)
                  : PLAN_FEATURES[p].slice(0, 4)
                return (
                  <button
                    key={p}
                    onClick={() => setPlan(p)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: selected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${selected ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: selected ? '#22C55E' : '#F0FDF4',
                      }}>
                        Plan {PLAN_LABEL[p]}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-playfair)',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: selected ? '#22C55E' : '#F0FDF4',
                      }}>
                        RM{PLAN_PRICE_RM[p]}<span style={{ fontSize: '12px', fontFamily: 'var(--font-dm-sans)', fontWeight: 400, color: 'rgba(186,230,200,0.5)' }}>/bln</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {features.map(f => (
                        <span key={f} style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.05)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-dm-sans)',
                          color: 'rgba(186,230,200,0.55)',
                        }}>
                          {(FEATURE_LABELS[f] ?? f).split(' ').slice(0, 2).join(' ')}
                        </span>
                      ))}
                      {PLAN_FEATURES[p].includes('*') && (
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'rgba(34,197,94,0.1)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-dm-sans)',
                          color: '#22C55E',
                        }}>+ semua ciri</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Summary */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.15)',
            }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(186,230,200,0.6)', marginBottom: '6px' }}>
                Ringkasan pesanan:
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 600, color: '#F0FDF4' }}>
                {mosque.name} · Plan {PLAN_LABEL[plan]}
              </p>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '22px', fontWeight: 700, color: '#22C55E', marginTop: '4px' }}>
                RM{PLAN_PRICE_RM[plan]}<span style={{ fontSize: '13px', fontFamily: 'var(--font-dm-sans)', fontWeight: 400, color: 'rgba(186,230,200,0.5)' }}>/bulan</span>
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(186,230,200,0.65)', marginTop: '4px' }}>
                Bayaran melalui FPX atau kad kredit (Billplz)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setError(''); setStep(2) }}
                style={{
                  flex: 1,
                  padding: '13px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.20)',
                  color: '#E0EDE5',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <ChevronLeft style={{ width: '15px', height: '15px' }} /> Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '13px',
                  borderRadius: '12px',
                  background: loading ? 'rgba(34,197,94,0.5)' : '#22C55E',
                  color: '#08090E',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {loading ? 'Sila tunggu…' : `Bayar RM${PLAN_PRICE_RM[plan]}`}
                {!loading && <ChevronRight style={{ width: '15px', height: '15px' }} />}
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            fontSize: '12px',
            color: '#F87171',
            fontFamily: 'var(--font-dm-sans)',
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
