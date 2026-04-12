'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Clock3, Megaphone, HeartHandshake, CalendarDays,
  BookOpen, LayoutDashboard, ArrowRight, Check,
  Menu, X, ChevronDown, Users, Star,
  Bell, MapPin,
} from 'lucide-react'
import sajdaLogo from '@/images/sajda-logo.png'

/* ─────────────────────────────────────────────
   TOKENS — Sacred Futurism Dark
───────────────────────────────────────────── */
const D = {
  void:        '#080C0A',
  base:        '#0F1712',
  surface:     '#162019',
  elevated:    '#1E2D22',
  border:      '#1E2D22',
  borderLit:   '#2A4030',
  borderGlow:  'rgba(74,222,128,0.20)',

  primary:     '#4ADE80',
  primaryDim:  '#22C55E',
  primaryGlow: 'rgba(74,222,128,0.15)',
  primaryPale: 'rgba(74,222,128,0.08)',

  gold:        '#F59E0B',
  goldPale:    'rgba(245,158,11,0.10)',
  goldBorder:  'rgba(245,158,11,0.30)',

  text:        '#F0FDF4',
  textSub:     '#86EFAC',
  textMuted:   '#6EAB84',
  textDim:     '#4A7A5A',
} as const

/* ─────────────────────────────────────────────
   ANIMATION
───────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const inUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } },
})

function FadeUp({ children, delay = 0, className = '', style = {} }: {
  children: React.ReactNode
  delay?: number
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef(null)
  const vis = useInView(ref, { once: true, margin: '-64px 0px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={vis ? 'show' : 'hidden'}
      variants={inUp(delay / 1000)}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   COUNT-UP
───────────────────────────────────────────── */
function useCountUp(target: number, active: boolean, duration = 1.6) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    const t0 = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - t0) / 1000 / duration, 1)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target, duration])
  return n
}

/* ─────────────────────────────────────────────
   ISLAMIC GEOMETRIC OVERLAY
───────────────────────────────────────────── */
function GeoOverlay({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <svg
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
    >
      <defs>
        <pattern id="geo-sf" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <polygon
            points="30,5 35,20 50,20 38,30 43,45 30,36 17,45 22,30 10,20 25,20"
            fill="none" stroke={D.primary} strokeWidth="0.5"
          />
          <rect x="20" y="20" width="20" height="20" fill="none" stroke={D.primary} strokeWidth="0.3"
            transform="rotate(45 30 30)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geo-sf)" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      display: 'inline-block',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: D.primary,
      marginBottom: 16,
      fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
    }}>
      {children}
    </p>
  )
}

/* ─────────────────────────────────────────────
   BUTTONS
───────────────────────────────────────────── */
function PrimaryBtn({ children, href, style = {} }: {
  children: React.ReactNode; href: string; style?: React.CSSProperties
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex' }}>
      <Link href={href} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 24px', borderRadius: 12,
        fontSize: 14, fontWeight: 700, textDecoration: 'none',
        background: D.primary, color: D.void,
        letterSpacing: '0.01em',
        transition: 'filter 0.15s',
        fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
        ...style,
      }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = 'none')}
      >
        {children}
      </Link>
    </motion.div>
  )
}

function GhostBtn({ children, href, style = {} }: {
  children: React.ReactNode; href: string; style?: React.CSSProperties
}) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} style={{ display: 'inline-flex' }}>
      <Link href={href} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 24px', borderRadius: 12,
        fontSize: 14, fontWeight: 600, textDecoration: 'none',
        background: 'transparent', color: D.textSub,
        border: `1px solid ${D.borderLit}`,
        letterSpacing: '0.01em',
        transition: 'border-color 0.15s, color 0.15s, background 0.15s',
        fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
        ...style,
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = D.borderGlow
          el.style.color = D.text
          el.style.background = D.primaryPale
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = D.borderLit
          el.style.color = D.textSub
          el.style.background = 'transparent'
        }}
      >
        {children}
      </Link>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   DARK DASHBOARD MOCKUP
───────────────────────────────────────────── */
function DashboardMockup() {
  const prayers = [
    { name: 'Subuh',   time: '5:42',  done: true  },
    { name: 'Zohor',   time: '13:08', done: true  },
    { name: 'Asar',    time: '16:24', done: false, next: true },
    { name: 'Maghrib', time: '19:31', done: false },
    { name: 'Isyak',   time: '20:42', done: false },
  ]
  return (
    <div style={{
      width: '100%', maxWidth: 480,
      border: `1px solid ${D.borderLit}`,
      borderRadius: 16, overflow: 'hidden',
      background: D.base,
      fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
      boxShadow: `0 0 60px ${D.primaryGlow}, 0 32px 64px rgba(0,0,0,0.6)`,
    }}>
      {/* Browser chrome */}
      <div style={{
        background: D.surface, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${D.border}`,
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#EF4444','#F59E0B','#4ADE80'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div style={{
          flex: 1, height: 22, borderRadius: 4, background: D.elevated,
          border: `1px solid ${D.border}`,
          display: 'flex', alignItems: 'center', paddingLeft: 8,
          fontSize: 10, color: D.textMuted,
        }}>
          sajda.my/masjid-saujana-utama
        </div>
      </div>

      {/* App header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${D.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: D.primaryPale, border: `1px solid ${D.borderGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 14, height: 14, border: `2px solid ${D.primary}`, borderRadius: 2, transform: 'rotate(45deg)', borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: D.text }}>Masjid Saujana Utama</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Bell size={13} color={D.textMuted} />
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: D.primaryPale, border: `1px solid ${D.borderGlow}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9, color: D.primary, fontWeight: 700 }}>AJ</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Prayer times */}
        <div style={{ padding: '14px 14px 16px', borderRight: `1px solid ${D.border}` }}>
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.textMuted, marginBottom: 10 }}>Waktu Solat</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {prayers.map(p => (
              <div key={p.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '5px 8px', borderRadius: 5,
                background: p.next ? D.primaryPale : 'transparent',
                border: `1px solid ${p.next ? D.borderGlow : 'transparent'}`,
              }}>
                <span style={{ fontSize: 10, fontWeight: p.next ? 700 : 400, color: p.done ? D.textDim : p.next ? D.primary : D.text }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: p.done ? D.textDim : p.next ? D.primary : D.textSub, fontFamily: 'monospace' }}>
                  {p.time}
                </span>
              </div>
            ))}
          </div>
          {/* Countdown */}
          <div style={{ marginTop: 10, padding: '8px', background: D.primaryPale, border: `1px solid ${D.borderGlow}`, borderRadius: 6, textAlign: 'center' }}>
            <p style={{ fontSize: 9, color: D.textMuted, marginBottom: 2 }}>Asar dalam</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: D.primary, fontFamily: 'var(--font-jetbrains, monospace)', lineHeight: 1 }}>2:46:18</p>
          </div>
        </div>

        {/* Announcements */}
        <div style={{ padding: '14px 14px 16px' }}>
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.textMuted, marginBottom: 10 }}>Pengumuman</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { tag: 'PENTING', tagColor: D.gold, title: 'Kuliah Subuh Jumaat', sub: 'Ustaz Hafiz · 6:00 pagi' },
              { tag: 'PROGRAM', tagColor: D.primary, title: 'Gotong Royong Masjid', sub: 'Ahad, 7 April' },
              { tag: 'KELAS',   tagColor: '#A78BFA', title: 'Pendaftaran Fardhu Ain', sub: 'Dibuka — 12 tempat' },
            ].map(a => (
              <div key={a.title} style={{
                padding: '7px 8px', borderRadius: 5,
                background: D.surface, border: `1px solid ${D.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', color: a.tagColor }}>{a.tag}</span>
                </div>
                <p style={{ fontSize: 10, fontWeight: 600, color: D.text, lineHeight: 1.3, marginBottom: 1 }}>{a.title}</p>
                <p style={{ fontSize: 9, color: D.textMuted }}>{a.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat bar */}
      <div style={{
        borderTop: `1px solid ${D.border}`,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        background: D.surface,
      }}>
        {[
          { val: '847', label: 'Jemaah' },
          { val: '12',  label: 'Program' },
          { val: '5',   label: 'Keperluan' },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '8px 0', textAlign: 'center',
            borderRight: i < 2 ? `1px solid ${D.border}` : 'none',
          }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: D.primary, lineHeight: 1, fontFamily: 'var(--font-jetbrains, monospace)' }}>{s.val}</p>
            <p style={{ fontSize: 8, color: D.textMuted, marginTop: 2, letterSpacing: '0.04em' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   STATS BAR
───────────────────────────────────────────── */
const STATS = [
  { val: 50,   suffix: '+',    label: 'Masjid Aktif' },
  { val: 8400, suffix: '+',    label: 'Jemaah Berdaftar' },
  { val: 14,   suffix: ' hari', label: 'Percubaan Percuma' },
  { val: 5,    suffix: ' min', label: 'Setup Masjid' },
]

function StatsBar() {
  const ref = useRef(null)
  const vis = useInView(ref, { once: true })
  const c0 = useCountUp(STATS[0].val, vis)
  const c1 = useCountUp(STATS[1].val, vis)
  const c2 = useCountUp(STATS[2].val, vis)
  const c3 = useCountUp(STATS[3].val, vis)
  const counts = [c0, c1, c2, c3]

  return (
    <div ref={ref} style={{
      background: D.base,
      borderTop: `1px solid ${D.border}`,
      borderBottom: `1px solid ${D.border}`,
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      }} className="lp-stats-grid">
        {STATS.map((s, i) => (
          <div key={s.label} style={{
            padding: '28px 0', textAlign: 'center',
            borderRight: i < 3 ? `1px solid ${D.border}` : 'none',
          }}>
            <p style={{
              fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800,
              color: D.primary, lineHeight: 1,
              fontFamily: 'var(--font-jetbrains, monospace)',
              marginBottom: 6,
            }}>
              {counts[i]}{s.suffix}
            </p>
            <p style={{ fontSize: 13, color: D.textMuted, letterSpacing: '0.04em' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   FEATURE DATA
───────────────────────────────────────────── */
const FEATURES = [
  {
    Icon: Clock3,
    title: 'Waktu Solat Automatik',
    tags: ['JAKIM API', 'Zon Solat', 'Realtime'],
    desc: 'Waktu solat 5 waktu dikemaskini setiap hari dari API e-Solat JAKIM berdasarkan zon solat masjid anda. Countdown timer masa solat berikutnya — jemaah tahu masa tanpa perlu tanya.',
  },
  {
    Icon: Megaphone,
    title: 'Papan Pengumuman',
    tags: ['Notifikasi Push', 'Kategori', 'Pin'],
    desc: 'AJK siarkan pengumuman, jadual kuliah, dan info khutbah dalam masa beberapa saat. Sokong kategori, tarikh tamat, dan pin ke atas. Push notification terus ke telefon jemaah.',
  },
  {
    Icon: HeartHandshake,
    title: 'Keperluan Komuniti',
    tags: ['Gotong-royong', 'Moderasi AJK'],
    desc: 'Platform digital untuk jemaah mohon bantuan atau tawarkan pertolongan — pengangkutan, makanan, kemahiran. AJK luluskan sebelum tersiar. Semangat gotong-royong Islam, kini digital.',
  },
  {
    Icon: CalendarDays,
    title: 'Slot Sukarelawan',
    tags: ['Had Slot', 'Daftar Realtime'],
    desc: 'Buka slot sukarela untuk program masjid. Jemaah daftar secara realtime — AJK nampak nama, bilangan, dan status serta-merta. Tamat zaman spreadsheet WhatsApp.',
  },
  {
    Icon: BookOpen,
    title: 'Kelas & Pendaftaran',
    tags: ['Usrah', 'Fardhu Ain', 'Tahfiz'],
    desc: 'Senaraikan kelas agama — usrah, fardhu ain, tahfiz, bahasa Arab. Jemaah tempah tempat dalam talian, kapasiti dikawal automatik.',
  },
  {
    Icon: LayoutDashboard,
    title: 'Dashboard AJK',
    tags: ['Analitik', 'Multi-pentadbir', 'Peranan'],
    desc: 'Panel pengurusan lengkap untuk Ahli Jawatankuasa. Statistik jemaah, urus kandungan semua modul, jemput pentadbir tambahan, dan kawal peranan akses.',
  },
]

function FeatureCard({ f }: { f: typeof FEATURES[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '32px 28px',
        background: hov ? D.surface : D.base,
        borderLeft: `3px solid ${hov ? D.primary : D.border}`,
        transition: 'background 0.2s, border-color 0.2s',
        boxShadow: hov ? `inset 0 0 30px ${D.primaryGlow}` : 'none',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: D.primaryPale, border: `1px solid ${D.borderGlow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <f.Icon size={18} color={D.primary} />
      </div>
      <h3 style={{
        fontFamily: 'var(--font-syne, Syne, sans-serif)',
        fontSize: 16, fontWeight: 700, color: D.text,
        letterSpacing: '-0.01em', marginBottom: 10,
      }}>{f.title}</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {f.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: D.primaryDim,
            background: D.primaryPale, border: `1px solid ${D.borderGlow}`,
            borderRadius: 4, padding: '2px 8px',
            fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
          }}>{tag}</span>
        ))}
      </div>
      <p style={{ fontSize: 14, color: D.textMuted, lineHeight: 1.75 }}>{f.desc}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PRICING DATA
───────────────────────────────────────────── */
const PLANS = [
  {
    key: 'surau', name: 'Surau', price: '59', sub: '/bulan',
    highlight: false,
    desc: 'Untuk surau kecil & masjid baharu digital.',
    features: ['Profil masjid & kemudahan', 'Waktu solat harian (JAKIM)', 'Papan pengumuman', 'Tersenarai dalam direktori Sajda', 'Alat ibadah jemaah (tasbih, wirid, qiblat)', 'Sehingga 3 pentadbir', 'Percubaan percuma 14 hari'],
  },
  {
    key: 'kariah', name: 'Kariah', price: '119', sub: '/bulan',
    highlight: true,
    desc: 'Untuk masjid aktif — pilihan paling popular.',
    features: ['Semua dalam Surau', 'Program & pendaftaran sukarela', 'Papan keperluan komuniti', 'Kelas agama & tempahan', 'Papan Janaiz + peta lokasi', 'Kumpulan halaqah', 'Notifikasi push ke jemaah', 'Cari Barang (Lost & Found)', 'Sehingga 15 pentadbir'],
  },
  {
    key: 'komuniti', name: 'Komuniti', price: '219', sub: '/bulan',
    highlight: false,
    desc: 'Untuk masjid besar — operasi penuh.',
    features: ['Semua dalam Kariah', 'Siaran langsung solat Jumaat', 'Jadual & roster Bilal mingguan', 'Jadual & roster Imam mingguan', 'Pengurusan akaun derma', 'Sijil penyertaan (PDF auto)', 'Pentadbir tanpa had', 'Sokongan prioriti < 24 jam'],
  },
]

function PricingCard({ plan, onSelect }: { plan: typeof PLANS[0]; onSelect: (planKey: string) => void }) {
  return (
    <div style={{
      padding: '32px 28px',
      background: plan.highlight ? D.surface : D.base,
      border: `1px solid ${plan.highlight ? D.primary : D.border}`,
      borderRadius: 16,
      position: 'relative',
      boxShadow: plan.highlight ? `0 0 40px ${D.primaryGlow}` : 'none',
    }}>
      {plan.highlight && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: D.primary, color: D.void,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
          textTransform: 'uppercase', padding: '4px 14px', borderRadius: 999,
          fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
        }}>
          Paling Popular
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <p style={{
          fontFamily: 'var(--font-syne, Syne, sans-serif)',
          fontSize: 18, fontWeight: 700, color: D.text, marginBottom: 6,
        }}>{plan.name}</p>
        <p style={{ fontSize: 13, color: D.textMuted, lineHeight: 1.5 }}>{plan.desc}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <span style={{
          fontFamily: 'var(--font-syne, Syne, sans-serif)',
          fontSize: 42, fontWeight: 800, color: plan.highlight ? D.primary : D.text,
          letterSpacing: '-0.02em',
        }}>RM{plan.price}</span>
        <span style={{ fontSize: 14, color: D.textMuted, marginLeft: 4 }}>{plan.sub}</span>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => onSelect(plan.key)}
        style={{
          width: '100%', padding: '12px 20px', borderRadius: 12, marginBottom: 24,
          cursor: 'pointer',
          background: plan.highlight ? D.primary : 'transparent',
          color:      plan.highlight ? D.void     : D.textSub,
          border:     plan.highlight ? 'none'      : `1px solid ${D.borderLit}`,
          fontSize: 14, fontWeight: 700,
          fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
          transition: 'filter 0.15s',
        }}
        onMouseEnter={e => { if (!plan.highlight) (e.currentTarget as HTMLButtonElement).style.background = D.primaryPale }}
        onMouseLeave={e => { if (!plan.highlight) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
      >
        Mulakan Percubaan
      </motion.button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.features.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: D.primaryPale, border: `1px solid ${D.borderGlow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={10} color={D.primary} strokeWidth={3} />
            </div>
            <span style={{ fontSize: 13, color: D.textMuted, lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: 'Sejak pakai Sajda, AJK kami tak perlu lagi buat spreadsheet atau group WhatsApp yang bersepah. Semua tersusun dalam satu tempat. Jemaah pun lebih mudah tahu program masjid.',
    name: 'Ustaz Shahril Nizam',
    role: 'Setiausaha AJK',
    mosque: 'Masjid Al-Falah, Shah Alam',
  },
  {
    quote: 'Ciri keperluan komuniti ni yang paling saya suka. Dulu ada jemaah yang minta bantuan tapi segan nak cakap terang-terang. Sekarang boleh post secara digital dan AJK coordinate bantuan dengan mudah.',
    name: 'Pn. Rohaida Baharuddin',
    role: 'AJK Kebajikan',
    mosque: 'Surau Al-Ikhlas, Puchong',
  },
  {
    quote: 'Setup dalam 10 minit. Waktu solat automatik dari JAKIM, tak payah update manual lagi. Dashboard tu cantik dan senang difahami walaupun saya bukan orang IT.',
    name: 'En. Fadzillah Othman',
    role: 'Nazir Masjid',
    mosque: 'Masjid Umar Al-Khattab, Cyberjaya',
  },
]

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   PAYMENT MODAL — collect mosque info before redirect
───────────────────────────────────────────── */
const PLAN_LABEL_MAP: Record<string, string> = { surau: 'Surau', kariah: 'Kariah', komuniti: 'Komuniti' }

function PaymentModal({
  planKey,
  onClose,
}: {
  planKey: string
  onClose: () => void
}) {
  const [mosqueName, setMosqueName] = useState('')
  const [email,      setEmail]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [errors,     setErrors]     = useState<{ name?: string; email?: string; general?: string }>({})

  function validate() {
    const e: typeof errors = {}
    if (!mosqueName.trim()) e.name  = 'Nama masjid diperlukan.'
    if (!email.trim())       e.email = 'Emel diperlukan.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Format emel tidak sah.'
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res  = await fetch('/api/billplz/create-bill', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planKey, mosque_name: mosqueName.trim(), email: email.trim(), mosque_id: 'pending' }),
      })
      const data = await res.json() as { ok: boolean; bill_url?: string; message?: string }
      if (!res.ok || !data.ok || !data.bill_url) {
        setErrors({ general: data.message ?? 'Ralat pembayaran. Sila hubungi kami di hello@sajda.my.' })
        return
      }
      window.location.href = data.bill_url
    } catch {
      setErrors({ general: 'Ralat sambungan. Cuba lagi.' })
    } finally {
      setLoading(false)
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: D.elevated, color: D.text,
    fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(8,12,10,0.80)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{    opacity: 0, y: 8,  scale: 0.97 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{
          background: D.base, border: `1px solid ${D.borderLit}`,
          borderRadius: 20, padding: '32px 28px',
          width: '100%', maxWidth: 440, position: 'relative',
          boxShadow: `0 0 60px ${D.primaryGlow}`,
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: D.textMuted, padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: D.primary, marginBottom: 8, fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)' }}>
            Pelan {PLAN_LABEL_MAP[planKey] ?? planKey}
          </p>
          <h2 style={{ fontFamily: 'var(--font-syne, Syne, sans-serif)', fontSize: 22, fontWeight: 800, color: D.text, marginBottom: 6, letterSpacing: '-0.02em' }}>
            Maklumat Masjid
          </h2>
          <p style={{ fontSize: 14, color: D.textMuted, lineHeight: 1.5 }}>
            Isi maklumat di bawah untuk diteruskan ke halaman pembayaran.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Mosque name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: D.textSub, marginBottom: 6, fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)' }}>
              Nama Masjid <span style={{ color: D.primary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="cth. Masjid Al-Falah"
              value={mosqueName}
              onChange={e => setMosqueName(e.target.value)}
              style={{
                ...inputBase,
                border: `1px solid ${errors.name ? '#EF4444' : D.borderLit}`,
              }}
              onFocus={e  => { if (!errors.name) (e.target as HTMLInputElement).style.borderColor = D.primary }}
              onBlur={e   => { (e.target as HTMLInputElement).style.borderColor = errors.name ? '#EF4444' : D.borderLit }}
            />
            {errors.name && (
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: D.textSub, marginBottom: 6, fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)' }}>
              Emel AJK <span style={{ color: D.primary }}>*</span>
            </label>
            <input
              type="email"
              placeholder="cth. ajk@masjid.my"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                ...inputBase,
                border: `1px solid ${errors.email ? '#EF4444' : D.borderLit}`,
              }}
              onFocus={e => { if (!errors.email) (e.target as HTMLInputElement).style.borderColor = D.primary }}
              onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = errors.email ? '#EF4444' : D.borderLit }}
            />
            {errors.email && (
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.email}</p>
            )}
          </div>

          {/* General error */}
          {errors.general && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)',
              borderRadius: 8, padding: '10px 12px', marginBottom: 16,
            }}>
              <X size={13} color="#EF4444" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: '#EF4444', margin: 0, lineHeight: 1.5 }}>{errors.general}</p>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            style={{
              width: '100%', padding: '13px 20px', borderRadius: 12,
              background: loading ? D.primaryDim : D.primary,
              color: D.void, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 700,
              fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10" />
                </svg>
                Memproses...
              </>
            ) : (
              <>Teruskan ke Pembayaran <ArrowRight size={15} /></>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
  const [navOpen,      setNavOpen]      = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [showModal,    setShowModal]    = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('kariah')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: D.void, color: D.text, fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)' }}>

      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <motion.header
        initial={false}
        animate={{
          background: scrolled ? 'rgba(8,12,10,0.90)' : 'transparent',
          borderBottomColor: scrolled ? D.border : 'transparent',
        }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 64, display: 'flex', alignItems: 'center',
          padding: '0 32px', justifyContent: 'space-between',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: '1px solid transparent',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image
            src={sajdaLogo} alt="Sajda" height={32}
            style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="lp-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['#features','Ciri-ciri'],['#pricing','Harga'],['#how','Cara Kerja']].map(([href, label]) => (
            <a key={href} href={href} style={{
              fontSize: 14, fontWeight: 500, color: D.textMuted,
              textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = D.text)}
              onMouseLeave={e => (e.currentTarget.style.color = D.textMuted)}
            >
              {label}
            </a>
          ))}
          <div style={{ width: 1, height: 16, background: D.border }} />
          <Link href="/login" style={{
            fontSize: 14, fontWeight: 500, color: D.textMuted,
            textDecoration: 'none', transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = D.text)}
            onMouseLeave={e => (e.currentTarget.style.color = D.textMuted)}
          >
            Log Masuk
          </Link>
          <PrimaryBtn href="/daftar" style={{ padding: '8px 18px', fontSize: 13 }}>
            Daftar Masjid
          </PrimaryBtn>
        </nav>

        <button className="lp-mobile" onClick={() => setNavOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.text, padding: 4 }}>
          {navOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            className="lp-mobile"
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
              background: D.base, borderBottom: `1px solid ${D.border}`,
              padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20,
            }}
          >
            {[['#features','Ciri-ciri'],['#pricing','Harga'],['#how','Cara Kerja']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setNavOpen(false)}
                style={{ fontSize: 16, fontWeight: 500, color: D.textSub, textDecoration: 'none' }}>
                {label}
              </a>
            ))}
            <div style={{ height: 1, background: D.border }} />
            <Link href="/login" onClick={() => setNavOpen(false)}
              style={{ fontSize: 16, color: D.textMuted, textDecoration: 'none' }}>
              Log Masuk
            </Link>
            <PrimaryBtn href="/daftar" style={{ width: '100%', justifyContent: 'center', padding: '14px 24px' }}>
              Daftar Masjid Percuma
            </PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section style={{
        paddingTop: 128, paddingBottom: 96,
        paddingLeft: 24, paddingRight: 24,
        position: 'relative', overflow: 'hidden',
        background: D.void,
      }}>
        {/* Geometric overlay */}
        <GeoOverlay opacity={0.04} />

        {/* Radial glow blobs */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative' }} className="lp-hero-grid">

          {/* Left — copy */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 14px', borderRadius: 999,
                background: D.primaryPale, border: `1px solid ${D.borderGlow}`,
                marginBottom: 28,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: D.primary }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: D.primary, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)' }}>
                  Platform Pengurusan Masjid Digital
                </span>
              </div>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
              style={{
                fontFamily: 'var(--font-syne, Syne, sans-serif)',
                fontSize: 'clamp(40px, 5.5vw, 72px)',
                fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
                color: D.text, marginBottom: 24,
              }}
            >
              Platform Digital<br />
              <span style={{ color: D.primary }}>untuk Komuniti</span><br />
              Masjid Malaysia
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: EASE }}
              style={{
                fontSize: 17, color: D.textMuted,
                lineHeight: 1.75, maxWidth: 480, marginBottom: 40,
                fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
              }}
            >
              Sajda membantu masjid dan surau mengurus waktu solat, pengumuman, keperluan jemaah, slot sukarelawan, dan kelas agama — dalam satu platform yang mudah digunakan.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32, ease: EASE }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 40 }}
            >
              <PrimaryBtn href="/daftar" style={{ padding: '14px 28px', fontSize: 15 }}>
                Daftar Masjid Percuma <ArrowRight size={16} />
              </PrimaryBtn>
              <GhostBtn href="#features" style={{ padding: '14px 24px', fontSize: 15 }}>
                Lihat Ciri-ciri <ChevronDown size={16} />
              </GhostBtn>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.44, ease: EASE }}
              style={{ display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <div style={{ display: 'flex' }}>
                {[D.primary, D.gold, '#A78BFA', '#60A5FA'].map((c, i) => (
                  <div key={c} style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: `${c}22`, border: `2px solid ${c}55`,
                    marginLeft: i === 0 ? 0 : -8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 9, color: c, fontWeight: 700 }}>
                      {['AJ','MH','SR','FZ'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill={D.gold} color={D.gold} />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: D.textMuted }}>
                  Dipercayai oleh <strong style={{ color: D.textSub }}>50+ masjid</strong> di Malaysia
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right — mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: EASE }}
            className="lp-hero-mockup"
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════ */}
      <StatsBar />

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section id="features" style={{ padding: '96px 24px', background: D.void }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
            <Label>Apa yang Sajda Tawarkan</Label>
            <h2 style={{
              fontFamily: 'var(--font-syne, Syne, sans-serif)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800, letterSpacing: '-0.025em',
              lineHeight: 1.1, color: D.text, marginBottom: 16,
            }}>
              Semua yang masjid anda perlukan,<br />
              <span style={{ color: D.primary }}>dalam satu platform.</span>
            </h2>
            <p style={{ fontSize: 17, color: D.textMuted, lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              Enam modul utama, direka khas untuk cara kerja jawatankuasa masjid Malaysia.
            </p>
          </FadeUp>

          {/* 3×2 feature grid with left-border accent cards */}
          <div className="lp-features-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            border: `1px solid ${D.border}`, borderRadius: 16, overflow: 'hidden',
          }}>
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 70}>
                <FeatureCard f={f} />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section id="how" style={{ padding: '96px 24px', background: D.base, position: 'relative', overflow: 'hidden' }}>
        <GeoOverlay opacity={0.025} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
            <Label>Bagaimana SAJDA Berfungsi</Label>
            <h2 style={{
              fontFamily: 'var(--font-syne, Syne, sans-serif)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800, letterSpacing: '-0.025em',
              lineHeight: 1.1, color: D.text,
            }}>
              Masjid anda aktif dalam<br />masa 10 minit.
            </h2>
          </FadeUp>

          <div className="lp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, position: 'relative' }}>
            {/* Connector line */}
            <div className="lp-steps-connector" style={{
              position: 'absolute', top: 28, left: 'calc(16.66% + 16px)', right: 'calc(16.66% + 16px)',
              height: 1, background: `linear-gradient(90deg, ${D.borderGlow}, ${D.borderGlow})`,
            }} />

            {[
              { n: '01', title: 'Daftar Masjid Anda', desc: 'Isi maklumat masjid dan pilih pelan yang sesuai. Proses pendaftaran mengambil masa kurang dari 5 minit.' },
              { n: '02', title: 'Konfigur Platform', desc: 'Tetapkan profil masjid, zon solat, dan aktifkan modul yang anda perlukan. Antara muka mudah — tiada pengetahuan teknikal diperlukan.' },
              { n: '03', title: 'Jemput & Mulakan', desc: 'Kongsikan pautan masjid ke jemaah melalui WhatsApp. Jemput AJK lain sebagai pentadbir. Komuniti anda terus bermula.' },
            ].map((step, i) => (
              <FadeUp key={step.n} delay={i * 80}>
                <div style={{ textAlign: 'center', padding: '0 16px', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: D.primaryPale, border: `2px solid ${D.primary}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-syne, Syne, sans-serif)',
                    fontSize: 16, fontWeight: 800, color: D.primary,
                    margin: '0 auto 24px',
                    boxShadow: `0 0 20px ${D.primaryGlow}`,
                  }}>
                    {step.n}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-syne, Syne, sans-serif)',
                    fontSize: 18, fontWeight: 700, color: D.text,
                    letterSpacing: '-0.01em', marginBottom: 12,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 15, color: D.textMuted, lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICING
      ════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: '96px 24px', background: D.void }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
            <Label>Pelan & Harga</Label>
            <h2 style={{
              fontFamily: 'var(--font-syne, Syne, sans-serif)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800, letterSpacing: '-0.025em',
              lineHeight: 1.1, color: D.text, marginBottom: 16,
            }}>
              Pelan yang sesuai untuk<br />semua saiz masjid.
            </h2>
            <p style={{ fontSize: 16, color: D.textMuted }}>Tanpa kontrak. Batalkan bila-bila masa. Mula secara percuma.</p>
          </FadeUp>

          <div className="lp-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'start' }}>
            {PLANS.map((plan, i) => (
              <FadeUp key={plan.key} delay={i * 80}>
                <PricingCard plan={plan} onSelect={planKey => { setSelectedPlan(planKey); setShowModal(true) }} />
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={320}>
            <p style={{ textAlign: 'center', fontSize: 14, color: D.textDim, marginTop: 32 }}>
              Semua pelan termasuk percubaan percuma 14 hari · Sokongan melalui e-mel
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px', background: D.base }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
            <Label>Apa Kata Pengguna Kami</Label>
            <h2 style={{
              fontFamily: 'var(--font-syne, Syne, sans-serif)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800, letterSpacing: '-0.025em',
              lineHeight: 1.1, color: D.text,
            }}>
              Dipercayai AJK masjid<br />seluruh Malaysia.
            </h2>
          </FadeUp>

          <div className="lp-testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 80}>
                <div style={{
                  padding: '32px',
                  background: D.surface,
                  border: `1px solid ${D.border}`,
                  borderRadius: 16,
                  display: 'flex', flexDirection: 'column', gap: 24,
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = D.borderLit)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = D.border)}
                >
                  <div style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={14} fill={D.gold} color={D.gold} />
                    ))}
                  </div>
                  <p style={{ fontSize: 15, color: D.textMuted, lineHeight: 1.75, flex: 1 }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${D.border}`, paddingTop: 20 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: D.primaryPale, border: `1px solid ${D.borderGlow}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: D.primary }}>
                        {t.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: D.text }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: D.textMuted }}>{t.role} · {t.mosque}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px', background: D.void, position: 'relative', overflow: 'hidden' }}>
        {/* Green radial glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(74,222,128,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <GeoOverlay opacity={0.05} />

        <FadeUp>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <Image
              src={sajdaLogo} alt="Sajda" height={36}
              style={{ objectFit: 'contain', display: 'block', margin: '0 auto 32px', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
            />
            <h2 style={{
              fontFamily: 'var(--font-syne, Syne, sans-serif)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 800, letterSpacing: '-0.025em',
              color: D.text, marginBottom: 20, lineHeight: 1.1,
            }}>
              Mulakan perjalanan digital<br />
              <span style={{ color: D.primary }}>masjid anda hari ini.</span>
            </h2>
            <p style={{ fontSize: 17, color: D.textMuted, marginBottom: 48, lineHeight: 1.7 }}>
              Percuma untuk surau kecil. Tanpa kontrak. Setup dalam 5 minit.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <PrimaryBtn href="/daftar" style={{ padding: '16px 40px', fontSize: 16 }}>
                Daftar Sekarang — Percuma <ArrowRight size={18} />
              </PrimaryBtn>
              <GhostBtn href="/login" style={{ padding: '16px 28px', fontSize: 15 }}>
                Log Masuk
              </GhostBtn>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer style={{ background: D.base, borderTop: `1px solid ${D.border}`, padding: '64px 24px 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="lp-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 64, paddingBottom: 64, borderBottom: `1px solid ${D.border}` }}>
            {/* Brand */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <Image src={sajdaLogo} alt="Sajda" height={28} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
              </div>
              <p style={{ fontSize: 14, color: D.textDim, lineHeight: 1.7, maxWidth: 260 }}>
                Platform pengurusan komuniti masjid digital untuk Malaysia. Kini dan masa hadapan.
              </p>
            </div>

            {[
              {
                heading: 'Produk',
                links: [['#features','Ciri-ciri'],['#pricing','Harga'],['#how','Cara Kerja'],['/daftar','Daftar Masjid']],
              },
              {
                heading: 'Syarikat',
                links: [['/tentang','Tentang Kami'],['/blog','Blog'],['/hubungi','Hubungi']],
              },
              {
                heading: 'Sokongan',
                links: [['/docs','Dokumentasi'],['/faq','Soalan Lazim'],['mailto:hello@sajda.my','E-mel Kami']],
              },
            ].map(col => (
              <div key={col.heading}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: D.textDim, marginBottom: 20 }}>
                  {col.heading}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(([href, label]) => (
                    <a key={href} href={href} style={{ fontSize: 14, color: D.textMuted, textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = D.text)}
                      onMouseLeave={e => (e.currentTarget.style.color = D.textMuted)}>
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: D.textDim }}>
              © 2026 Sajda. Hak cipta terpelihara.
            </p>
            <p style={{ fontSize: 13, color: D.textDim }}>
              Dibina dengan ♥ untuk komuniti masjid Malaysia · RC26 KrackedDevs
            </p>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════
          RESPONSIVE CSS
      ════════════════════════════════════════ */}
      <style>{`
        @media (min-width: 768px) { .lp-mobile { display: none !important; } }
        @media (max-width: 767px) { .lp-desktop { display: none !important; } }

        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .lp-hero-mockup { order: -1; }
          .lp-features-grid { grid-template-columns: 1fr !important; }
          .lp-pricing-grid  { grid-template-columns: 1fr !important; gap: 16px !important; }
          .lp-testimonials-grid { grid-template-columns: 1fr !important; }
          .lp-steps-grid { grid-template-columns: 1fr !important; }
          .lp-steps-connector { display: none !important; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .lp-stats-grid  { grid-template-columns: 1fr 1fr !important; }
        }

        @media (max-width: 480px) {
          .lp-footer-grid { grid-template-columns: 1fr !important; }
          .lp-stats-grid  { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Payment modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <PaymentModal
            planKey={selectedPlan}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
