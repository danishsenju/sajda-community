'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  User, Phone, Home, Sun, Moon, Monitor, Type,
  Bell, Shield, Info, ChevronRight, Check,
  AlertTriangle, Globe,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { useTextSize, type TextSize } from '@/hooks/useTextSize'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

/* ─────────────── SECTION SHELL ─────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '10px',
        paddingLeft: '4px',
      }}>
        {title}
      </p>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

/* ─────────────── ROW ─────────────── */
function Row({ children, noBorder }: { children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: noBorder ? 'none' : '1px solid var(--border)',
    }}>
      {children}
    </div>
  )
}

/* ─────────────── TOGGLE SWITCH ─────────────── */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '48px',
        height: '28px',
        borderRadius: '100px',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        padding: 0,
        background: value ? 'var(--primary)' : 'var(--elevated)',
        boxShadow: value ? '0 0 0 1px var(--border-lit)' : '0 0 0 1px var(--border)',
        transition: 'background 0.2s, box-shadow 0.2s',
      }}
      aria-checked={value}
      role="switch"
    >
      <span style={{
        position: 'absolute',
        top: '4px',
        left: value ? '24px' : '4px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: value ? 'var(--text-inverse)' : 'var(--text-muted)',
        transition: 'left 0.2s, background 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
      }} />
    </button>
  )
}

/* ─────────────── NOTIFICATION ROW ─────────────── */
function NotifRow({
  label,
  desc,
  storageKey,
  noBorder,
}: {
  label: string
  desc: string
  storageKey: string
  noBorder?: boolean
}) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(localStorage.getItem(storageKey) !== 'false')
  }, [storageKey])

  function toggle(v: boolean) {
    setEnabled(v)
    localStorage.setItem(storageKey, String(v))
  }

  return (
    <Row noBorder={noBorder}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', minHeight: '48px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
            {label}
          </p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
            {desc}
          </p>
        </div>
        <Toggle value={enabled} onChange={toggle} />
      </div>
    </Row>
  )
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, profile } = useUser()
  const { theme, setTheme } = useTheme()
  const { size: textSize, changeSize } = useTextSize()

  /* ── Akaun form ── */
  const [fullName,  setFullName]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [unitBlok,  setUnitBlok]  = useState('')
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)

  /* ── Penampilan ── */
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (profile) {
      setFullName(profile.full_name ?? '')
      setPhone(profile.phone ?? '')
      setUnitBlok(profile.unit_blok ?? '')
    }
  }, [profile])

  async function handleSaveProfile() {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: fullName.trim(),
      phone: phone.trim(),
      unit_blok: unitBlok.trim(),
    }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  /* ── Text size preview map ── */
  const TEXT_SIZES: { key: TextSize; label: string; px: string }[] = [
    { key: 'small',   label: 'Kecil',        px: '14px' },
    { key: 'regular', label: 'Sederhana',     px: '16px' },
    { key: 'large',   label: 'Besar',         px: '18px' },
  ]

  const THEME_OPTIONS = [
    { key: 'dark',   label: 'Gelap',    Icon: Moon    },
    { key: 'light',  label: 'Cerah',    Icon: Sun     },
    { key: 'system', label: 'Sistem',   Icon: Monitor },
  ] as const

  /* ── Danger: delete account ── */
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--void)',
      paddingBottom: '120px',
    }}>
      {/* ── Page header ── */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--void)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-syne)',
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Tetapan
        </h1>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '15px',
          color: 'var(--text-muted)',
          margin: 0,
          marginTop: '2px',
        }}>
          Urus akaun dan pilihan anda
        </p>
      </div>

      {/* ── Content ── */}
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '24px 20px',
      }}>

        {/* ══ 1. AKAUN ══ */}
        <Section title="Akaun">
          {/* Avatar */}
          <Row>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--primary-muted)',
                border: '2px solid var(--border-lit)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '28px',
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
                color: 'var(--primary)',
              }}>
                {fullName.trim()
                  ? fullName.trim().split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                  : <User style={{ width: '28px', height: '28px' }} />
                }
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {fullName || 'Nama anda'}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                  {user?.email ?? '—'}
                </p>
                <span style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '2px 10px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: 500,
                  background: 'var(--primary-muted)',
                  color: 'var(--primary)',
                  border: '1px solid var(--border-lit)',
                  textTransform: 'capitalize',
                }}>
                  {profile?.role ?? 'Jemaah'}
                </span>
              </div>
            </div>
          </Row>

          {/* Fields */}
          <Row>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Nama Penuh"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nama penuh anda"
              />
              <Input
                label="No. Telefon"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+601x-xxxxxxx"
                type="tel"
              />
              <Input
                label="Blok / Unit"
                value={unitBlok}
                onChange={e => setUnitBlok(e.target.value)}
                placeholder="cth. Blok A, Unit 3-12"
              />
            </div>
          </Row>

          {/* Save button */}
          <Row noBorder>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              onClick={handleSaveProfile}
              style={{ width: '100%' }}
            >
              {saved
                ? <><Check style={{ width: '16px', height: '16px' }} /> Tersimpan</>
                : 'Simpan Perubahan'
              }
            </Button>
          </Row>
        </Section>

        {/* ══ 2. PENAMPILAN ══ */}
        <Section title="Penampilan">

          {/* Theme toggle */}
          <Row>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Mod Paparan
            </p>
            {mounted && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}>
                {THEME_OPTIONS.map(({ key, label, Icon }) => {
                  const active = theme === key
                  return (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 8px',
                        borderRadius: '14px',
                        border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        background: active ? 'var(--primary-muted)' : 'var(--elevated)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        minHeight: '48px',
                      }}
                    >
                      <Icon style={{
                        width: '20px',
                        height: '20px',
                        color: active ? 'var(--primary)' : 'var(--text-muted)',
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '13px',
                        fontWeight: active ? 600 : 400,
                        color: active ? 'var(--primary)' : 'var(--text-secondary)',
                      }}>
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </Row>

          {/* Text size */}
          <Row>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Saiz Teks
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginBottom: '14px',
            }}>
              {TEXT_SIZES.map(({ key, label, px }) => {
                const active = textSize === key
                return (
                  <button
                    key={key}
                    onClick={() => changeSize(key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 8px',
                      borderRadius: '14px',
                      border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: active ? 'var(--primary-muted)' : 'var(--elevated)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      minHeight: '48px',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: px,
                      fontWeight: 700,
                      color: active ? 'var(--primary)' : 'var(--text-muted)',
                      lineHeight: 1,
                    }}>
                      A
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--primary)' : 'var(--text-secondary)',
                    }}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
            {/* Live preview */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: TEXT_SIZES.find(t => t.key === textSize)?.px ?? '16px',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.6,
              }}>
                Ini contoh saiz teks yang dipilih
              </p>
            </div>
          </Row>

          {/* Language */}
          <Row noBorder>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe style={{ width: '18px', height: '18px', color: 'var(--text-muted)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                    Bahasa
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                    Bahasa Malaysia
                  </p>
                </div>
              </div>
              <div style={{
                padding: '4px 12px',
                borderRadius: '100px',
                background: 'var(--primary-muted)',
                border: '1px solid var(--border-lit)',
              }}>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--primary)' }}>
                  BM
                </span>
              </div>
            </div>
          </Row>
        </Section>

        {/* ══ 3. NOTIFIKASI ══ */}
        <Section title="Notifikasi">
          <NotifRow
            label="Waktu Solat"
            desc="Peringatan azan setiap waktu"
            storageKey="notif-solat"
          />
          <NotifRow
            label="Program Masjid"
            desc="Program & aktiviti akan datang"
            storageKey="notif-program"
          />
          <NotifRow
            label="Pengumuman"
            desc="Berita terkini daripada masjid"
            storageKey="notif-announcement"
          />
          <NotifRow
            label="Keperluan Komuniti"
            desc="Keperluan baru memerlukan bantuan"
            storageKey="notif-keperluan"
            noBorder
          />
        </Section>

        {/* ══ 4. PRIVASI & KESELAMATAN ══ */}
        <Section title="Privasi & Keselamatan">
          <Row>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                minHeight: '48px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield style={{ width: '18px', height: '18px', color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Tukar Kata Laluan
                </span>
              </div>
              <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)', flexShrink: 0 }} />
            </button>
          </Row>

          {/* PDPA notice */}
          <Row>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.6,
            }}>
              Data anda dilindungi di bawah Akta Perlindungan Data Peribadi 2010 (PDPA).{' '}
              <a
                href="#"
                style={{ color: 'var(--primary)', textDecoration: 'underline' }}
              >
                Baca Dasar Privasi
              </a>
            </p>
          </Row>

          {/* Danger zone */}
          <Row noBorder>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  minHeight: '48px',
                }}
              >
                <AlertTriangle style={{ width: '16px', height: '16px', color: 'var(--red)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '15px', color: 'var(--red)', fontWeight: 500 }}>
                  Padam Akaun
                </span>
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  Tindakan ini tidak boleh dibatalkan. Semua data anda akan dipadam secara kekal.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button variant="danger" size="sm" style={{ flex: 1 }}>
                    Ya, padam akaun saya
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </Row>
        </Section>

        {/* ══ 5. TENTANG SAJDA ══ */}
        <Section title="Tentang Sajda">
          <Row>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Info style={{ width: '18px', height: '18px', color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Versi Aplikasi
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '14px', color: 'var(--text-muted)' }}>
                v1.0.0
              </span>
            </div>
          </Row>

          <Row>
            <a
              href="#"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                minHeight: '48px',
              }}
            >
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Terma Perkhidmatan
              </span>
              <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)', flexShrink: 0 }} />
            </a>
          </Row>

          <Row>
            <a
              href="#"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                minHeight: '48px',
              }}
            >
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Dasar Privasi
              </span>
              <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)', flexShrink: 0 }} />
            </a>
          </Row>

          <Row noBorder>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '48px' }}>
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Hubungi Kami
              </span>
              <a
                href="mailto:support@sajda.my"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '14px',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                }}
              >
                support@sajda.my
              </a>
            </div>
          </Row>
        </Section>

        {/* Copyright */}
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          margin: '8px 0 0',
          lineHeight: 1.6,
        }}>
          © 2026 Sajda · Dibina oleh KrackedDevs untuk RC26
        </p>

      </div>
    </div>
  )
}
