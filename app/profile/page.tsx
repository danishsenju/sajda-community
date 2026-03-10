'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import { LogOut, User, Phone, Home, ArrowRight, ShieldCheck, Pencil, Flame, CheckSquare, Lock } from 'lucide-react'
import { PushSubscribeButton } from '@/components/ui/PushSubscribeButton'
import { safeRead, calcStreak, getMalaysiaDate, PRAYERS } from '@/hooks/useSolatTracker'

/* ── PRIVATE STREAK CARD ─────────────────────────────────────────────── */
function SolatStreakCard() {
  const [streak,     setStreak]     = useState<number | null>(null)
  const [todayCount, setTodayCount] = useState(0)

  useEffect(() => {
    try {
      const log  = safeRead()
      const today = getMalaysiaDate()
      if (!log[today]) { setStreak(0); setTodayCount(0); return }
      const todayCount = PRAYERS.filter(p => log[today][p]).length
      setTodayCount(todayCount)
      setStreak(calcStreak(log, today))
    } catch { setStreak(0) }
  }, [])

  if (streak === null) return <div className="skeleton h-24 rounded-2xl w-full mb-4" />

  return (
    <a
      href="/solat"
      className="block rounded-2xl border mb-4 overflow-hidden animate-slideUp"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', textDecoration: 'none' }}
    >
      {/* Green top bar */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, #22C55E 0%, transparent 100%)' }} />

      <div style={{ padding: '16px 20px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare style={{ width: '14px', height: '14px', color: 'var(--primary)' }} />
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Istiqamah Solat
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock style={{ width: '10px', height: '10px', color: 'var(--text-dim)' }} />
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)' }}>
              Peribadi
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Streak */}
          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            background: streak > 0 ? 'rgba(245,158,11,0.06)' : 'var(--surface)',
            border: `1px solid ${streak > 0 ? 'rgba(245,158,11,0.15)' : 'var(--border)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
              <Flame style={{ width: '12px', height: '12px', color: streak > 0 ? '#F59E0B' : 'var(--text-dim)' }} />
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Streak
              </p>
            </div>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '28px', fontWeight: 700, color: streak > 0 ? '#F59E0B' : 'var(--text-secondary)', margin: 0, lineHeight: 1 }}>
              {streak}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
              hari berturut-turut
            </p>
          </div>

          {/* Today */}
          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            background: todayCount === 5 ? 'rgba(34,197,94,0.06)' : 'var(--surface)',
            border: `1px solid ${todayCount === 5 ? 'rgba(34,197,94,0.18)' : 'var(--border)'}`,
          }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Hari Ini
            </p>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '28px', fontWeight: 700, color: todayCount === 5 ? '#22C55E' : 'var(--text-secondary)', margin: 0, lineHeight: 1 }}>
              {todayCount}<span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>/5</span>
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
              {todayCount === 5 ? 'Alhamdulillah ✓' : 'solat selesai'}
            </p>
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '5px', marginTop: '12px' }}>
          {PRAYERS.map(p => (
            <div key={p} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: PRAYERS.slice(0, todayCount).includes(p as typeof PRAYERS[number])
                ? '#22C55E'
                : 'var(--border)',
              transition: 'background 0.2s',
            }} />
          ))}
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '10px', color: 'var(--text-dim)', marginLeft: '4px', alignSelf: 'center' }}>
            Lihat rekod →
          </span>
        </div>
      </div>
    </a>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useUser()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', unit_blok: '' })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile')
    }
    if (profile) {
      setForm({
        full_name:  profile.full_name  ?? '',
        phone:      profile.phone      ?? '',
        unit_blok:  profile.unit_blok  ?? '',
      })
    }
  }, [user, profile, loading, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      full_name:  form.full_name,
      phone:      form.phone,
      unit_blok:  form.unit_blok,
    }).eq('id', user.id)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (loading || (user != null && profile == null)) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-4">
        <div className="skeleton h-32 rounded-2xl w-full" />
        <div className="skeleton h-48 rounded-2xl w-full" />
        <div className="skeleton h-12 rounded-xl w-full" />
      </div>
    )
  }

  if (!user || !profile) return null

  const roleLabel: Record<string, string> = {
    jemaah: 'Jemaah', ajk: 'AJK', superadmin: 'Super Admin',
  }
  const isAdmin = profile.role === 'ajk' || profile.role === 'superadmin'
  const initials = (profile.full_name ?? user.email ?? 'J').charAt(0).toUpperCase()
  const avatarColors: Record<string, { bg: string; text: string }> = {
    jemaah:     { bg: '#E8F5EE', text: '#2D6A4F' },
    ajk:        { bg: '#FEF9EC', text: '#B78628' },
    superadmin: { bg: '#FEF9EC', text: '#B78628' },
  }
  const avatarStyle = avatarColors[profile.role] ?? avatarColors.jemaah

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* Profile hero banner */}
      <div className="relative overflow-hidden"
        style={{ background: 'var(--primary)', paddingBottom: 60 }}>
        {/* Geometric bg */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="prof-geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="20" fill="none" stroke="#fff" strokeWidth="0.6"/>
                <rect x="20" y="20" width="20" height="20" fill="none" stroke="#fff" strokeWidth="0.4"
                  transform="rotate(45 30 30)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#prof-geo)"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-4 pt-10">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-6"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'rgba(255,255,255,0.65)' }}>
            Profil Saya
          </p>

          <div className="flex items-center gap-5">
            {/* Avatar — Google picture or initials fallback */}
            {profile.avatar_url ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                style={{ border: '2px solid rgba(255,255,255,0.25)' }}>
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name ?? 'Avatar'}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontFamily: 'var(--font-playfair)',
                }}>
                {initials}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-playfair)' }}>
                {profile.full_name ?? 'Jemaah'}
              </h1>
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-jakarta)' }}>
                {user.email}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontFamily: 'var(--font-jakarta)',
                }}>
                {isAdmin && <ShieldCheck className="w-3 h-3" />}
                {roleLabel[profile.role] ?? profile.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards — float over hero */}
      <div className="max-w-lg mx-auto px-4" style={{ marginTop: -40 }}>

        {/* Profile details card */}
        <div className="rounded-2xl border shadow-lg mb-4 overflow-hidden animate-slideUp"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
              Maklumat Peribadi
            </h2>
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:bg-[var(--primary-pale)]"
                style={{ color: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}>
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          <div className="p-6">
            {editing ? (
              <form onSubmit={handleSave} className="flex flex-col gap-3">
                <Input
                  label="Nama Penuh"
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="Ahmad bin Ali"
                />
                <Input
                  label="No. Telefon"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="01x-xxxxxxx"
                />
                <Input
                  label="Unit / Blok"
                  value={form.unit_blok}
                  onChange={(e) => setForm((p) => ({ ...p, unit_blok: e.target.value }))}
                  placeholder="Blok A, Unit 12-3"
                />
                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setEditing(false)} type="button">
                    Batal
                  </Button>
                  <Button className="flex-1" type="submit" loading={saving}>
                    Simpan
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                {[
                  { icon: User,  value: profile.full_name ?? '—', label: 'Nama Penuh' },
                  { icon: Phone, value: profile.phone     ?? '—', label: 'No. Telefon' },
                  { icon: Home,  value: profile.unit_blok ?? '—', label: 'Unit / Blok' },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--primary-pale)' }}>
                      <Icon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider mb-0.5"
                        style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                        {label}
                      </p>
                      <p className="text-sm font-medium"
                        style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Istiqamah / Solat Streak card */}
        <SolatStreakCard />

        {/* Admin panel link */}
        {isAdmin && (
          <a href="/admin"
            className="flex items-center justify-between rounded-2xl border p-5 mb-4 transition-all hover:shadow-md animate-slideUp"
            style={{ background: '#FEF9EC', borderColor: '#F0D080' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#B78628' }}>
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
                  Panel Admin
                </p>
                <p className="text-xs" style={{ fontFamily: 'var(--font-jakarta)', color: '#B78628' }}>
                  Urus kandungan dan komuniti
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: '#B78628' }} />
          </a>
        )}

        {/* Push notifications */}
        <div className="animate-slideUp mb-3">
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--text-dim)', marginBottom: '8px',
          }}>Notifikasi</p>
          <PushSubscribeButton />
        </div>

        {/* Sign out */}
        <Button variant="danger" className="w-full gap-2 animate-slideUp mb-8" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Log Keluar
        </Button>
      </div>
    </div>
  )
}
