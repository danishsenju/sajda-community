'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Home, Heart, Calendar, BookOpen, HandCoins, User, ShieldCheck,
  X, BookMarked, Compass, Clock, Search, Building2,
  ChevronDown, MoreHorizontal, Sparkles, Moon, CheckSquare, Sun, RotateCcw, Users,
  LayoutDashboard, Megaphone, Settings, Type, Zap, ZapOff, Radio, Mic, PersonStanding,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { useActiveMosque } from '@/hooks/useActiveMosque'
import sajdaLogo from '@/images/sajda-logo.png'
import { NotificationPanel } from '@/components/ui/NotificationPanel'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useTheme } from 'next-themes'
import { useTextSize, type TextSize } from '@/hooks/useTextSize'

const primaryNav = [
  { href: '/',          label: 'Utama' },
  { href: '/keperluan', label: 'Keperluan' },
  { href: '/program',   label: 'Program' },
  { href: '/kelas',     label: 'Kelas' },
]

const toolsCategories = [
  {
    label: 'Komuniti',
    items: [
      { href: '/live',        label: 'Siaran Langsung', icon: Radio,       desc: 'Tonton siaran langsung masjid' },
      { href: '/janaiz',      label: 'Papan Janaiz',    icon: Heart,       desc: 'Notis kematian & takziah' },
      { href: '/cari-barang', label: 'Cari Barang',     icon: Search,      desc: 'Barang hilang & dijumpai' },
      { href: '/bilal',       label: 'Jadual Bilal',    icon: Mic,         desc: 'Jadual bilal mingguan' },
    ],
  },
  {
    label: 'Ibadah & Ilmu',
    items: [
      { href: '/solat',    label: 'Jejak Solat',    icon: CheckSquare, desc: 'Rekod solat harian & streak' },
      { href: '/hadis',    label: 'Hadis Harian',   icon: BookMarked,  desc: 'Hadis pilihan setiap hari' },
      { href: '/hijri',    label: 'Kalendar Hijri', icon: Moon,        desc: 'Kalendar Islam Malaysia' },
    ],
  },
  {
    label: 'Masjid',
    items: [
      { href: '/masjid',     label: 'Info Masjid',   icon: Building2, desc: 'Lokasi, kemudahan & kenalan' },
      { href: '/derma',      label: 'Derma',         icon: HandCoins, desc: 'Tabung & derma masjid' },
      { href: '/qiblat',     label: 'Qiblat',        icon: Compass,   desc: 'Arah kiblat dari lokasi anda' },
      { href: '/buka-puasa', label: 'Waktu Berbuka', icon: Clock,     desc: 'Kiraan masa berbuka puasa' },
    ],
  },
]

// flat list kept for active-check helpers
const toolsNav = toolsCategories.flatMap(c => c.items)

const bottomNavKomuniti = [
  { href: '/home',        label: 'Utama',   icon: Home },
  { href: '/keperluan',   label: 'Komuniti',icon: Users },
  { href: '/masjid-saya', label: 'Masjid',  icon: Building2 },
  { href: '/program',     label: 'Program', icon: Calendar },
  { href: '/profile',     label: 'Profil',  icon: User },
]

const bottomNavIbadah = [
  { href: '/home',    label: 'Utama',   icon: Home },
  { href: '/solat',   label: 'Solat',   icon: CheckSquare },
  { href: '/tasbih',  label: 'Tasbih',  icon: RotateCcw },
  { href: '/wirid',   label: 'Wirid',   icon: Sun },
  { href: '/profile', label: 'Profil',  icon: User },
]

/* ── SAJDA LOGO — wide horizontal logo, ~3.2:1 aspect ratio ── */
function SajdaLogo({ height = 32 }: { height?: number }) {
  return (
    <Image
      src={sajdaLogo}
      alt="Sajda"
      width={Math.round(height * 3.2)}
      height={height}
      className="object-contain sajda-logo"
    />
  )
}

/* ── MOBILE BOTTOM NAV — mode-aware floating pill ── */
function BottomNav() {
  const pathname = usePathname()
  const [mode, setMode] = useState<'komuniti' | 'ibadah'>('komuniti')

  useEffect(() => {
    // Read initial mode
    const saved = localStorage.getItem('home-mode')
    if (saved === 'ibadah' || saved === 'komuniti') setMode(saved)

    // Listen for changes dispatched by HomeModeSwitcher
    const handler = (e: Event) => {
      const m = (e as CustomEvent<'komuniti' | 'ibadah'>).detail
      if (m === 'ibadah' || m === 'komuniti') setMode(m)
    }
    window.addEventListener('home-mode-change', handler)
    return () => window.removeEventListener('home-mode-change', handler)
  }, [])

  const items = mode === 'ibadah' ? bottomNavIbadah : bottomNavKomuniti

  const isActive = (href: string) =>
    href === '/home' ? pathname === '/home' || pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      className="md:hidden fixed z-50"
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '360px',
      }}
    >
      <div
        className="bottom-nav-pill"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: '64px',
          borderRadius: '100px',
          background: 'rgba(6,10,8,0.88)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.11)',
          boxShadow: [
            '0 16px 48px rgba(0,0,0,0.60)',
            '0 1px 0 rgba(255,255,255,0.07) inset',
          ].join(', '),
          padding: '0 4px',
          transition: 'all 0.25s ease',
        }}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                position: 'relative',
                padding: '8px 0',
                WebkitTapHighlightColor: 'transparent',
                textDecoration: 'none',
                minHeight: '44px',
              }}
            >
              {active && (
                <span className="bottom-nav-active-glow" style={{
                  position: 'absolute',
                  inset: '4px 4px',
                  borderRadius: '100px',
                  background: 'rgba(82,201,122,0.15)',
                  border: '1px solid rgba(82,201,122,0.20)',
                }} />
              )}
              <Icon
                className={`bottom-nav-icon${active ? ' active' : ''}`}
                style={{
                  width: '20px',
                  height: '20px',
                  color: active ? 'var(--primary)' : 'rgba(255,255,255,0.48)',
                  filter: active ? 'drop-shadow(0 0 5px rgba(34,197,94,0.50))' : 'none',
                  transition: 'color 0.18s ease, filter 0.18s ease',
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0,
                }}
                strokeWidth={active ? 2.2 : 1.6}
              />
              <span
                className={`bottom-nav-label${active ? ' active' : ''}`}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '11px',
                  letterSpacing: '0.01em',
                  color: active ? 'var(--primary)' : 'rgba(255,255,255,0.48)',
                  fontWeight: active ? 700 : 500,
                  transition: 'color 0.18s ease',
                  position: 'relative',
                  zIndex: 1,
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const adminNavItems = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/admin/announcements', icon: Megaphone,       label: 'Pengumuman' },
  { href: '/admin/programs',      icon: Calendar,        label: 'Program'    },
  { href: '/admin/kelas',         icon: BookOpen,        label: 'Kelas'      },
  { href: '/admin/keperluan',     icon: Heart,           label: 'Keperluan'  },
  { href: '/admin/mosque',        icon: Building2,       label: 'Info Masjid'},
  { href: '/admin/imam',          icon: PersonStanding,  label: 'Imam'       },
  { href: '/admin/bilal',         icon: Mic,             label: 'Bilal'      },
  { href: '/admin/live',          icon: Radio,           label: 'Live'       },
  { href: '/admin/pengguna',      icon: Users,           label: 'Pengguna',  superadminOnly: true },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, profile, isAJK, isSuperAdmin } = useUser()
  const { active: activeMosqueInfo } = useActiveMosque()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [activeLive, setActiveLive] = useState<string | null>(null)
  const liveChannelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const { theme, setTheme } = useTheme()
  const { size: textSize, changeSize } = useTextSize()
  const [themeMounted, setThemeMounted] = useState(false)

  useEffect(() => {
    setThemeMounted(true)
    const stored = localStorage.getItem('reduce-motion') === 'true'
    setReduceMotion(stored)
    if (stored) document.documentElement.setAttribute('data-reduce-motion', 'true')
  }, [])

  function toggleReduceMotion() {
    const next = !reduceMotion
    setReduceMotion(next)
    localStorage.setItem('reduce-motion', String(next))
    if (next) document.documentElement.setAttribute('data-reduce-motion', 'true')
    else document.documentElement.removeAttribute('data-reduce-motion')
  }

  const initials = useMemo(
    () => (profile?.full_name || user?.email || 'U').charAt(0).toUpperCase(),
    [profile?.full_name, user?.email]
  )
  const visibleAdminNav = useMemo(
    () => adminNavItems.filter(i => !i.superadminOnly || isSuperAdmin),
    [isSuperAdmin]
  )

  useEffect(() => { setDrawerOpen(false); setAdminOpen(false) }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!toolsOpen) return
    const handler = () => setToolsOpen(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [toolsOpen])

  useEffect(() => {
    const supabase = createClient()
    const fetchLive = () =>
      supabase.from('live_streams').select('title').eq('is_active', true).limit(1).single()
        .then(({ data }) => setActiveLive(data?.title ?? null))
    fetchLive()
    liveChannelRef.current = supabase
      .channel('navbar_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, fetchLive)
      .subscribe()
    return () => { if (liveChannelRef.current) supabase.removeChannel(liveChannelRef.current) }
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const isToolsPageActive = toolsNav.some(item => isActive(item.href))

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <header
        className="top-nav-header hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center px-6 lg:px-10 border-b transition-all duration-200"
        style={{
          background: scrolled ? 'rgba(8,9,14,0.92)' : 'var(--surface)',
          borderColor: 'var(--border)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center mr-10 flex-shrink-0">
          <SajdaLogo height={40} />
        </Link>

        {/* Primary nav — centered links, minimal */}
        <nav className="flex items-center gap-1 flex-1">
          {primaryNav.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg transition-all duration-150',
                  active
                    ? 'font-semibold'
                    : 'font-normal hover:bg-[rgba(45,106,79,0.05)]'
                )}
                style={{
                  fontFamily: 'var(--font-jakarta)',
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                {item.label}
              </Link>
            )
          })}

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setToolsOpen(p => !p) }}
              className={cn(
                'flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-all',
                toolsOpen || isToolsPageActive
                  ? 'bg-[rgba(45,106,79,0.06)] text-[var(--primary)]'
                  : 'hover:bg-[rgba(45,106,79,0.05)]'
              )}
              style={{ fontFamily: 'var(--font-jakarta)', color: toolsOpen || isToolsPageActive ? undefined : 'var(--text-secondary)' }}
            >
              Lagi
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', toolsOpen && 'rotate-180')} />
            </button>

            {toolsOpen && (
              <div
                className="absolute top-full left-0 mt-2 border rounded-2xl shadow-lg overflow-hidden z-50 animate-fadeIn"
                style={{
                  background: 'var(--surface)', borderColor: 'var(--border)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.50)',
                  width: '220px',
                  padding: '6px',
                }}
                onClick={e => e.stopPropagation()}
              >
                {toolsCategories.map((cat, ci) => (
                  <div key={cat.label}>
                    {ci > 0 && <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />}
                    <p style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                      letterSpacing: '0.16em', textTransform: 'uppercase',
                      color: 'var(--text-dim)', padding: '6px 10px 4px',
                    }}>
                      {cat.label}
                    </p>
                    {cat.items.map(item => {
                      const active = isActive(item.href)
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors hover:bg-[rgba(45,106,79,0.06)]"
                          onClick={() => setToolsOpen(false)}
                        >
                          <Icon
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: active ? 'var(--primary)' : 'var(--text-dim)' }}
                          />
                          <span className="text-sm" style={{
                            color: active ? 'var(--primary)' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-jakarta)', fontWeight: active ? 600 : 400,
                          }}>
                            {item.label}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right — theme toggle + notifications + admin badge + auth */}
        <div className="flex items-center gap-2">
          {activeLive && (
            <Link
              href="/live"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 11px', borderRadius: '100px', textDecoration: 'none',
                background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)',
              }}
            >
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background: '#EF4444', animation: 'breathe 1.2s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                fontWeight: 700, color: '#EF4444', letterSpacing: '0.1em',
              }}>
                LIVE
              </span>
            </Link>
          )}
          <ThemeToggle />
          <NotificationPanel />

          {isAJK && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
              style={{
                fontFamily: 'var(--font-jakarta)',
                borderColor: 'rgba(156,122,60,0.28)',
                color: 'var(--gold)',
                background: 'rgba(156,122,60,0.05)',
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all hover:border-[rgba(45,106,79,0.3)] hover:bg-[rgba(45,106,79,0.03)]"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'var(--primary)' }}
              >
                {initials}
              </div>
              <span className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {profile?.full_name?.split(' ')[0] ?? 'Profil'}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-semibold rounded-full text-white transition-all hover:opacity-90 active:scale-95"
              style={{ fontFamily: 'var(--font-jakarta)', background: 'var(--primary)' }}
            >
              Log Masuk
            </Link>
          )}
        </div>
      </header>

      {/* ── MOBILE TOP BAR ── */}
      <header
        className="top-nav-header md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b transition-all duration-200"
        style={{
          background: scrolled ? 'rgba(8,9,14,0.92)' : 'var(--surface)',
          borderColor: 'var(--border)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        {/* Logo */}
        <Link href="/home" className="flex items-center">
          <SajdaLogo height={36} />
        </Link>

        {/* Active mosque pill — tap to switch */}
        {activeMosqueInfo && (
          <Link
            href="/masjid-saya"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px 5px 8px', borderRadius: '100px',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.18)',
              textDecoration: 'none',
              maxWidth: '140px',
              overflow: 'hidden',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              background: 'rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Building2 style={{ width: 10, height: 10, color: '#22C55E' }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '11px', fontWeight: 700,
              color: '#22C55E',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {activeMosqueInfo.name.replace(/^(Masjid|Surau|Musolla)\s/i, '')}
            </span>
            <ChevronDown style={{ width: 10, height: 10, color: '#22C55E', flexShrink: 0 }} />
          </Link>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {activeLive && (
            <Link
              href="/live"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '4px 9px', borderRadius: '100px', textDecoration: 'none',
                background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)',
              }}
            >
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                background: '#EF4444', animation: 'breathe 1.2s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                fontWeight: 700, color: '#EF4444', letterSpacing: '0.08em',
              }}>
                LIVE
              </span>
            </Link>
          )}
          {isAJK && (
            <button
              onClick={() => setAdminOpen(p => !p)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border"
              style={{
                borderColor: adminOpen ? 'rgba(156,122,60,0.5)' : 'rgba(156,122,60,0.28)',
                background: adminOpen ? 'rgba(156,122,60,0.12)' : 'rgba(156,122,60,0.05)',
              }}
              aria-label="Panel admin"
            >
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            </button>
          )}

          <NotificationPanel />

          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', background: 'transparent' }}
            aria-label="Lebih banyak"
          >
            <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>

          {user ? (
            <Link href="/profile">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'var(--primary)' }}
              >
                {initials}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center px-3 h-8 rounded-full text-xs font-semibold text-white"
              style={{ background: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}
            >
              Masuk
            </Link>
          )}
        </div>
      </header>

      {/* ── MOBILE TOOLS DRAWER ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[60] animate-fadeIn">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setDrawerOpen(false)}
          />

          <div
            className="absolute top-0 right-0 bottom-0 w-72 flex flex-col shadow-2xl"
            style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center">
                <SajdaLogo height={22} />
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-colors"
              >
                <X className="w-4 h-4" style={{ color: 'var(--text-dim)' }} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">

              {/* Tools — flat list per category */}
              {toolsCategories.map((cat, ci) => (
                <div key={cat.label} className={ci < toolsCategories.length - 1 ? 'mb-2' : ''}>
                  <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-1 px-2 pt-2"
                    style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                    {cat.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {cat.items.map(item => {
                      const active = isActive(item.href)
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '9px 10px', borderRadius: '10px', textDecoration: 'none',
                            background: active ? 'var(--primary-pale)' : 'transparent',
                            transition: 'all 0.12s',
                          }}
                        >
                          <Icon style={{
                            width: '15px', height: '15px', flexShrink: 0,
                            color: active ? 'var(--primary)' : 'var(--text-dim)',
                          }} />
                          <span style={{
                            fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                            fontWeight: active ? 600 : 400,
                            color: active ? 'var(--primary)' : 'var(--text-secondary)',
                          }}>
                            {item.label}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                  {ci < toolsCategories.length - 1 && (
                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0 0' }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── SETTINGS SECTION ── */}
            <div style={{
              margin: '16px 0 8px',
              borderRadius: '16px',
              background: 'var(--void)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              {/* Section header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '11px 14px 10px',
                borderBottom: '1px solid var(--border)',
              }}>
                <Settings style={{ width: '12px', height: '12px', color: 'var(--primary)' }} />
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)',
                }}>
                  Tetapan
                </span>
              </div>

              {/* Theme row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    background: 'var(--elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {themeMounted && theme === 'dark'
                      ? <Moon style={{ width: '13px', height: '13px', color: 'var(--primary)' }} />
                      : <Sun  style={{ width: '13px', height: '13px', color: 'var(--primary)' }} />}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Tema Paparan</p>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
                      {!themeMounted ? '—' : theme === 'dark' ? 'Mod gelap aktif' : 'Mod cerah aktif'}
                    </p>
                  </div>
                </div>
                {themeMounted && (
                  <div style={{
                    display: 'flex', gap: '3px', padding: '3px',
                    background: 'var(--elevated)', borderRadius: '10px',
                    border: '1px solid var(--border)',
                  }}>
                    {(['light', 'dark'] as const).map(t => (
                      <button key={t} onClick={() => setTheme(t)} style={{
                        padding: '4px 9px', borderRadius: '7px',
                        fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-jakarta)',
                        cursor: 'pointer', border: 'none',
                        background: theme === t ? 'var(--primary)' : 'transparent',
                        color: theme === t ? '#04080A' : 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}>
                        {t === 'dark' ? 'Gelap' : 'Cerah'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text size row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    background: 'var(--elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Type style={{ width: '13px', height: '13px', color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Saiz Teks</p>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>
                      {textSize === 'small' ? 'Kecil' : textSize === 'large' ? 'Besar' : 'Biasa'}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex', gap: '3px', padding: '3px',
                  background: 'var(--elevated)', borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}>
                  {([
                    { key: 'small'  as TextSize, label: 'A',  fs: '9px'  },
                    { key: 'regular'as TextSize, label: 'A',  fs: '12px' },
                    { key: 'large'  as TextSize, label: 'A',  fs: '15px' },
                  ]).map(({ key, label, fs }) => (
                    <button key={key} onClick={() => changeSize(key)} style={{
                      width: '30px', height: '26px', borderRadius: '7px', cursor: 'pointer',
                      border: 'none',
                      background: textSize === key ? 'var(--primary)' : 'transparent',
                      color: textSize === key ? '#04080A' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: fs,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduce motion row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    background: 'var(--elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {reduceMotion
                      ? <ZapOff style={{ width: '13px', height: '13px', color: 'var(--primary)' }} />
                      : <Zap    style={{ width: '13px', height: '13px', color: 'var(--primary)' }} />}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Kurang Animasi</p>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)', margin: 0 }}>Sesuai untuk warga emas</p>
                  </div>
                </div>
                {/* iOS-style toggle */}
                <button onClick={toggleReduceMotion} style={{
                  width: '42px', height: '24px', borderRadius: '100px', cursor: 'pointer',
                  border: 'none', position: 'relative', flexShrink: 0, padding: 0,
                  background: reduceMotion
                    ? 'var(--primary)'
                    : 'var(--elevated)',
                  boxShadow: reduceMotion ? '0 0 0 1px var(--primary)' : '0 0 0 1px var(--border)',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}>
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: reduceMotion ? '21px' : '3px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: reduceMotion ? '#04080A' : 'var(--text-secondary)',
                    transition: 'left 0.2s, background 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  }} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {user ? (
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors hover:border-[rgba(45,106,79,0.2)]" style={{ borderColor: 'var(--border)', background: 'var(--void)' }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--primary)' }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-jakarta)' }}>
                      {profile?.full_name ?? 'Profil Saya'}
                    </p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-jakarta)' }}>
                      {profile?.role ?? 'Jemaah'}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center w-full py-3 rounded-full text-sm font-semibold text-white"
                  style={{ background: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}
                >
                  Log Masuk
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN PANEL SHEET (mobile) — bottom sheet ── */}
      {adminOpen && isAJK && (
        <div className="md:hidden fixed inset-0 z-[60]" style={{ animation: 'fadeIn 0.2s ease both' }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
            onClick={() => setAdminOpen(false)}
          />

          {/* Bottom sheet */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              borderTop: '1px solid rgba(156,122,60,0.2)',
              boxShadow: '0 -24px 60px rgba(0,0,0,0.6)',
              animation: 'sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) both',
              overflow: 'hidden',
            }}
          >
            {/* Gold accent line */}
            <div style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(156,122,60,0.6) 30%, rgba(245,158,11,0.8) 50%, rgba(156,122,60,0.6) 70%, transparent 100%)',
            }} />

            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '4px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '100px', background: 'var(--border)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
                  <ShieldCheck style={{ width: '13px', height: '13px', color: 'var(--gold)' }} />
                  <span style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)',
                  }}>
                    Panel Admin
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                  color: 'var(--text-dim)', margin: 0,
                }}>
                  {profile?.full_name?.split(' ')[0] ?? 'Admin'} · {profile?.role === 'superadmin' ? 'Superadmin' : 'AJK'}
                </p>
              </div>
              <button
                onClick={() => setAdminOpen(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--elevated)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '13px', height: '13px', color: 'var(--text-dim)' }} />
              </button>
            </div>

            {/* Nav tiles — 2-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px 16px 20px' }}>
              {visibleAdminNav.map((item, i) => {
                const Icon = item.icon
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', borderRadius: '14px', textDecoration: 'none',
                      background: active
                        ? 'linear-gradient(135deg, rgba(156,122,60,0.18) 0%, rgba(245,158,11,0.08) 100%)'
                        : 'var(--elevated)',
                      border: `1px solid ${active ? 'rgba(156,122,60,0.4)' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                      animation: `fabItem 0.2s ease ${i * 0.03}s both`,
                    }}
                  >
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                      background: active
                        ? 'linear-gradient(135deg, rgba(156,122,60,0.35) 0%, rgba(245,158,11,0.2) 100%)'
                        : 'var(--surface)',
                      border: `1px solid ${active ? 'rgba(156,122,60,0.3)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{
                        width: '15px', height: '15px',
                        color: active ? '#F59E0B' : 'var(--text-secondary)',
                      }} />
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                      color: active ? '#F59E0B' : 'var(--text-primary)',
                      lineHeight: 1.2,
                    }}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* Safe area */}
            <div style={{ height: 'env(safe-area-inset-bottom, 12px)' }} />
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <BottomNav />
    </>
  )
}
