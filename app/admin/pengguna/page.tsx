'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { updateUserRole } from './actions'
import { Users, Shield, ChevronDown, RefreshCw, Search, Camera, X, ZoomIn, ZoomOut, Upload, Check } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  unit_blok: string | null
  role: string
  avatar_url: string | null
  created_at: string
}

const ROLES = [
  { value: 'jemaah',     label: 'Jemaah',     color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  { value: 'ajk',        label: 'AJK',        color: '#2563EB', bg: 'rgba(37,99,235,0.1)'   },
  { value: 'superadmin', label: 'Superadmin', color: '#DC2626', bg: 'rgba(220,38,38,0.1)'   },
]

/* ── Crop helper ─────────────────────────────────────────────────────── */
async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, size, size,
  )
  return new Promise(resolve =>
    canvas.toBlob(b => resolve(b!), 'image/webp', 0.88)
  )
}

/* ── Avatar crop modal ───────────────────────────────────────────────── */
function AvatarCropModal({ profile, onClose, onSaved }: {
  profile: Profile
  onClose: () => void
  onSaved: (id: string, url: string) => void
}) {
  const [imgSrc,    setImgSrc]    = useState<string | null>(null)
  const [crop,      setCrop]      = useState({ x: 0, y: 0 })
  const [zoom,      setZoom]      = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [errMsg,    setErrMsg]    = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels)
  }, [])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImgSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!imgSrc || !croppedArea) return
    setSaving(true)
    setErrMsg('')
    try {
      const blob = await getCroppedBlob(imgSrc, croppedArea)
      const supabase = createClient()
      const path = `avatars/${profile.id}.webp`
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/webp' })
      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)
      if (updateErr) throw updateErr

      onSaved(profile.id, publicUrl)
      onClose()
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Gagal menyimpan gambar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: '20px',
        border: '1px solid var(--border)',
        width: '100%', maxWidth: '440px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Gambar Profil
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
              {profile.full_name ?? 'Tiada nama'}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '30px', height: '30px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--elevated)',
            cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* Crop area */}
        <div style={{ padding: '20px' }}>
          {!imgSrc ? (
            /* Upload prompt */
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                height: '240px', borderRadius: '14px',
                border: '2px dashed var(--border)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '10px',
                cursor: 'pointer', transition: 'border-color 0.15s',
                background: 'var(--elevated)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Upload style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Klik untuk muat naik gambar
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>
                JPG, PNG atau WEBP
              </p>
            </div>
          ) : (
            /* Cropper */
            <>
              <div style={{
                position: 'relative', height: '260px', borderRadius: '14px',
                overflow: 'hidden', background: '#000',
                border: '1px solid var(--border)',
              }}>
                <Cropper
                  image={imgSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: { borderRadius: '14px' },
                    cropAreaStyle: { border: '2px solid var(--primary)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' },
                  }}
                />
              </div>

              {/* Zoom slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                <ZoomOut style={{ width: '14px', height: '14px', color: 'var(--text-dim)', flexShrink: 0 }} />
                <input
                  type="range" min={1} max={3} step={0.01}
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <ZoomIn style={{ width: '14px', height: '14px', color: 'var(--text-dim)', flexShrink: 0 }} />
              </div>

              <button
                onClick={() => { setImgSrc(null); setZoom(1); setCrop({ x: 0, y: 0 }) }}
                style={{
                  marginTop: '8px', width: '100%', padding: '8px',
                  borderRadius: '10px', border: '1px solid var(--border)',
                  background: 'transparent', cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                  color: 'var(--text-dim)',
                }}
              >
                Pilih gambar lain
              </button>
            </>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />

          {errMsg && (
            <p style={{
              marginTop: '10px', fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
              color: '#EF4444', textAlign: 'center',
            }}>
              {errMsg}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: '8px',
          padding: '0 20px 20px',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px', borderRadius: '12px',
              border: '1px solid var(--border)', background: 'transparent',
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!imgSrc || !croppedArea || saving}
            style={{
              flex: 2, padding: '11px', borderRadius: '12px',
              border: 'none', background: 'var(--primary)',
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
              color: '#04080A', cursor: (!imgSrc || saving) ? 'not-allowed' : 'pointer',
              opacity: (!imgSrc || saving) ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            {saving
              ? <><RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 0.8s linear infinite' }} /> Menyimpan...</>
              : <><Camera style={{ width: '13px', height: '13px' }} /> Simpan Gambar</>
            }
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── Role badge ──────────────────────────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const r = ROLES.find(r => r.value === role) ?? ROLES[0]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '100px',
      background: r.bg, color: r.color,
      fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600,
      letterSpacing: '0.05em',
    }}>
      {role === 'superadmin' && <Shield style={{ width: '10px', height: '10px' }} />}
      {r.label}
    </span>
  )
}

/* ── Role dropdown — premium custom dropdown ─────────────────────────── */
function RoleDropdown({ profile, currentSuperAdminId, onUpdate }: {
  profile: Profile
  currentSuperAdminId: string
  onUpdate: (id: string, role: string) => void
}) {
  const [pending, startTransition] = useTransition()
  const [open, setOpen]            = useState(false)
  const [msg, setMsg]              = useState('')
  const ref                        = useRef<HTMLDivElement>(null)
  const isSelf = profile.id === currentSuperAdminId
  const r = ROLES.find(r => r.value === profile.role) ?? ROLES[0]

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  function handleSelect(newRole: string) {
    setOpen(false)
    if (newRole === profile.role) return
    startTransition(async () => {
      const res = await updateUserRole(profile.id, newRole)
      if (res.error) {
        setMsg(res.error)
        setTimeout(() => setMsg(''), 3000)
      } else {
        onUpdate(profile.id, newRole)
      }
    })
  }

  const ROLE_META: Record<string, { desc: string; icon?: React.ReactNode }> = {
    jemaah:     { desc: 'Ahli biasa komuniti' },
    ajk:        { desc: 'Ahli Jawatankuasa' },
    superadmin: { desc: 'Pentadbir penuh sistem', icon: <Shield style={{ width: '10px', height: '10px' }} /> },
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Trigger badge */}
      <button
        onClick={() => { if (!isSelf && !pending) setOpen(p => !p) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '5px 8px 5px 10px', borderRadius: '100px',
          background: r.bg, border: `1px solid ${r.color}55`,
          fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 600,
          color: r.color, letterSpacing: '0.04em',
          cursor: isSelf ? 'not-allowed' : 'pointer',
          outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? `0 0 0 2px ${r.color}33` : 'none',
          opacity: isSelf ? 0.6 : 1,
        }}
      >
        {ROLE_META[profile.role]?.icon}
        {r.label}
        {pending
          ? <RefreshCw style={{ width: '10px', height: '10px', animation: 'spin 0.8s linear infinite' }} />
          : <ChevronDown style={{ width: '10px', height: '10px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
        }
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 100,
          width: '200px',
          background: 'var(--surface)',
          border: '1px solid var(--border-accent)',
          borderRadius: '14px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          overflow: 'hidden',
          animation: 'roleDropDown 0.18s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {/* Panel header */}
          <div style={{
            padding: '10px 14px 8px',
            borderBottom: '1px solid var(--border)',
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--text-dim)', margin: 0,
            }}>Tukar Peranan</p>
          </div>

          {/* Role options */}
          <div style={{ padding: '6px' }}>
            {ROLES.map(ro => {
              const isActive = profile.role === ro.value
              const meta = ROLE_META[ro.value]
              return (
                <button
                  key={ro.value}
                  onClick={() => handleSelect(ro.value)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 10px', borderRadius: '9px',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: isActive ? `${ro.color}12` : 'transparent',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--elevated)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Color dot */}
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: ro.color,
                    boxShadow: isActive ? `0 0 6px ${ro.color}88` : 'none',
                  }} />

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                      color: isActive ? ro.color : 'var(--text-primary)',
                      margin: 0, display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      {meta?.icon}
                      {ro.label}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: '10px',
                      color: 'var(--text-dim)', margin: '1px 0 0',
                    }}>
                      {meta?.desc}
                    </p>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <Check style={{ width: '12px', height: '12px', color: ro.color, flexShrink: 0 }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {msg && (
        <p style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 110,
          background: '#1A0A0A', border: '1px solid #DC262644',
          borderRadius: '8px', padding: '5px 10px',
          fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#EF4444',
          whiteSpace: 'nowrap',
        }}>
          {msg}
        </p>
      )}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────── */
export default function PenggunaPage() {
  const [profiles,    setProfiles]    = useState<Profile[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterRole,  setFilterRole]  = useState('semua')
  const [meId,        setMeId]        = useState('')
  const [cropTarget,  setCropTarget]  = useState<Profile | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setMeId(user.id)
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, unit_blok, role, avatar_url, created_at')
        .order('created_at', { ascending: false })
      setProfiles((data ?? []) as Profile[])
      setLoading(false)
    }
    load()
  }, [])

  function handleRoleUpdate(id: string, newRole: string) {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p))
  }

  function handleAvatarSaved(id: string, url: string) {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, avatar_url: url } : p))
  }

  const filtered = profiles.filter(p => {
    const matchRole   = filterRole === 'semua' || p.role === filterRole
    const matchSearch = !search || (p.full_name ?? '').toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const roleCounts = {
    jemaah:     profiles.filter(p => p.role === 'jemaah').length,
    ajk:        profiles.filter(p => p.role === 'ajk').length,
    superadmin: profiles.filter(p => p.role === 'superadmin').length,
  }

  return (
    <div style={{ maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--primary)', marginBottom: '6px',
        }}>Panel Admin</p>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Urus Pengguna
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Tetapkan peranan & gambar profil jemaah, AJK atau superadmin
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Jumlah',     value: profiles.length,      color: 'var(--primary)' },
          { label: 'Jemaah',     value: roleCounts.jemaah,    color: '#6B7280' },
          { label: 'AJK',        value: roleCounts.ajk,       color: '#2563EB' },
          { label: 'Superadmin', value: roleCounts.superadmin, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{
            flex: '1 1 100px', padding: '14px 18px', borderRadius: '14px',
            background: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '1.6rem', fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>
              {loading ? '—' : s.value}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama..."
            style={{
              width: '100%', padding: '9px 14px 9px 34px',
              borderRadius: '10px', border: '1px solid var(--border)',
              background: 'var(--elevated)', color: 'var(--text-primary)',
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-dim)', pointerEvents: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['semua', 'jemaah', 'ajk', 'superadmin'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              style={{
                padding: '8px 14px', borderRadius: '10px', border: '1px solid',
                borderColor: filterRole === r ? 'var(--primary)' : 'var(--border)',
                background: filterRole === r ? 'rgba(34,197,94,0.08)' : 'var(--elevated)',
                color: filterRole === r ? 'var(--primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {r === 'semua' ? 'Semua' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              height: '64px', borderRadius: '12px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              animation: 'shimmer 1.5s ease-in-out infinite', animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <Users style={{ width: '28px', height: '28px', color: 'var(--text-dim)', margin: '0 auto 10px' }} />
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)' }}>Tiada pengguna dijumpai</p>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          {filtered.map((profile, i) => (
            <div
              key={profile.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                borderRadius: i === 0 ? '16px 16px 0 0' : i === filtered.length - 1 ? '0 0 16px 16px' : undefined,
                overflow: 'visible',
              }}
            >
              {/* Avatar — click to upload/crop */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  onClick={() => setCropTarget(profile)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    overflow: 'hidden', cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: 'var(--elevated)',
                    position: 'relative',
                  }}
                >
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name ?? ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-dm-sans)', fontSize: '15px', fontWeight: 700,
                      color: 'var(--text-secondary)',
                    }}>
                      {(profile.full_name ?? '?').charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                  >
                    <Camera style={{ width: '14px', height: '14px', color: '#fff' }} />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
                  color: 'var(--text-primary)', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {profile.full_name ?? 'Tiada nama'}
                  {profile.id === meId && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 500, color: 'var(--text-dim)' }}>
                      (anda)
                    </span>
                  )}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                  {[profile.unit_blok, profile.phone].filter(Boolean).join(' · ') || 'Tiada maklumat tambahan'}
                </p>
              </div>

              {/* Role changer */}
              <RoleDropdown
                profile={profile}
                currentSuperAdminId={meId}
                onUpdate={handleRoleUpdate}
              />
            </div>
          ))}
        </div>
      )}

      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '12px', textAlign: 'right' }}>
        {filtered.length} daripada {profiles.length} pengguna
      </p>

      {/* Crop modal */}
      {cropTarget && (
        <AvatarCropModal
          profile={cropTarget}
          onClose={() => setCropTarget(null)}
          onSaved={handleAvatarSaved}
        />
      )}

      <style>{`
        @keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
