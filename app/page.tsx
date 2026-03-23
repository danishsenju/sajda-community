export const revalidate = 30

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-server'
import {
  Heart, Calendar, BookOpen, BookMarked,
  Compass, Clock, Search, Pin, ArrowRight, MapPin, Sparkles, Moon,
  CheckSquare, Sun, RotateCcw, ChevronRight,
} from 'lucide-react'
import { PersonStanding } from 'lucide-react'
import { HomeHero } from '@/components/ui/HomeHero'
import { GreetingBanner } from '@/components/ui/GreetingBanner'
import kdLogo from '@/images/kdlogo.png'

/* ── Mobile quick-access groups — only tools NOT in bottom nav ── */
const mobileGroups = [
  {
    label: 'Ibadah Harian',
    items: [
      { href: '/solat',  Icon: CheckSquare, label: 'Jejak Solat', color: '#22C55E', glow: 'rgba(34,197,94,0.18)' },
      { href: '/tasbih', Icon: RotateCcw,   label: 'Tasbih',      color: '#10B981', glow: 'rgba(16,185,129,0.18)' },
      { href: '/wirid',  Icon: Sun,         label: 'Wirid',        color: '#14B8A6', glow: 'rgba(20,184,166,0.18)' },
      { href: '/hadis',  Icon: BookMarked,  label: 'Hadis',        color: '#6EE7B7', glow: 'rgba(110,231,183,0.18)' },
    ],
  },
  {
    label: 'Alat & Info',
    items: [
      { href: '/qiblat',     Icon: Compass,   label: 'Qiblat',  color: '#A78BFA', glow: 'rgba(167,139,250,0.18)' },
      { href: '/buka-puasa', Icon: Clock,     label: 'Berbuka', color: '#38BDF8', glow: 'rgba(56,189,248,0.18)' },
      { href: '/hijri',      Icon: Moon,      label: 'Hijri',   color: '#C084FC', glow: 'rgba(192,132,252,0.18)' },
      { href: '/janaiz',     Icon: Heart,     label: 'Janaiz',  color: '#94A3B8', glow: 'rgba(148,163,184,0.18)' },
    ],
  },
]

/* ── Desktop pill strip ── */
const quickAccess = [
  { href: '/keperluan',   icon: Heart,          label: 'Keperluan',      color: '#DC2626', bg: '#FEF2F2' },
  { href: '/program',     icon: Calendar,       label: 'Program',        color: '#D97706', bg: '#FFFBEB' },
  { href: '/kelas',       icon: BookOpen,       label: 'Kelas',          color: '#2563EB', bg: '#EFF6FF' },
  { href: '/jadual-imam', icon: PersonStanding, label: 'Jadual Imam',    color: '#0D9488', bg: '#F0FDFA' },
  { href: '/hadis',       icon: BookMarked,     label: 'Hadis Harian',   color: '#2D6A4F', bg: '#E8F5EE' },
  { href: '/solat',       icon: CheckSquare,    label: 'Jejak Solat',    color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  { href: '/tasbih',      icon: RotateCcw,      label: 'Tasbih',         color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
  { href: '/wirid',       icon: Sun,            label: 'Wirid Harian',   color: '#15803D', bg: 'rgba(21,128,61,0.08)' },
  { href: '/tazkirah',    icon: Sparkles,       label: 'Tazkirah',       color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  { href: '/hijri',       icon: Moon,           label: 'Kalendar Hijri', color: '#8B5CF6', bg: '#F5F3FF' },
  { href: '/janaiz',      icon: Heart,          label: 'Papan Janaiz',   color: '#6B7280', bg: '#F9FAFB' },
  { href: '/qiblat',      icon: Compass,        label: 'Qiblat',         color: '#7C3AED', bg: '#F5F3FF' },
  { href: '/buka-puasa',  icon: Clock,          label: 'Waktu Berbuka',  color: '#0891B2', bg: '#ECFEFF' },
  { href: '/cari-barang', icon: Search,         label: 'Cari Barang',    color: '#059669', bg: '#ECFDF5' },
]

const catColors: Record<string, string> = {
  kecemasan: '#F87171', ramadan: '#FBBF24', kewangan: '#60A5FA', umum: '#22C55E',
}
const catLabel: Record<string, string> = {
  umum: 'Umum', kecemasan: 'Kecemasan', ramadan: 'Ramadan', kewangan: 'Kewangan',
}
const catProgramColors: Record<string, { bg: string; text: string; label: string }> = {
  solat:         { bg: '#1A4731', text: '#ffffff', label: 'Solat' },
  kebajikan:     { bg: '#4A3020', text: '#ffffff', label: 'Kebajikan' },
  ramadan:       { bg: '#7A4A10', text: '#ffffff', label: 'Ramadan' },
  gotong_royong: { bg: '#2A4A3A', text: '#ffffff', label: 'Gotong Royong' },
  umum:          { bg: '#1E3A5F', text: '#ffffff', label: 'Umum' },
}

export default async function HomePage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  /* Malaysia date for display */
  const mNow = new Date(Date.now() + (8 * 60 - new Date().getTimezoneOffset()) * 60000)
  const mDateLabel = mNow.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const [
    { data: announcements },
    { data: programs },
    { count: totalUsers },
    { count: totalPrograms },
    { count: resolvedKeperluan },
  ] = await Promise.all([
    supabase.from('announcements').select('id, title, content, category, is_pinned, created_at')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('programs').select('id, title, category, program_date, start_time, end_time, location, needs_volunteers, volunteer_slots, image_url').eq('is_published', true)
      .gte('program_date', today).order('program_date').limit(3),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('programs').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('keperluan').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
  ])

  const safeProgs = programs ?? []
  const safeAnns  = announcements ?? []

  return (
    <div style={{ background: 'var(--void)', overflowX: 'hidden' }}>

      {/* Hero */}
      <HomeHero
        totalUsers={totalUsers ?? 0}
        totalPrograms={totalPrograms ?? 0}
        resolvedKeperluan={resolvedKeperluan ?? 0}
      />

      {/* Marquee ticker */}
      {safeAnns.length > 0 && (
        <div className="marquee-track" style={{ background: 'var(--elevated)', borderBottom: '1px solid var(--border)' }}>
          <div className="marquee-inner">
            {[...safeAnns, ...safeAnns].map((ann, i) => (
              <span
                key={`ticker-${ann.id}-${i}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '12px',
                  padding: '12px 32px', whiteSpace: 'nowrap',
                  borderRight: '1px solid var(--border)',
                }}
              >
                <span style={{
                  width: '4px', height: '4px', borderRadius: '50%', flexShrink: 0,
                  background: catColors[ann.category] ?? catColors.umum,
                }} />
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                  color: 'var(--text-secondary)', letterSpacing: '0.04em',
                }}>
                  {ann.title}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT — native app feel
      ══════════════════════════════════════════ */}
      <div className="md:hidden" style={{ paddingBottom: '96px' }}>

        {/* ── Date strip ── */}
        <div style={{
          padding: '18px 20px 0',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }} />
          <span style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '13px',
            color: 'var(--text-dim)', letterSpacing: '0.04em',
          }}>
            {mDateLabel}
          </span>
        </div>

        {/* ── Personalised greeting (shown only when logged in) ── */}
        <GreetingBanner />

        {/* ── Quick access icon grid ── */}
        <section style={{ padding: '20px 20px 0' }}>
          {mobileGroups.map((group, gi) => (
            <div key={group.label} style={{ marginBottom: gi < mobileGroups.length - 1 ? '24px' : '0' }}>

              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--text-secondary)', fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  {group.label}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--border), transparent)' }} />
              </div>

              {/* 4-col icon grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {group.items.map(({ href, Icon, label, color, glow }) => (
                  <Link
                    key={href}
                    href={href}
                    className="active:scale-90 transition-transform duration-150"
                    style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                  >
                    {/* Icon tile */}
                    <div style={{
                      width: '64px', height: '64px',
                      borderRadius: '18px',
                      background: 'linear-gradient(145deg, var(--surface) 0%, var(--elevated) 100%)',
                      border: `1px solid ${color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 2px 20px ${color}14, 0 1px 0 rgba(255,255,255,0.04) inset`,
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {/* Top radial glow */}
                      <div style={{
                        position: 'absolute', top: '-20px', left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80px', height: '60px',
                        background: `radial-gradient(ellipse at 50% 0%, ${glow} 0%, transparent 70%)`,
                        pointerEvents: 'none',
                      }} />
                      {/* Specular top edge */}
                      <div style={{
                        position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
                        background: `linear-gradient(to right, transparent, ${color}30, transparent)`,
                      }} />
                      <Icon style={{ width: '22px', height: '22px', color, position: 'relative', zIndex: 1 }} strokeWidth={1.7} />
                    </div>

                    {/* Label */}
                    <span style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                      color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.3,
                    }}>
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── Announcements ── */}
        {safeAnns.length > 0 && (
          <section style={{ padding: '36px 20px 0' }}>

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--text-secondary)', fontWeight: 700,
                }}>
                  Pengumuman
                </span>
                <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right, var(--border), transparent)' }} />
              </div>
            </div>

            {/* Featured announcement card */}
            {(() => {
              const ann = safeAnns[0]
              const color = catColors[ann.category] ?? catColors.umum
              return (
                <div
                  className="liquid-glass-warm"
                  style={{ borderRadius: '20px', marginBottom: '10px', overflow: 'hidden' }}
                >
                  {/* Color top stripe */}
                  <div style={{ height: '3px', background: `linear-gradient(to right, ${color}, ${color}55)` }} />

                  <div style={{ padding: '18px 18px 20px' }}>
                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        color, padding: '4px 10px', borderRadius: '100px',
                        background: `${color}14`, border: `1px solid ${color}22`,
                      }}>
                        {catLabel[ann.category] ?? ann.category}
                      </span>
                      {ann.is_pinned && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: '#FBBF24', fontWeight: 600,
                        }}>
                          <Pin style={{ width: '9px', height: '9px' }} />
                          Disematkan
                        </span>
                      )}
                      <time style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                        color: 'var(--text-dim)', marginLeft: 'auto',
                      }}>
                        {new Date(ann.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                      </time>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontFamily: 'var(--font-playfair)', fontSize: '17px', fontWeight: 700,
                      color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '10px',
                    }}>
                      {ann.title}
                    </h3>

                    {/* Excerpt */}
                    <p style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '14px',
                      color: 'var(--text-dim)', lineHeight: 1.7,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {ann.content}
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Compact list items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {safeAnns.slice(1, 3).map((ann) => {
                const color = catColors[ann.category] ?? catColors.umum
                return (
                  <div
                    key={ann.id}
                    style={{
                      borderRadius: '14px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}
                  >
                    {/* Color left bar */}
                    <div style={{
                      width: '3px', alignSelf: 'stretch', borderRadius: '2px',
                      background: `linear-gradient(to bottom, ${color}, ${color}40)`,
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                        letterSpacing: '0.14em', textTransform: 'uppercase', color,
                        display: 'block', marginBottom: '4px',
                      }}>
                        {catLabel[ann.category] ?? ann.category}
                      </span>
                      <p style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 500,
                        color: 'var(--text-secondary)', lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ann.title}
                      </p>
                    </div>
                    <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-muted)', flexShrink: 0 }} />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Programs ── */}
        <section style={{ padding: '36px 20px 0' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--text-secondary)', fontWeight: 700,
              }}>
                Program
              </span>
              <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right, var(--border), transparent)' }} />
            </div>
            <Link href="/program" style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              fontFamily: 'var(--font-jakarta)', fontSize: '13px',
              color: 'var(--primary)', textDecoration: 'none',
            }}>
              Semua <ChevronRight style={{ width: '12px', height: '12px' }} />
            </Link>
          </div>

          {safeProgs.length === 0 ? (
            <div style={{
              padding: '36px 20px', textAlign: 'center', borderRadius: '16px',
              background: 'var(--surface)', border: '1px dashed var(--border)',
            }}>
              <Calendar style={{ width: '24px', height: '24px', color: 'var(--text-muted)', margin: '0 auto 10px' }} />
              <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
                Tiada program dijadualkan
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {safeProgs.map((prog, i) => {
                const d = new Date(prog.program_date)
                const cat = catProgramColors[prog.category ?? 'umum'] ?? catProgramColors.umum
                return (
                  <Link
                    key={prog.id}
                    href={`/program/${prog.id}`}
                    className="active:scale-[0.98] transition-transform duration-150"
                    style={{
                      textDecoration: 'none', display: 'flex',
                      borderRadius: '16px', overflow: 'hidden',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                    }}
                  >
                    {/* Date column */}
                    <div style={{
                      width: '68px', flexShrink: 0,
                      background: `linear-gradient(180deg, ${cat.bg} 0%, ${cat.bg}CC 100%)`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '18px 0', gap: '3px',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-jetbrains)', fontSize: '26px', fontWeight: 700,
                        color: cat.text, lineHeight: 1, letterSpacing: '-0.02em',
                      }}>
                        {String(d.getDate()).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                        color: cat.text, opacity: 0.65,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                      }}>
                        {d.toLocaleDateString('ms-MY', { month: 'short' })}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{
                      flex: 1, padding: '14px 16px 14px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center',
                      minWidth: 0,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: 'var(--text-dim)', fontWeight: 600, marginBottom: '5px',
                      }}>
                        {cat.label}
                      </span>
                      <h3 style={{
                        fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 700,
                        color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '7px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {prog.title}
                      </h3>
                      <div style={{
                        display: 'flex', gap: '10px', flexWrap: 'wrap',
                        fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)',
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                          <Clock style={{ width: '10px', height: '10px' }} />
                          {prog.start_time}
                        </span>
                        {prog.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <MapPin style={{ width: '10px', height: '10px', flexShrink: 0 }} />
                            {prog.location}
                          </span>
                        )}
                      </div>
                      {prog.needs_volunteers && prog.volunteer_slots > 0 && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          marginTop: '6px',
                          fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                          color: '#FBBF24', fontWeight: 600,
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FBBF24', boxShadow: '0 0 6px #FBBF2480' }} />
                          {prog.volunteer_slots} slot sukarela terbuka
                        </span>
                      )}
                    </div>

                    {/* Arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', paddingRight: '14px' }}>
                      <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ── KrackedDevs mobile ── */}
        <div style={{ margin: '36px 20px 0', position: 'relative' }}>
          <div style={{
            borderRadius: '20px', overflow: 'hidden',
            background: 'var(--surface)', border: '1px solid var(--border)',
            padding: '20px',
          }}>
            {/* Subtle geometric watermark */}
            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.025, pointerEvents: 'none' }}>
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <polygon points="50,4 58,32 88,32 64,50 74,78 50,62 26,78 36,50 12,32 42,32" stroke="#22C55E" strokeWidth="1" fill="none"/>
                <circle cx="50" cy="50" r="46" stroke="#22C55E" strokeWidth="0.5" fill="none"/>
              </svg>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Image src={kdLogo} alt="KrackedDevs" height={20} style={{ objectFit: 'contain', display: 'block' }} />
              <span style={{
                fontSize: '13px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                background: 'var(--primary-pale)', color: 'var(--primary)',
                fontFamily: 'var(--font-jakarta)', letterSpacing: '0.1em',
              }}>
                RC26
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.65, marginBottom: '14px' }}>
              Kariah MSU dibina sempena Ramadan Challenge 2026 oleh KrackedDevs — komuniti developer Malaysia.
            </p>
            <a
              href={process.env.NEXT_PUBLIC_KRACKEDDEVS_REFERRAL ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: '100px',
                background: 'var(--primary)', color: 'var(--text-inverse)',
                fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sertai KrackedDevs →
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT — editorial magazine
      ══════════════════════════════════════════ */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 md:px-6 lg:px-10">

        {/* ── Editorial headline ── */}
        <section style={{ padding: 'clamp(60px, 9vw, 120px) 0 clamp(40px, 5vw, 72px)' }}>
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                letterSpacing: '0.26em', textTransform: 'uppercase',
                color: 'var(--primary)', fontWeight: 700, marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ width: '22px', height: '1.5px', background: 'var(--primary)', display: 'inline-block' }} />
                Platform Komuniti Digital
              </p>
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(2.8rem, 7.5vw, 7rem)',
                fontWeight: 800, lineHeight: 0.90,
                letterSpacing: '-0.03em', color: 'var(--text-primary)',
              }}>
                Dari sujud,<br />
                <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>lahir komuniti.</em>
              </h2>
            </div>
            <p
              className="hidden md:block"
              style={{
                maxWidth: '210px',
                fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                color: 'var(--text-dim)', lineHeight: 1.75, textAlign: 'right',
              }}
            >
              Waktu solat, sukarela, keperluan komuniti dan kelas agama — semuanya di satu tempat.
            </p>
          </div>
        </section>

        {/* ── Quick access pill strip ── */}
        <section style={{ marginBottom: 'clamp(60px, 8vw, 108px)' }}>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '13px',
            letterSpacing: '0.20em', textTransform: 'uppercase',
            color: 'var(--text-dim)', fontWeight: 600, marginBottom: '18px',
          }}>
            Akses Pantas
          </p>
          <div
            className="scrollbar-none"
            style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}
          >
            {quickAccess.map(({ href, icon: Icon, label, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="hover:-translate-y-1.5 active:scale-95"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '11px 20px', borderRadius: '100px',
                  background: bg,
                  border: `1.5px solid ${color}28`,
                  flexShrink: 0, textDecoration: 'none',
                  transition: 'transform 0.2s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.2s ease',
                }}
              >
                <Icon style={{ color, width: '15px', height: '15px' }} strokeWidth={2} />
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                  fontWeight: 600, color, whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Programs ── */}
        <section style={{ marginBottom: 'clamp(60px, 8vw, 108px)' }}>
          <div
            className="flex flex-col md:flex-row md:items-end justify-between gap-5"
            style={{ marginBottom: '44px' }}
          >
            <div>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                letterSpacing: '0.20em', textTransform: 'uppercase',
                color: 'var(--primary)', fontWeight: 600, marginBottom: '12px',
              }}>
                Program Komuniti &middot; {new Date().getFullYear()}
              </p>
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(2.2rem, 5.5vw, 5rem)',
                fontWeight: 800, lineHeight: 0.88,
                letterSpacing: '-0.03em', color: 'var(--text-primary)',
              }}>
                Sertai<br />Program
              </h2>
            </div>
            <Link
              href="/program"
              className="hover:border-[var(--primary)] hover:text-[var(--primary)]"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '100px',
                border: '1.5px solid var(--border)',
                fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 500,
                color: 'var(--text-secondary)', textDecoration: 'none',
                transition: 'all 0.18s', flexShrink: 0, alignSelf: 'flex-start',
              }}
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {safeProgs.length === 0 ? (
            <div style={{
              padding: '64px 24px', textAlign: 'center',
              borderRadius: '20px', border: '1px dashed var(--border)',
            }}>
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-dim)' }} />
              <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', color: 'var(--text-dim)' }}>
                Tiada program dijadualkan buat masa ini
              </p>
            </div>
          ) : safeProgs.length >= 3 ? (
            <div
              className="grid md:grid-cols-[3fr_2fr] grid-cols-1 gap-4"
              style={{ alignItems: 'start' }}
            >
              {(() => {
                const prog = safeProgs[0]
                const d = new Date(prog.program_date)
                const cat = catProgramColors[prog.category ?? 'umum'] ?? catProgramColors.umum
                return (
                  <Link
                    href={`/program/${prog.id}`}
                    className="group scatter-card overflow-hidden rounded-3xl glass-card-amber block"
                    style={{ transform: 'rotate(-1.3deg)', transformOrigin: 'center 92%' }}
                  >
                    <span aria-hidden style={{
                      position: 'absolute', right: '-14px', bottom: '-20px',
                      fontFamily: 'var(--font-jetbrains)',
                      fontSize: 'clamp(100px, 16vw, 170px)',
                      fontWeight: 700, color: 'rgba(217,119,6,0.07)',
                      lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                    }}>
                      {String(d.getDate()).padStart(2, '0')}
                    </span>
                    <div style={{ background: cat.bg, padding: '20px 28px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', letterSpacing: '0.20em', textTransform: 'uppercase', color: cat.text, opacity: 0.75, fontWeight: 600 }}>
                        {cat.label}
                      </span>
                      {prog.needs_volunteers && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600, color: cat.text }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4ADE80' }} />
                          Perlu Sukarela
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '24px 28px 28px', position: 'relative' }}>
                      <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '18px' }}>
                        <div style={{ flexShrink: 0 }}>
                          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 'clamp(42px, 6vw, 60px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                            {d.getDate()}
                          </p>
                          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: '2px' }}>
                            {d.toLocaleDateString('ms-MY', { month: 'short' })} {d.getFullYear()}
                          </p>
                        </div>
                        <div style={{ flex: 1, paddingTop: '6px' }}>
                          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.2rem, 2.4vw, 1.7rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '10px' }}>
                            {prog.title}
                          </h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock className="w-3 h-3" /> {prog.start_time}</span>
                            {prog.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin className="w-3 h-3" /> {prog.location}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                          Lihat butiran <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })()}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {safeProgs.slice(1, 3).map((prog, si) => {
                  const d = new Date(prog.program_date)
                  const cat = catProgramColors[prog.category ?? 'umum'] ?? catProgramColors.umum
                  const rot = si === 0 ? 'rotate(0.9deg)' : 'rotate(-0.6deg)'
                  return (
                    <Link
                      key={prog.id}
                      href={`/program/${prog.id}`}
                      className={`group scatter-card overflow-hidden rounded-2xl block ${si === 0 ? 'glass-card-green' : 'glass-card-indigo'}`}
                      style={{ transform: rot, transformOrigin: 'center 90%' }}
                    >
                      <div style={{ display: 'flex' }}>
                        <div style={{ width: '64px', flexShrink: 0, background: cat.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 0' }}>
                          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '26px', fontWeight: 700, color: cat.text, lineHeight: 1 }}>{d.getDate()}</p>
                          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: cat.text, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '4px' }}>{d.toLocaleDateString('ms-MY', { month: 'short' })}</p>
                        </div>
                        <div style={{ flex: 1, padding: '14px 18px' }}>
                          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>{cat.label}</span>
                          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25, marginTop: '4px', marginBottom: '7px' }}>{prog.title}</h3>
                          <div style={{ display: 'flex', gap: '8px', fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock className="w-2.5 h-2.5" /> {prog.start_time}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              {safeProgs.map((prog, i) => {
                const d = new Date(prog.program_date)
                const cat = catProgramColors[prog.category ?? 'umum'] ?? catProgramColors.umum
                return (
                  <Link key={prog.id} href={`/program/${prog.id}`} className="group overflow-hidden rounded-2xl glass-card-amber block animate-slideUp" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div style={{ background: cat.bg, padding: '16px 20px' }}>
                      <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: cat.text, opacity: 0.75, fontWeight: 600 }}>{cat.label}</span>
                    </div>
                    <div style={{ padding: '16px 20px 20px' }}>
                      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{prog.title}</h3>
                      <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
                        {d.getDate()} {d.toLocaleDateString('ms-MY', { month: 'short' })} &middot; {prog.start_time}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Announcements + sidebar ── */}
        <div
          className="grid md:grid-cols-5 gap-10 md:gap-14"
          style={{ marginBottom: 'clamp(60px, 8vw, 108px)' }}
        >
          <div className="md:col-span-3">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', gap: '16px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600, marginBottom: '10px' }}>Maklumat Terkini</p>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Pengumuman</h2>
              </div>
              <Link href="/" style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {safeAnns.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', color: 'var(--text-dim)' }}>Tiada pengumuman buat masa ini</p>
              </div>
            ) : (
              <div>
                {safeAnns.map((ann, i) => (
                  <div
                    key={ann.id}
                    className="animate-slideUp"
                    style={{
                      borderTop: `1px solid ${i === 0 ? 'var(--border-lit)' : 'var(--border)'}`,
                      paddingTop: '22px',
                      paddingBottom: i < safeAnns.length - 1 ? '22px' : 0,
                      animationDelay: `${i * 0.07}s`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: catColors[ann.category] ?? catColors.umum }} />
                      <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: catColors[ann.category] ?? catColors.umum }}>
                        {catLabel[ann.category] ?? ann.category}
                      </span>
                      {ann.is_pinned && (
                        <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: '#D97706', letterSpacing: '0.06em' }}>
                          <Pin className="w-2.5 h-2.5 inline mr-0.5" /> Disematkan
                        </span>
                      )}
                      <time style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                        {new Date(ann.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                      </time>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: i === 0 ? 'clamp(1.35rem, 2.6vw, 1.9rem)' : '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '8px' }}>
                      {ann.title}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.65 }}>
                      {ann.content.slice(0, i === 0 ? 145 : 85)}{ann.content.length > (i === 0 ? 145 : 85) ? '…' : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/hadis" className="group relative rounded-2xl p-6 glass-card-deep-green" style={{ minHeight: '155px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="absolute inset-0 pattern-overlay opacity-[0.06]" />
              <div className="relative">
                <BookMarked className="w-6 h-6 text-white mb-4" style={{ opacity: 0.85 }} strokeWidth={1.8} />
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Hadis Harian</h3>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'rgba(255,255,255,0.58)' }}>1 hadis pilihan setiap hari dari koleksi sahih</p>
              </div>
              <div className="relative flex justify-end">
                <ArrowRight className="w-4 h-4 text-white opacity-40 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/qiblat" className="group relative rounded-2xl p-4 glass-card-indigo">
                <Compass className="w-5 h-5 mb-3" style={{ color: '#6366F1' }} strokeWidth={1.8} />
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>Qiblat</h3>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)' }}>Arah tepat</p>
              </Link>
              <Link href="/buka-puasa" className="group relative rounded-2xl p-4 glass-card-amber">
                <Clock className="w-5 h-5 mb-3" style={{ color: '#D97706' }} strokeWidth={1.8} />
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>Berbuka</h3>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)' }}>Kiraan masa</p>
              </Link>
            </div>
          </div>
        </div>

        {/* ── KrackedDevs desktop ── */}
        <div
          className="rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', padding: '20px 24px', marginBottom: '48px' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Image src={kdLogo} alt="KrackedDevs" height={28} style={{ objectFit: 'contain', display: 'block' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px', background: 'var(--primary-pale)', color: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}>RC26</span>
            </div>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              Kariah MSU dibina sempena Ramadan Challenge 2026 oleh KrackedDevs &mdash; komuniti developer Malaysia yang build real products.
            </p>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_KRACKEDDEVS_REFERRAL ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flexShrink: 0, padding: '10px 20px', borderRadius: '100px', background: 'var(--primary)', color: '#fff', fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
          >
            Sertai KrackedDevs &rarr;
          </a>
        </div>

      </div>
    </div>
  )
}
