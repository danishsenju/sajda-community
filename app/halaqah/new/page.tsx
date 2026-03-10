'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ChevronLeft, BookOpen, Brain, Search, Music2, Lock, Unlock, Users, Target, Info } from 'lucide-react'

const TYPES = [
  { value: 'tadarus',  label: 'Tadarus Al-Quran', desc: 'Membaca Al-Quran bersama, juzuk demi juzuk', icon: BookOpen,  color: '#22C55E' },
  { value: 'hafazan',  label: 'Hafazan',          desc: 'Menghafal ayat & surah secara berkumpulan', icon: Brain,     color: '#A78BFA' },
  { value: 'tafsir',   label: 'Tafsir & Tadabbur',desc: 'Memahami makna & tafsir Al-Quran bersama', icon: Search,    color: '#38BDF8' },
  { value: 'tahsin',   label: 'Tahsin Tilawah',   desc: 'Memperbaiki bacaan & tajwid Al-Quran',     icon: Music2,    color: '#FCD34D' },
]

export default function NewHalaqahPage() {
  const router = useRouter()
  const [step, setStep]           = useState<1 | 2>(1)
  const [type, setType]           = useState('')
  const [name, setName]           = useState('')
  const [description, setDesc]    = useState('')
  const [weeklyTarget, setTarget] = useState(1)
  const [maxMembers, setMax]      = useState(10)
  const [isOpen, setIsOpen]       = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type) { setError('Sila pilih jenis halaqah'); return }
    if (!name.trim()) { setError('Sila masukkan nama halaqah'); return }
    setError('')
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/halaqah/new'); return }

      const { data, error: insertErr } = await supabase
        .from('halaqah_groups')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          type,
          weekly_target: weeklyTarget,
          max_members: maxMembers,
          is_open: isOpen,
          created_by: user.id,
        })
        .select('id')
        .single()

      if (insertErr) throw insertErr

      // auto-join creator as member
      await supabase.from('halaqah_members').insert({
        group_id: data.id,
        user_id: user.id,
        role: 'ketua',
      })

      router.push(`/halaqah/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mencipta halaqah')
      setSaving(false)
    }
  }

  const selectedType = TYPES.find(t => t.value === type)

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, var(--elevated) 0%, var(--surface) 60%, var(--void) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="new-geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,6 50,32 76,32 54,48 62,74 40,58 18,74 26,48 4,32 30,32"
                  fill="none" stroke="#22C55E" strokeWidth="0.6"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#new-geo)"/>
          </svg>
        </div>

        <div style={{ maxWidth: '580px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link href="/halaqah" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} /> Halaqah Komuniti
          </Link>

          <h1 style={{
            fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1,
          }}>
            Cipta Halaqah Baru
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Tubuhkan kumpulan Al-Quran komuniti anda
          </p>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step >= s ? 'var(--primary)' : 'var(--elevated)',
                  border: `1px solid ${step >= s ? 'var(--primary)' : 'var(--border)'}`,
                  fontFamily: 'var(--font-jetbrains)', fontSize: '10px', fontWeight: 700,
                  color: step >= s ? '#04080A' : 'var(--text-dim)',
                  transition: 'all 0.2s',
                }}>
                  {s}
                </div>
                {s < 2 && <div style={{ width: '32px', height: '1px', background: step > s ? 'var(--primary)' : 'var(--border)', transition: 'background 0.2s' }} />}
              </div>
            ))}
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)', marginLeft: '4px' }}>
              {step === 1 ? 'Jenis Halaqah' : 'Butiran & Tetapan'}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '32px 20px 80px' }}>
        <form onSubmit={handleSubmit}>

          {/* Step 1 — Type selection */}
          {step === 1 && (
            <div style={{ animation: 'fadeUp 0.3s ease forwards' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Pilih jenis halaqah yang ingin anda tubuhkan:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
                {TYPES.map(t => {
                  const Icon = t.icon
                  const selected = type === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      style={{
                        padding: '20px 16px', borderRadius: '16px', textAlign: 'left', cursor: 'pointer',
                        background: selected ? `rgba(${t.color === '#22C55E' ? '34,197,94' : t.color === '#A78BFA' ? '167,139,250' : t.color === '#38BDF8' ? '56,189,248' : '252,211,77'},0.08)` : 'var(--surface)',
                        border: `2px solid ${selected ? t.color : 'var(--border)'}`,
                        transition: 'all 0.15s', boxShadow: selected ? `0 4px 20px rgba(0,0,0,0.2)` : 'none',
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: selected ? t.color : 'var(--elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '12px', transition: 'all 0.15s',
                      }}>
                        <Icon style={{ width: '18px', height: '18px', color: selected ? '#04080A' : t.color }} />
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700,
                        color: selected ? t.color : 'var(--text-primary)', margin: '0 0 4px',
                      }}>
                        {t.label}
                      </p>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                        {t.desc}
                      </p>
                    </button>
                  )
                })}
              </div>

              {error && (
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#EF4444', marginBottom: '16px' }}>
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={!type}
                onClick={() => { if (!type) { setError('Sila pilih jenis halaqah'); return }; setError(''); setStep(2) }}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px',
                  background: type ? 'var(--primary)' : 'var(--elevated)',
                  border: 'none', cursor: type ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700,
                  color: type ? '#04080A' : 'var(--text-dim)',
                  transition: 'all 0.15s',
                  boxShadow: type ? '0 4px 20px rgba(34,197,94,0.25)' : 'none',
                }}
              >
                Seterusnya →
              </button>
            </div>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <div style={{ animation: 'fadeUp 0.3s ease forwards' }}>
              {/* Selected type recap */}
              {selectedType && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '12px', marginBottom: '24px',
                  background: 'var(--elevated)', border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: selectedType.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <selectedType.icon style={{ width: '14px', height: '14px', color: '#04080A' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600, color: selectedType.color }}>
                    {selectedType.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      marginLeft: 'auto', fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
                      color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Tukar
                  </button>
                </div>
              )}

              {/* Name */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Nama Halaqah *
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Cth: Halaqah Subuh Jemaah Muda"
                  maxLength={60}
                  required
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '14px',
                    color: 'var(--text-primary)', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', textAlign: 'right' }}>
                  {name.length}/60
                </p>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Penerangan (pilihan)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Huraikan matlamat, jadual dan cara halaqah anda beroperasi..."
                  maxLength={300}
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                    color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', lineHeight: 1.5,
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Weekly target + Max members */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    <Target style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />
                    Sasaran Minggu
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={() => setTarget(Math.max(1, weeklyTarget - 1))} style={btnNum}>−</button>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)', minWidth: '32px', textAlign: 'center' }}>
                      {weeklyTarget}
                    </span>
                    <button type="button" onClick={() => setTarget(Math.min(30, weeklyTarget + 1))} style={btnNum}>+</button>
                  </div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>juzuk / minggu</p>
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    <Users style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />
                    Had Ahli
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={() => setMax(Math.max(2, maxMembers - 1))} style={btnNum}>−</button>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)', minWidth: '32px', textAlign: 'center' }}>
                      {maxMembers}
                    </span>
                    <button type="button" onClick={() => setMax(Math.min(50, maxMembers + 1))} style={btnNum}>+</button>
                  </div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>orang maksimum</p>
                </div>
              </div>

              {/* Open / Closed */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Kemasukan Ahli
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { v: true,  label: 'Terbuka',  desc: 'Sesiapa boleh sertai', icon: Unlock, color: '#22C55E' },
                    { v: false, label: 'Tertutup', desc: 'Hanya jemputan sahaja', icon: Lock,   color: '#F59E0B' },
                  ].map(opt => (
                    <button
                      key={String(opt.v)}
                      type="button"
                      onClick={() => setIsOpen(opt.v)}
                      style={{
                        padding: '12px 14px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                        background: isOpen === opt.v ? 'var(--elevated)' : 'var(--surface)',
                        border: `2px solid ${isOpen === opt.v ? opt.color : 'var(--border)'}`,
                        display: 'flex', flexDirection: 'column', gap: '4px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <opt.icon style={{ width: '13px', height: '13px', color: opt.color }} />
                        <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 700, color: isOpen === opt.v ? opt.color : 'var(--text-primary)' }}>
                          {opt.label}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)' }}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info note */}
              <div style={{
                display: 'flex', gap: '10px', padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)',
                marginBottom: '24px',
              }}>
                <Info style={{ width: '14px', height: '14px', color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Anda akan menjadi <strong style={{ color: 'var(--primary)' }}>Ketua Halaqah</strong> dan ahli pertama secara automatik. Progress juzuk direkod secara individu untuk setiap ahli.
                </p>
              </div>

              {error && (
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#EF4444', marginBottom: '16px' }}>
                  {error}
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: '14px 20px', borderRadius: '14px',
                    background: 'transparent', border: '1px solid var(--border)',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 600,
                    color: 'var(--text-secondary)', cursor: 'pointer',
                  }}
                >
                  ← Balik
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '14px',
                    background: saving ? 'var(--elevated)' : 'var(--primary)',
                    border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700,
                    color: saving ? 'var(--text-dim)' : '#04080A',
                    boxShadow: saving ? 'none' : '0 4px 20px rgba(34,197,94,0.25)',
                    transition: 'all 0.15s',
                  }}
                >
                  {saving ? 'Mencipta...' : 'Cipta Halaqah'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}

const btnNum: React.CSSProperties = {
  width: '32px', height: '32px', borderRadius: '8px',
  background: 'var(--surface)', border: '1px solid var(--border)',
  fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 700,
  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
