'use client'

// UX RATIONALE: Navigation is the skeleton of the app — get it wrong and every
// page feels wrong. Key decisions here:
//
// MOBILE BOTTOM NAV: Full-width bar (not floating pill).
//   The previous pill nav looked great in Dribbble but reduced effective tap target
//   by ~40% and felt unfamiliar to Pak Cik/Mak Cik users who expect iOS/Android-style
//   bottom bars. Full-width bar also grounds the UI — users know where nav is.
//
// 5-TAB IA: Utama | Program | Ibadah | Komuniti | Profil
//   Removes the old komuniti/ibadah mode-toggle anti-pattern.
//   Users shouldn't need to switch the nav to access core features.
//   "Ibadah" groups solat tracker, tasbih, wirid, qiblat — one tap to any.
//   "Komuniti" groups keperluan, janaiz, announcements — one tap to any.
//
// MOBILE TOP BAR: Left | Center Switcher Pill | Right
//   Center mosque switcher borrowed from Slack workspace switcher — most tested
//   pattern for multi-context apps. Center thumb zone on a 375px phone.
//
// MOSQUE SWITCHER BOTTOM SHEET: Full-height sheet, not dropdown.
//   More surface area, easier to tap, mobile-native feel.

import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Home, Calendar, BookOpen, HandCoins, User, ShieldCheck,
  X, BookMarked, Compass, Clock, Search, Building2,
  ChevronDown, Moon, CheckSquare, Sun, RotateCcw, Users,
  LayoutDashboard, Megaphone, Zap, ZapOff, Radio, Mic, PersonStanding,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { useActiveMosque } from '@/hooks/useActiveMosque'
import sajdaLogo from '@/images/sajda-logo.png'
import { NotificationPanel } from '@/components/ui/NotificationPanel'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useTextSize } from '@/hooks/useTextSize'

// ── DESKTOP PRIMARY NAV ──────────────────────────────────────────────────────
const primaryNav = [
  { href: '/home',     label: 'Utama' },
  { href: '/program',  label: 'Program' },
  { href: '/keperluan',label: 'Komuniti' },
  { href: '/kelas',    label: 'Kelas' },
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
      { href: '/solat',   label: 'Jejak Solat',    icon: CheckSquare, desc: 'Rekod solat harian & streak' },
      { href: '/tasbih',  label: 'Tasbih & Zikir', icon: RotateCcw,   desc: '4 jenis zikir harian' },
      { href: '/wirid',   label: 'Wirid Harian',   icon: Sun,         desc: 'Wirid pagi & petang' },
      { href: '/hadis',   label: 'Hadis Harian',   icon: BookMarked,  desc: 'Hadis pilihan setiap hari' },
      { href: '/hijri',   label: 'Kalendar Hijri', icon: Moon,        desc: 'Kalendar Islam Malaysia' },
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

const toolsNav = toolsCategories.flatMap(c => c.items)

// ── MOBILE BOTTOM NAV: 5 PERMANENT TABS ──────────────────────────────────────
// UX RATIONALE: 5 is the proven ceiling for bottom nav (Apple HIG, Material You).
// Order: most-used first (Utama), grouped by user mental model not feature parity.
const bottomNav = [
  { href: '/home',      label: 'Utama',    Icon: Home },
  { href: '/program',   label: 'Program',  Icon: Calendar },
  { href: '/ibadah',    label: 'Ibadah',   Icon: Moon },
  { href: '/keperluan', label: 'Komuniti', Icon: Users },
  { href: '/profile',   label: 'Profil',   Icon: User },
]

// ── ADMIN NAV ────────────────────────────────────────────────────────────────
const adminNavItems = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/admin/announcements', icon: Megaphone,       label: 'Pengumuman'  },
  { href: '/admin/programs',      icon: Calendar,        label: 'Program'     },
  { href: '/admin/kelas',         icon: BookOpen,        label: 'Kelas'       },
  { href: '/admin/keperluan',     icon: Heart,           label: 'Keperluan'   },
  { href: '/admin/mosque',        icon: Building2,       label: 'Info Masjid' },
  { href: '/admin/imam',          icon: PersonStanding,  label: 'Imam'        },
  { href: '/admin/bilal',         icon: Mic,             label: 'Bilal'       },
  { href: '/admin/live',          icon: Radio,           label: 'Live'        },
  { href: '/admin/pengguna',      icon: Users,           label: 'Pengguna', superadminOnly: true },
]

// ── SAJDA LOGO ───────────────────────────────────────────────────────────────
function SajdaLogo({ height = 32 }: { height?: number }) {
  return (
    <Image
      src={sajdaLogo}
      alt="SAJDA"
      width={Math.round(height * 3.2)}
      height={height}
      className="object-contain sajda-logo"
    />
  )
}

// ── MOSQUE SWITCHER BOTTOM SHEET ─────────────────────────────────────────────
// UX RATIONALE: Bottom sheet is the mobile-native pattern for multi-choice selection.
// More surface area than a dropdown (easier to tap), dismissable by backdrop tap,
// swipeable handle signals dismissability to power users.
function MosqueSwitcherSheet({
  isOpen,
  onClose,
  activeMosque,
}: {
  isOpen: boolean
  onClose: () => void
  activeMosque: { name: string; slug: string } | null
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200]" onClick={onClose}>
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 animate-slideUp"
        style={{
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          borderTop: '1px solid var(--border-lit)',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{
            width: '40px', height: '4px', borderRadius: '2px',
            background: 'var(--text-dim)',
          }} />
        </div>

        {/* Title */}
        <p style={{
          fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)',
          fontSize: '16px', fontWeight: 700,
          color: 'var(--text-primary)',
          textAlign: 'center', padding: '8px 16px 16px',
        }}>
          Tukar Konteks
        </p>

        <div style={{ padding: '0 16px' }}>
          {/* SAJDA Home row */}
          <Link
            href="/home"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', borderRadius: '16px', textDecoration: 'none',
              background: !activeMosque ? 'rgba(45,215,113,0.08)' : 'transparent',
              border: !activeMosque ? '1px solid rgba(45,215,113,0.18)' : '1px solid transparent',
              marginBottom: '8px',
              minHeight: '64px',
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(45,215,113,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(45,215,113,0.30)',
            }}>
              <Building2 style={{ width: '20px', height: '20px', color: 'var(--accent, #2DD771)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-nunito, "Nunito", sans-serif)',
                fontSize: '15px', fontWeight: 700,
                color: 'var(--text-primary)', margin: 0,
              }}>
                SAJDA Home
              </p>
              <p style={{
                fontFamily: 'var(--font-nunito, "Nunito", sans-serif)',
                fontSize: '13px', fontWeight: 400,
                color: 'var(--text-muted)', margin: 0,
              }}>
                Semua masjid anda
              </p>
            </div>
            {!activeMosque && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="var(--accent,#2DD771)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </Link>

          {/* Divider */}
          <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{
              fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'var(--text-dim)',
              whiteSpace: 'nowrap',
            }}>
              Masjid Saya
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Active mosque (if any) */}
          {activeMosque && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', borderRadius: '16px',
              background: 'rgba(45,215,113,0.08)',
              border: '1px solid rgba(45,215,113,0.18)',
              minHeight: '64px',
              marginBottom: '8px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(45,215,113,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid rgba(45,215,113,0.25)',
              }}>
                <Building2 style={{ width: '18px', height: '18px', color: 'var(--accent,#2DD771)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                  fontSize: '15px', fontWeight: 700,
                  color: 'var(--text-primary)', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {activeMosque.name}
                </p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="var(--accent,#2DD771)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          {/* Add mosque */}
          <Link
            href="/senarai-masjid"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', borderRadius: '14px', textDecoration: 'none',
              border: '1.5px dashed var(--border-lit, rgba(45,215,113,0.18))',
              marginTop: '12px',
            }}
          >
            <span style={{ fontSize: '18px', color: 'var(--accent,#2DD771)' }}>+</span>
            <span style={{
              fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
              fontSize: '14px', fontWeight: 600,
              color: 'var(--accent,#2DD771)',
            }}>
              Ikut Masjid Baharu
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── MOBILE BOTTOM NAV: FULL-WIDTH BAR ────────────────────────────────────────
// UX RATIONALE: Full-width bar gives each tab 20% of screen width as tap area.
// At 375px that's 75px per tab — well above the 48px WCAG minimum.
// Fixed positioning + z-index 100 keeps it always accessible.
// Safe-area padding handles iPhone home indicator without hardcoding values.
function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/'
    // Ibadah tab catches all ibadah sub-routes
    if (href === '/ibadah') return pathname.startsWith('/ibadah') ||
      pathname.startsWith('/solat') || pathname.startsWith('/tasbih') ||
      pathname.startsWith('/wirid') || pathname.startsWith('/qiblat') ||
      pathname.startsWith('/hadis')
    // Komuniti tab catches keperluan, janaiz, etc.
    if (href === '/keperluan') return pathname.startsWith('/keperluan') ||
      pathname.startsWith('/janaiz') || pathname.startsWith('/halaqah') ||
      pathname.startsWith('/live') || pathname.startsWith('/cari-barang')
    return pathname.startsWith(href)
  }

  return (
    // UX RATIONALE: height = 64px (nav) + env(safe-area-inset-bottom) for iPhone X+
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(5,12,9,0.94)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid var(--border-lit, rgba(45,215,113,0.18))',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {bottomNav.map(({ href, label, Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              // UX RATIONALE: 64px height on each tab = comfortable tap target for arthritic fingers
              minHeight: '64px',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Active indicator — top hairline in accent color */}
            {active && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                right: '20%',
                height: '2px',
                borderRadius: '0 0 2px 2px',
                background: 'var(--accent, #2DD771)',
                boxShadow: '0 0 8px rgba(45,215,113,0.60)',
              }} />
            )}

            <Icon
              style={{
                width: '22px',
                height: '22px',
                color: active ? 'var(--accent, #2DD771)' : 'var(--text-dim)',
                filter: active ? 'drop-shadow(0 0 5px rgba(45,215,113,0.45))' : 'none',
                transition: 'color 0.15s ease, filter 0.15s ease',
                flexShrink: 0,
              }}
              strokeWidth={active ? 2.2 : 1.6}
            />

            {/* UX RATIONALE: Always show labels — "icon-only" nav fails elderly users
                who cannot recognise abstract icons. Labels add ~4px height, worth it. */}
            <span
              style={{
                fontFamily: 'var(--font-nunito, "Nunito", sans-serif)',
                fontSize: '10px',
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--accent, #2DD771)' : 'var(--text-dim)',
                lineHeight: 1,
                transition: 'color 0.15s ease',
              }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── MAIN NAVBAR COMPONENT ─────────────────────────────────────────────────────
export function Navbar() {
  const pathname = usePathname()
  const { user, profile, isAJK, isSuperAdmin } = useUser()
  const { active: activeMosqueInfo } = useActiveMosque()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [activeLive, setActiveLive] = useState<string | null>(null)
  const liveChannelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const { size: textSize, changeSize } = useTextSize()

  useEffect(() => {
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

  useEffect(() => { setDrawerOpen(false); setAdminOpen(false); setSwitcherOpen(false) }, [pathname])

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

  // Mosque display name (truncated for pill)
  const mosquePillName = activeMosqueInfo
    ? activeMosqueInfo.name.replace(/^(Masjid|Surau|Musolla)\s/i, '')
    : 'SAJDA'

  return (
    <>
      {/* ════════════════════════════════════════
          DESKTOP NAVBAR
          UX RATIONALE: Desktop users have more screen real estate.
          Full horizontal nav with dropdown for overflow items.
          Top-border indicator on active items — subtle but clear.
      ════════════════════════════════════════ */}
      <header
        className="top-nav-header hidden md:flex fixed top-0 left-0 right-0 z-50 items-center px-6 lg:px-10 border-b transition-all duration-200"
        style={{
          height: '60px',
          background: scrolled ? 'rgba(5,12,9,0.92)' : 'rgba(5,12,9,0.80)',
          borderColor: 'var(--border-lit)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.30)' : 'none',
          transition: 'background 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        {/* Logo */}
        <Link href="/home" className="flex items-center mr-10 flex-shrink-0">
          <SajdaLogo height={38} />
        </Link>

        {/* Primary nav */}
        <nav className="flex items-center gap-1 flex-1">
          {primaryNav.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-nunito, "Nunito", sans-serif)',
                  fontSize: '15px',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--accent, #2DD771)' : 'var(--text-secondary)',
                  height: '60px',
                  display: 'inline-flex', alignItems: 'center',
                  padding: '0 12px',
                  borderBottom: active ? '2px solid var(--accent, #2DD771)' : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s, border-color 0.15s',
                  letterSpacing: '0.01em',
                }}
              >
                {item.label}
              </Link>
            )
          })}

          {/* Lagi dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setToolsOpen(p => !p) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px',
                borderRadius: '10px',
                fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                fontSize: '15px', fontWeight: 500,
                color: toolsOpen || isToolsPageActive ? 'var(--accent,#2DD771)' : 'var(--text-secondary)',
                background: toolsOpen ? 'rgba(45,215,113,0.06)' : 'transparent',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Lagi
              <ChevronDown style={{ width: '14px', height: '14px', transition: 'transform 0.2s', transform: toolsOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {toolsOpen && (
              <div
                className="absolute top-full left-0 mt-2 rounded-2xl shadow-lg overflow-hidden z-50 animate-fadeIn"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-lit)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.50)',
                  width: '240px',
                  padding: '8px',
                }}
                onClick={e => e.stopPropagation()}
              >
                {toolsCategories.map((cat, ci) => (
                  <div key={cat.label}>
                    {ci > 0 && <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />}
                    <p style={{
                      fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: 'var(--text-dim)',
                      padding: '6px 10px 4px',
                    }}>
                      {cat.label}
                    </p>
                    {cat.items.map(item => {
                      const ItemIcon = item.icon
                      const active = isActive(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setToolsOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 10px', borderRadius: '10px',
                            textDecoration: 'none',
                            background: active ? 'rgba(45,215,113,0.08)' : 'transparent',
                            transition: 'background 0.12s',
                          }}
                          className="hover:bg-[rgba(45,215,113,0.05)]"
                        >
                          <ItemIcon style={{ width: '14px', height: '14px', flexShrink: 0, color: active ? 'var(--accent,#2DD771)' : 'var(--text-dim)' }} />
                          <span style={{
                            fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                            fontSize: '13px', fontWeight: active ? 600 : 400,
                            color: active ? 'var(--accent,#2DD771)' : 'var(--text-secondary)',
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

        {/* Right */}
        <div className="flex items-center gap-2">
          {activeLive && (
            <Link
              href="/live"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 11px', borderRadius: '100px', textDecoration: 'none',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.28)',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F87171', animation: 'breathe 1.2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-nunito,"Nunito",sans-serif)', fontSize: '12px', fontWeight: 800, color: '#F87171', letterSpacing: '0.10em' }}>LIVE</span>
            </Link>
          )}

          <ThemeToggle />
          <NotificationPanel />

          {isAJK && (
            <Link
              href="/admin"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '10px', textDecoration: 'none',
                fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                fontSize: '12px', fontWeight: 700,
                color: 'var(--gold, #C9A84C)',
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.22)',
              }}
            >
              <ShieldCheck style={{ width: '14px', height: '14px' }} />
              Admin
            </Link>
          )}

          {user ? (
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                fontSize: '14px', fontWeight: 700, color: '#050C09',
                background: 'var(--accent, #2DD771)',
                flexShrink: 0,
              }}>
                {initials}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                padding: '8px 20px', borderRadius: '100px', textDecoration: 'none',
                fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                fontSize: '14px', fontWeight: 700,
                color: '#050C09',
                background: 'linear-gradient(135deg, #2DD771 0%, #1A6B3A 100%)',
                boxShadow: '0 4px 16px rgba(45,215,113,0.20)',
              }}
            >
              Log Masuk
            </Link>
          )}
        </div>
      </header>

      {/* ════════════════════════════════════════
          MOBILE TOP BAR
          UX RATIONALE: 3-slot layout — left/center/right.
          CENTER: mosque switcher pill — primary context indicator.
          Always visible, always accessible. Thumb zone on 375px screen.
          Scrolled state adds stronger blur for content separation.
      ════════════════════════════════════════ */}
      <header
        className="top-nav-header md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 border-b"
        style={{
          height: '56px',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          background: scrolled ? 'rgba(5,12,9,0.94)' : 'rgba(5,12,9,0.86)',
          borderColor: 'var(--border-lit, rgba(45,215,113,0.18))',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.30)' : 'none',
          transition: 'background 0.25s, box-shadow 0.25s',
        }}
      >
        {/* LEFT: SAJDA logo or back button */}
        <Link href="/home" style={{ flexShrink: 0 }}>
          <SajdaLogo height={30} />
        </Link>

        {/* CENTER: Mosque switcher pill
            UX RATIONALE: Pill format makes it clearly tappable (not just text).
            Chevron icon signals there's more behind the tap.
            Max 18 chars prevents overflow on 375px. */}
        <button
          onClick={() => setSwitcherOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px 6px 8px', borderRadius: '100px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid var(--border-lit, rgba(45,215,113,0.18))',
            cursor: 'pointer',
            maxWidth: '180px',
            overflow: 'hidden',
            transition: 'background 0.15s, transform 0.12s',
            WebkitTapHighlightColor: 'transparent',
          }}
          className="active:scale-[0.97] active:bg-[rgba(255,255,255,0.11)]"
          aria-label="Tukar masjid"
        >
          {/* Mosque icon */}
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(45,215,113,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(45,215,113,0.22)',
          }}>
            <Building2 style={{ width: '11px', height: '11px', color: 'var(--accent,#2DD771)' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
            fontSize: '13px', fontWeight: 700,
            color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '120px',
          }}>
            {mosquePillName}
          </span>
          <ChevronDown style={{ width: '12px', height: '12px', color: 'var(--text-muted)', flexShrink: 0 }} />
        </button>

        {/* RIGHT: Live badge + admin + notifications + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {activeLive && (
            <Link
              href="/live"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 9px', borderRadius: '100px', textDecoration: 'none',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.28)',
              }}
            >
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F87171', animation: 'breathe 1.2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-nunito,"Nunito",sans-serif)', fontSize: '11px', fontWeight: 800, color: '#F87171', letterSpacing: '0.10em' }}>LIVE</span>
            </Link>
          )}

          {isAJK && (
            <button
              onClick={() => setAdminOpen(p => !p)}
              style={{
                width: '34px', height: '34px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: adminOpen ? '1px solid rgba(201,168,76,0.45)' : '1px solid rgba(201,168,76,0.22)',
                background: adminOpen ? 'rgba(201,168,76,0.10)' : 'rgba(201,168,76,0.04)',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Panel admin"
            >
              <ShieldCheck style={{ width: '16px', height: '16px', color: 'var(--gold,#C9A84C)' }} />
            </button>
          )}

          <NotificationPanel />

          {user ? (
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                fontSize: '13px', fontWeight: 800, color: '#050C09',
                background: 'var(--accent, #2DD771)',
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}>
                {initials}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '6px 14px', borderRadius: '100px', textDecoration: 'none',
                fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                fontSize: '13px', fontWeight: 700, color: '#050C09',
                background: 'var(--accent, #2DD771)',
              }}
            >
              Masuk
            </Link>
          )}
        </div>
      </header>

      {/* ── MOBILE ADMIN PANEL ── */}
      {adminOpen && isAJK && (
        <div
          className="md:hidden fixed inset-0 z-[100]"
          onClick={() => setAdminOpen(false)}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
          <div
            className="absolute top-14 right-4 rounded-2xl shadow-xl overflow-hidden animate-slideDown"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-lit)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.50)',
              width: '200px',
              padding: '8px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{
              fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'var(--gold,#C9A84C)',
              padding: '4px 8px 8px',
            }}>
              Panel Admin
            </p>
            {visibleAdminNav.map(item => {
              const ItemIcon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setAdminOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '10px', textDecoration: 'none',
                    background: active ? 'rgba(45,215,113,0.08)' : 'transparent',
                    transition: 'background 0.12s',
                  }}
                  className="hover:bg-[rgba(45,215,113,0.05)]"
                >
                  <ItemIcon style={{ width: '14px', height: '14px', flexShrink: 0, color: active ? 'var(--accent,#2DD771)' : 'var(--text-dim)' }} />
                  <span style={{
                    fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                    fontSize: '13px', fontWeight: active ? 600 : 400,
                    color: active ? 'var(--accent,#2DD771)' : 'var(--text-secondary)',
                  }}>
                    {item.label}
                  </span>
                </Link>
              )
            })}

            {/* Text size row */}
            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
              <span style={{ fontFamily: 'var(--font-nunito,"Nunito",sans-serif)', fontSize: '12px', color: 'var(--text-muted)', flex: 1 }}>Saiz Teks</span>
              {(['small', 'regular', 'large'] as const).map((s, idx) => (
                <button
                  key={s}
                  onClick={() => changeSize(s)}
                  style={{
                    padding: '3px 9px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    background: textSize === s ? 'rgba(45,215,113,0.12)' : 'transparent',
                    color: textSize === s ? 'var(--accent,#2DD771)' : 'var(--text-muted)',
                    border: textSize === s ? '1px solid rgba(45,215,113,0.22)' : '1px solid transparent',
                    transition: 'all 0.12s',
                  }}
                >
                  {idx === 0 ? 'S' : idx === 1 ? 'M' : 'L'}
                </button>
              ))}
            </div>

            {/* Reduce motion */}
            <button
              onClick={toggleReduceMotion}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                padding: '8px 10px', borderRadius: '10px', cursor: 'pointer',
                background: 'transparent', border: 'none', transition: 'background 0.12s',
              }}
              className="hover:bg-[rgba(45,215,113,0.05)]"
            >
              {reduceMotion
                ? <ZapOff style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                : <Zap style={{ width: '14px', height: '14px', color: 'var(--accent,#2DD771)' }} />
              }
              <span style={{
                fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                fontSize: '13px', fontWeight: 400,
                color: 'var(--text-secondary)',
              }}>
                {reduceMotion ? 'Aktifkan Animasi' : 'Kurangkan Animasi'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── MOBILE TOOLS DRAWER ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[100] animate-fadeIn">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} onClick={() => setDrawerOpen(false)} />
          <div
            className="absolute top-0 right-0 bottom-0 w-72 flex flex-col shadow-2xl"
            style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border-lit)' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <SajdaLogo height={24} />
              <button onClick={() => setDrawerOpen(false)} style={{ padding: '6px', cursor: 'pointer', background: 'none', border: 'none' }}>
                <X style={{ width: '16px', height: '16px', color: 'var(--text-dim)' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {toolsCategories.map((cat, ci) => (
                <div key={cat.label} style={{ marginBottom: ci < toolsCategories.length - 1 ? '8px' : 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: 'var(--text-dim)',
                    padding: '8px 8px 4px',
                  }}>
                    {cat.label}
                  </p>
                  {cat.items.map(item => {
                    const active = isActive(item.href)
                    const ItemIcon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 10px', borderRadius: '12px', textDecoration: 'none',
                          background: active ? 'rgba(45,215,113,0.08)' : 'transparent',
                          transition: 'background 0.12s',
                        }}
                        className="hover:bg-[rgba(45,215,113,0.05)]"
                      >
                        <ItemIcon style={{ width: '16px', height: '16px', flexShrink: 0, color: active ? 'var(--accent,#2DD771)' : 'var(--text-dim)' }} />
                        <span style={{
                          fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                          fontSize: '14px', fontWeight: active ? 600 : 400,
                          color: active ? 'var(--accent,#2DD771)' : 'var(--text-secondary)',
                        }}>
                          {item.label}
                        </span>
                      </Link>
                    )
                  })}
                  {ci < toolsCategories.length - 1 && (
                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MOSQUE SWITCHER BOTTOM SHEET ── */}
      <MosqueSwitcherSheet
        isOpen={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        activeMosque={activeMosqueInfo}
      />

      {/* ── MOBILE BOTTOM NAV ── */}
      <BottomNav />
    </>
  )
}
