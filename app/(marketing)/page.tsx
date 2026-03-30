'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, Check, Menu, X, ChevronDown, Zap,
  Clock3, Megaphone, CalendarDays, HeartHandshake,
  BookOpen, BellRing, LucideIcon,
} from 'lucide-react'
import sajdaLogo from '@/images/sajda-logo.png'
import StarBorder from '@/components/ui/StarBorder'

/* ─────────────────────────────────────────────
   COLOUR SYSTEM — "Emerald Daylight"
   Bright, vibrant, professional, Islamic
───────────────────────────────────────────── */
const C = {
  bg:          '#F5FCF7',          // soft mint-white base
  bgAlt:       '#EDFAF2',          // slightly deeper mint for alternate sections
  surface:     '#FFFFFF',          // card backgrounds
  surfaceHov:  '#F0FAF4',          // card hover
  border:      '#D1EAD9',          // light green border
  borderHov:   '#86C49A',          // hover border

  primary:     '#059669',          // emerald-600 — main brand
  primaryDark: '#047857',          // emerald-700 — hover
  primaryPale: '#D1FAE5',          // emerald-100 — tint backgrounds
  primaryText: '#ECFDF5',          // text on dark green bg

  gold:        '#D97706',          // amber-600 — premium CTA
  goldDark:    '#B45309',          // amber-700 — hover
  goldPale:    '#FEF3C7',          // amber-100
  goldBorder:  '#FDE68A',          // amber-200

  text:        '#064E3B',          // emerald-900 — headings
  textBody:    '#065F46',          // emerald-800 — body
  muted:       '#6B7280',          // neutral gray
  mutedLight:  '#9CA3AF',
  white:       '#FFFFFF',
} as const

/* ─── Scroll-triggered fade-up ─── */
function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])
  return vis
}

function FadeUp({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useInView(ref)
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(22px)', transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.primaryPale, border: `1px solid ${C.border}`, padding: '5px 14px', borderRadius: 999, marginBottom: 20 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, flexShrink: 0 }} />
      <span style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 700, color: C.primary, textTransform: 'uppercase' }}>{children}</span>
    </div>
  )
}

/* ─── Feature grid cell ─── */
function FeatureCell({
  Icon, accent, title, desc, badge,
}: {
  Icon: LucideIcon
  accent: string
  title: string
  desc: string
  badge?: string
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '36px 32px',
        background: hov ? C.surfaceHov : C.surface,
        borderRight: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        transition: 'background 0.22s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle corner glow on hover */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: hov ? `linear-gradient(90deg, ${accent}, transparent)` : 'transparent',
        transition: 'background 0.3s',
      }} />

      {/* Icon container */}
      <div style={{
        width: 48, height: 48, borderRadius: 14, marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hov ? accent + '18' : accent + '10',
        border: `1px solid ${accent}28`,
        transition: 'background 0.22s, border-color 0.22s',
        boxShadow: hov ? `0 4px 16px ${accent}20` : 'none',
      }}>
        <Icon size={22} color={accent} strokeWidth={1.8} />
      </div>

      {/* Badge */}
      {badge && (
        <span style={{
          display: 'inline-block', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: accent, background: accent + '14',
          border: `1px solid ${accent}22`,
          padding: '2px 8px', borderRadius: 999, marginBottom: 10,
        }}>
          {badge}
        </span>
      )}

      <h3 style={{
        fontSize: 15, fontWeight: 700,
        color: hov ? C.text : '#1A3A2A',
        marginBottom: 10, lineHeight: 1.3,
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: 13.5, color: C.muted,
        lineHeight: 1.8, margin: 0,
      }}>
        {desc}
      </p>
    </div>
  )
}

/* ─── Pricing card ─── */
const plans = [
  {
    key: 'surau', name: 'Surau', monthly: 59, annual: 590,
    tagline: 'Untuk surau kecil & masjid baharu digital', highlight: false,
    features: ['Profil masjid & kemudahan', 'Waktu solat harian (JAKIM)', 'Papan pengumuman', 'Tersenarai dalam direktori Sajda', 'Alat ibadah jemaah (tasbih, wirid, qiblat)', 'Sehingga 3 pentadbir', 'Percubaan percuma 14 hari'],
  },
  {
    key: 'kariah', name: 'Kariah', monthly: 119, annual: 1190,
    tagline: 'Untuk masjid aktif — pilihan paling popular', highlight: true,
    features: ['Semua dalam Surau', 'Program & pendaftaran sukarela', 'Papan keperluan komuniti', 'Kelas agama & tempahan', 'Papan Janaiz + peta lokasi', 'Kumpulan halaqah', 'Notifikasi push ke jemaah', 'Cari Barang (Lost & Found)', 'Sehingga 15 pentadbir'],
  },
  {
    key: 'komuniti', name: 'Komuniti', monthly: 219, annual: 2190,
    tagline: 'Untuk masjid besar — operasi penuh', highlight: false,
    features: ['Semua dalam Kariah', 'Siaran langsung solat Jumaat', 'Jadual & roster Bilal mingguan', 'Jadual & roster Imam mingguan', 'Pengurusan akaun derma', 'Sijil penyertaan (PDF auto)', 'Pentadbir tanpa had', 'Sokongan prioriti < 24 jam'],
  },
]

function PlanCard({ plan, annual }: { plan: typeof plans[number]; annual: boolean }) {
  const [hov, setHov] = useState(false)
  const price = annual ? plan.annual : plan.monthly
  const suffix = annual ? '/tahun' : '/bulan'
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: plan.highlight ? C.primary : C.surface,
        border: `2px solid ${plan.highlight ? C.primary : C.border}`,
        borderRadius: 20,
        padding: '32px 28px',
        position: 'relative',
        boxShadow: plan.highlight
          ? '0 20px 60px rgba(5,150,105,0.25), 0 4px 16px rgba(5,150,105,0.15)'
          : hov ? '0 12px 40px rgba(5,150,105,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-5px)' : 'none',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {plan.highlight && (
        <div style={{
          position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
          background: C.gold, color: C.white,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
          padding: '4px 16px', borderRadius: 999, whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(217,119,6,0.4)',
        }}>
          ⭐ PALING POPULAR
        </div>
      )}

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: plan.highlight ? 'rgba(255,255,255,0.7)' : C.primary, marginBottom: 16 }}>
        {plan.name.toUpperCase()}
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: annual ? 4 : 8 }}>
        <span style={{ fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.6)' : C.muted }}>RM</span>
        <span style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 52, fontWeight: 800, lineHeight: 1, color: plan.highlight ? C.white : C.text }}>
          {price}
        </span>
        <span style={{ fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.6)' : C.muted }}>{suffix}</span>
      </div>

      {annual && (
        <p style={{ fontSize: 12, color: plan.highlight ? '#86EFAC' : C.primary, marginBottom: 8, fontWeight: 600 }}>
          2 bulan percuma · jimat RM{plan.monthly * 2}
        </p>
      )}

      <p style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.75)' : C.muted, marginBottom: 24, lineHeight: 1.5 }}>
        {plan.tagline}
      </p>

      <Link
        href={`/daftar?plan=${plan.key}&billing=${annual ? 'annual' : 'monthly'}`}
        style={{
          display: 'block', textAlign: 'center',
          padding: '12px', borderRadius: 12,
          fontSize: 13, fontWeight: 700, textDecoration: 'none',
          background: plan.highlight ? C.gold : C.primary,
          color: C.white,
          marginBottom: 28,
          boxShadow: plan.highlight
            ? '0 4px 12px rgba(217,119,6,0.35)'
            : '0 4px 12px rgba(5,150,105,0.25)',
          letterSpacing: '0.01em',
        }}
      >
        Mulakan — {plan.name}
      </Link>

      <div style={{ height: 1, background: plan.highlight ? 'rgba(255,255,255,0.15)' : C.border, marginBottom: 24 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {plan.features.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: plan.highlight ? 'rgba(255,255,255,0.2)' : C.primaryPale, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={10} color={plan.highlight ? C.white : C.primary} strokeWidth={3} />
            </div>
            <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.85)' : C.textBody, lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const features = [
  {
    Icon: Clock3,
    accent: '#059669',
    title: 'Waktu Solat Automatik',
    desc: 'Waktu solat harian berdasarkan zon JAKIM Malaysia — dikemaskini automatik. Jemaah tahu bila nak solat tanpa tanya sesiapa.',
    badge: 'Real-time',
  },
  {
    Icon: Megaphone,
    accent: '#0891B2',
    title: 'Papan Pengumuman',
    desc: 'AJK siar pengumuman dengan kategori, tarikh tamat, dan pin ke atas. Penting di atas, lama hilang sendiri.',
    badge: undefined,
  },
  {
    Icon: CalendarDays,
    accent: '#7C3AED',
    title: 'Program & Sukarela',
    desc: 'Buka slot sukarela dengan had bilangan. Jemaah daftar realtime — AJK nampak siapa dah sign up tanpa spreadsheet.',
    badge: 'Live Counter',
  },
  {
    Icon: HeartHandshake,
    accent: '#DC2626',
    title: 'Keperluan Komuniti',
    desc: 'Papan digital tempat jemaah minta bantuan atau tawarkan pertolongan. AJK luluskan dulu sebelum tersiar.',
    badge: undefined,
  },
  {
    Icon: BookOpen,
    accent: '#D97706',
    title: 'Kelas & Tempahan',
    desc: 'Senaraikan kelas quran, fiqh, kuliah mingguan. Jemaah tempah tempat, kapasiti dikawal, ustaz dikenali.',
    badge: undefined,
  },
  {
    Icon: BellRing,
    accent: '#059669',
    title: 'Notifikasi Push',
    desc: 'Hantar notifikasi terus ke telefon jemaah — program baharu, pengumuman penting, slot sukarela terbuka.',
    badge: 'Kariah & atas',
  },
]

const steps = [
  { n: '01', title: 'Daftar Masjid',    desc: 'Lengkapkan maklumat masjid dan pilih pelan yang sesuai dalam masa 5 minit.' },
  { n: '02', title: 'Bayar & Aktif',    desc: 'Bayar melalui FPX, kad kredit, atau e-wallet. Masjid anda terus aktif sebaik bayaran.' },
  { n: '03', title: 'Jemput AJK',       desc: 'Hantar jemputan e-mel kepada AJK anda untuk urus kandungan platform.' },
  { n: '04', title: 'Kongsi ke Jemaah', desc: 'Kongsi link masjid ke WhatsApp group — jemaah ikut dan komuniti pun bermula.' },
]

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [annual, setAnnual] = useState(true)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: 'flex', alignItems: 'center',
        padding: '0 32px', justifyContent: 'space-between',
        background: scrolled ? 'rgba(245,252,247,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
        transition: 'all 0.3s',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Image src={sajdaLogo} alt="Sajda" height={32} style={{ objectFit: 'contain' }} />
        </Link>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {([['#features', 'Ciri-ciri'], ['#pricing', 'Harga'], ['#how', 'Cara Kerja']] as [string, string][]).map(([href, label]) => (
            <a key={href} href={href}
              style={{ fontSize: 13, fontWeight: 500, color: C.muted, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.primary)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
              {label}
            </a>
          ))}
          <div style={{ width: 1, height: 18, background: C.border }} />
          <Link href="/login"
            style={{ fontSize: 13, fontWeight: 500, color: C.muted, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = C.primary)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
            Log Masuk
          </Link>
          <Link href="/daftar" style={{
            fontSize: 13, fontWeight: 700, color: C.white,
            background: C.primary, padding: '9px 20px', borderRadius: 10,
            textDecoration: 'none', transition: 'background 0.2s',
            boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = C.primaryDark)}
            onMouseLeave={e => (e.currentTarget.style.background = C.primary)}>
            Daftar Masjid
          </Link>
        </div>

        <button className="nav-mobile" onClick={() => setNavOpen(!navOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text, padding: 6 }}>
          {navOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile nav drawer */}
      {navOpen && (
        <div className="nav-mobile" style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'rgba(245,252,247,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${C.border}`, padding: '24px 28px',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {([['#features', 'Ciri-ciri'], ['#pricing', 'Harga'], ['#how', 'Cara Kerja']] as [string, string][]).map(([href, label]) => (
            <a key={href} href={href} onClick={() => setNavOpen(false)}
              style={{ fontSize: 16, fontWeight: 500, color: C.textBody, textDecoration: 'none' }}>{label}</a>
          ))}
          <div style={{ height: 1, background: C.border }} />
          <Link href="/login" style={{ fontSize: 16, color: C.muted, textDecoration: 'none' }}>Log Masuk</Link>
          <Link href="/daftar" style={{
            fontSize: 15, fontWeight: 700, color: C.white,
            background: C.primary, padding: '14px 20px', borderRadius: 12,
            textDecoration: 'none', textAlign: 'center',
            boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
          }}>Daftar Masjid</Link>
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Geometric pattern background */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035, pointerEvents: 'none' }} aria-hidden>
          <defs>
            <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,6 46,26 67,26 51,39 57,59 40,47 23,59 29,39 13,26 34,26"
                fill="none" stroke={C.primary} strokeWidth="0.7" />
              <rect x="26" y="26" width="28" height="28" fill="none" stroke={C.primary} strokeWidth="0.35"
                transform="rotate(45 40 40)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo)" />
        </svg>

        {/* Radial glow blobs */}
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 500, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(5,150,105,0.08) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'absolute', top: '60%', right: '10%', width: 400, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(217,119,6,0.06) 0%, transparent 70%)' }} />

        <div style={{ position: 'relative', maxWidth: 840, margin: '0 auto' }}>

          {/* Badge */}
          <div style={{ opacity: 0, animation: 'fadeUp 0.55s ease 0.1s forwards' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: `1px solid ${C.border}`, background: C.primaryPale,
              padding: '6px 16px', borderRadius: 999, marginBottom: 36,
            }}>
              <Zap size={11} color={C.primary} />
              <span style={{ fontSize: 11, color: C.primary, letterSpacing: '0.14em', fontWeight: 700 }}>
                PLATFORM KOMUNITI MASJID #1 MALAYSIA
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-playfair), Playfair Display, serif',
            fontWeight: 800, fontStyle: 'italic',
            fontSize: 'clamp(40px, 7.5vw, 84px)',
            lineHeight: 1.06, letterSpacing: '-0.025em',
            marginBottom: 28, color: C.text,
            opacity: 0, animation: 'fadeUp 0.55s ease 0.2s forwards',
          }}>
            Komuniti Masjid,<br />
            <span style={{ color: C.primary }}>Kini Digital.</span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(15px, 2.2vw, 19px)', color: C.muted,
            lineHeight: 1.8, maxWidth: 540, margin: '0 auto 44px',
            opacity: 0, animation: 'fadeUp 0.55s ease 0.3s forwards',
          }}>
            Sajda membantu masjid dan surau Malaysia mengurus jemaah, program, keperluan komuniti, dan waktu solat — dalam satu platform yang elegan.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            alignItems: 'center',
            opacity: 0, animation: 'fadeUp 0.55s ease 0.4s forwards',
          }}>
            <StarBorder as={Link} href="/daftar" color="#10b981" speed="4s">
              Daftar Masjid Anda <ArrowRight size={14} />
            </StarBorder>
            <a href="#features" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              border: `1.5px solid ${C.border}`, color: C.muted,
              background: C.surface,
              padding: '13px 24px', borderRadius: 12,
              fontSize: 14, textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              Ketahui lebih lanjut <ChevronDown size={14} />
            </a>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 0,
            marginTop: 72, flexWrap: 'wrap',
            opacity: 0, animation: 'fadeUp 0.55s ease 0.55s forwards',
            border: `1px solid ${C.border}`, borderRadius: 16,
            background: C.surface, overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(5,150,105,0.06)',
            maxWidth: 680, margin: '72px auto 0',
          }}>
            {[
              { val: '50,000+', label: 'Jemaah Berpotensi' },
              { val: 'RM 59',   label: 'Bermula dari /bulan' },
              { val: '< 10 min', label: 'Masa setup' },
              { val: '14 hari', label: 'Percubaan percuma' },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                flex: 1, minWidth: 120, textAlign: 'center',
                padding: '20px 16px',
                borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 22, fontWeight: 800, color: C.text }}>{s.val}</div>
                <div style={{ fontSize: 11, color: C.mutedLight, marginTop: 4, letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', opacity: 0.35, animation: 'bounce 2s ease-in-out infinite' }}>
          <ChevronDown size={20} color={C.primary} />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '100px 24px', background: C.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Section header — left-aligned, editorial */}
          <FadeUp>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', gap: 40, marginBottom: 56 }}>
              <div>
                <SectionLabel>Ciri-ciri Platform</SectionLabel>
                <h2 style={{
                  fontFamily: 'var(--font-playfair), Playfair Display, serif',
                  fontWeight: 700, fontSize: 'clamp(28px, 4vw, 48px)',
                  lineHeight: 1.1, letterSpacing: '-0.025em', color: C.text,
                  margin: 0,
                }}>
                  Semua yang masjid perlukan.<br />
                  <em style={{ color: C.muted, fontStyle: 'italic', fontWeight: 400 }}>Tiada yang berlebihan.</em>
                </h2>
              </div>
              {/* Stat callout */}
              <div className="hidden md:block" style={{
                textAlign: 'right', flexShrink: 0,
                paddingBottom: 6,
              }}>
                <p style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 36, fontWeight: 800, color: C.primary, lineHeight: 1 }}>40+</p>
                <p style={{ fontSize: 12, color: C.muted, letterSpacing: '0.04em', marginTop: 4 }}>Ciri-ciri dalam satu platform</p>
              </div>
            </div>
          </FadeUp>

          {/* Feature grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 2px 24px rgba(5,150,105,0.06), 0 1px 4px rgba(0,0,0,0.04)',
          }}
            className="features-grid"
          >
            {features.map((f, i) => (
              <FadeUp key={f.title} delay={i * 55}>
                <FeatureCell
                  Icon={f.Icon}
                  accent={f.accent}
                  title={f.title}
                  desc={f.desc}
                  badge={f.badge}
                />
              </FadeUp>
            ))}
          </div>

          {/* Bottom footnote */}
          <FadeUp delay={380}>
            <p style={{ textAlign: 'center', fontSize: 13, color: C.mutedLight, marginTop: 28, letterSpacing: '0.02em' }}>
              Dan lebih banyak lagi — jadual bilal, papan janaiz, halaqah digital, sijil penyertaan, siaran langsung &amp; lain-lain.
            </p>
          </FadeUp>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 540px) {
            .features-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '100px 24px', background: C.bgAlt, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1060, margin: '0 auto', position: 'relative' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <SectionLabel>Pelan & Harga</SectionLabel>
              <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 46px)', lineHeight: 1.12, letterSpacing: '-0.025em', color: C.text, marginBottom: 12 }}>
                Pilih pelan yang sesuai<br />untuk masjid anda.
              </h2>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 36 }}>Tanpa kontrak. Batalkan bila-bila masa.</p>

              {/* Billing toggle */}
              <div style={{ display: 'inline-flex', padding: 4, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <button onClick={() => setAnnual(false)} style={{
                  padding: '9px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: !annual ? C.primary : 'transparent',
                  color: !annual ? C.white : C.muted,
                }}>
                  Bulanan
                </button>
                <button onClick={() => setAnnual(true)} style={{
                  padding: '9px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: annual ? C.primary : 'transparent',
                  color: annual ? C.white : C.muted,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  Tahunan
                  <span style={{ fontSize: 10, background: C.gold, color: C.white, padding: '2px 8px', borderRadius: 999, fontWeight: 800, letterSpacing: '0.06em' }}>
                    2 BULAN FREE
                  </span>
                </button>
              </div>
            </div>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
            {plans.map((plan, i) => (
              <FadeUp key={plan.key} delay={i * 80}>
                <PlanCard plan={plan} annual={annual} />
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={280}>
            <p style={{ textAlign: 'center', fontSize: 13, color: C.mutedLight, marginTop: 40 }}>
              Semua pelan termasuk cubaan percuma 14 hari · Sokongan melalui e-mel
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding: '100px 24px', background: C.surface }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <SectionLabel>Cara Kerja</SectionLabel>
              <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 46px)', lineHeight: 1.12, letterSpacing: '-0.025em', color: C.text }}>
                Mula dalam<br />10 minit.
              </h2>
            </div>
          </FadeUp>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 23, top: 8, bottom: 8, width: 2, background: `linear-gradient(180deg, ${C.primary} 0%, ${C.border} 100%)`, opacity: 0.3, borderRadius: 99 }} />
            {steps.map((step, i) => (
              <FadeUp key={step.n} delay={i * 90}>
                <div style={{ display: 'flex', gap: 28, marginBottom: 40, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48, height: 48, flexShrink: 0,
                    background: C.primary, borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-playfair), Playfair Display, serif',
                    fontSize: 13, fontWeight: 800, color: C.white,
                    boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                  }}>
                    {step.n}
                  </div>
                  <div style={{ paddingTop: 10 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: C.text }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value comparison ── */}
      <section style={{ padding: '80px 24px', background: C.bgAlt }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <SectionLabel>Nilai Sebenar</SectionLabel>
              <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontWeight: 700, fontSize: 'clamp(24px, 3.5vw, 40px)', lineHeight: 1.2, letterSpacing: '-0.02em', color: C.text }}>
                RM119/bulan menggantikan<br />
                <em style={{ color: C.primary }}>RM300–500 kerja manual.</em>
              </h2>
            </div>
          </FadeUp>
          <FadeUp delay={100}>
            <div style={{ borderRadius: 20, overflow: 'hidden', border: `1.5px solid ${C.border}`, boxShadow: '0 8px 32px rgba(5,150,105,0.08)' }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ background: '#FEF2F2', padding: '16px 24px', borderBottom: `1px solid #FECACA` }}>
                  <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#DC2626', textTransform: 'uppercase' }}>✕ Tanpa Sajda</p>
                </div>
                <div style={{ background: C.primaryPale, padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: C.primary, textTransform: 'uppercase' }}>✓ Dengan Sajda Kariah · RM119/bln</p>
                </div>
              </div>
              {[
                ['Cetak flyer & notis: RM80–200',           'Pengumuman digital: RM0'],
                ['WhatsApp group chaos',                     'Push notification: teratur & direct'],
                ['Google Form nampak tidak profesional',     'Daftar sukarela: profesional & realtime'],
                ['Spreadsheet kelas: mudah silap',           'Tempahan kelas: automated & terkawal'],
                ['Koordinasi manual: penat & lambat',        'Semua dalam satu app: tenang'],
              ].map(([left, right], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ background: C.surface, padding: '14px 24px', fontSize: 13, color: '#EF4444', borderRight: `1px solid ${C.border}` }}>
                    ✕ {left}
                  </div>
                  <div style={{ background: C.surface, padding: '14px 24px', fontSize: 13, color: C.primary }}>
                    ✓ {right}
                  </div>
                </div>
              ))}
              {/* Total row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ background: '#FEF2F2', padding: '18px 24px', fontSize: 14, fontWeight: 800, color: '#DC2626', borderRight: `1px solid ${C.border}` }}>
                  Jumlah: RM300–500/bulan
                </div>
                <div style={{ background: C.primaryPale, padding: '18px 24px', fontSize: 14, fontWeight: 800, color: C.primaryDark }}>
                  Jumlah: RM119/bulan = RM0.40/jemaah
                </div>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={200}>
            <p style={{ textAlign: 'center', fontSize: 14, color: C.muted, marginTop: 24, fontStyle: 'italic' }}>
              "RM119 sebulan = RM0.40 per jemaah. Lebih murah dari sebungkus gula."
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section style={{ padding: '60px 24px 100px', background: C.surface }}>
        <FadeUp>
          <div style={{
            maxWidth: 660, margin: '0 auto', textAlign: 'center',
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
            borderRadius: 24, padding: '64px 40px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(5,150,105,0.3)',
          }}>
            {/* Islamic pattern watermark */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }} aria-hidden>
              <defs>
                <pattern id="geo2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <polygon points="30,4 35,20 52,20 39,30 44,46 30,36 16,46 21,30 8,20 25,20"
                    fill="none" stroke="white" strokeWidth="0.9" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#geo2)" />
            </svg>
            <div style={{ position: 'relative' }}>
              <Image src={sajdaLogo} alt="Sajda" height={34} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', display: 'block', margin: '0 auto 28px' }} />
              <h2 style={{
                fontFamily: 'var(--font-playfair), Playfair Display, serif',
                fontWeight: 700, fontStyle: 'italic',
                fontSize: 'clamp(26px, 4vw, 42px)',
                lineHeight: 1.18, letterSpacing: '-0.02em',
                color: C.white, marginBottom: 16,
              }}>
                Masjid anda patut digital.
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', marginBottom: 36, lineHeight: 1.65 }}>
                Mulakan dengan cubaan percuma 14 hari. Tiada kad kredit diperlukan.
              </p>
              <StarBorder as={Link} href="/daftar" color="#f59e0b" speed="4s">
                Daftar Sekarang — Percuma <ArrowRight size={14} />
              </StarBorder>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: C.text, padding: '40px', borderTop: 'none' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <Image src={sajdaLogo} alt="Sajda" height={28} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            © {new Date().getFullYear()} Sajda · Platform Komuniti Masjid Digital Malaysia
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              ['/login', 'Log Masuk'],
              ['/daftar', 'Daftar'],
              ['/home', 'App'],
              ['mailto:hello@sajda.my', 'Hubungi'],
            ].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:none; } }
        @keyframes bounce  { 0%,100% { transform:translateX(-50%) translateY(0); } 50% { transform:translateX(-50%) translateY(7px); } }
        @media (max-width:680px) { .nav-desktop { display:none !important; } .nav-mobile { display:flex !important; } }
        @media (min-width:681px) { .nav-mobile { display:none !important; } }
      `}</style>
    </div>
  )
}
