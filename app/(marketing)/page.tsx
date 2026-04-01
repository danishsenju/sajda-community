'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Clock3, Megaphone, HeartHandshake, CalendarDays,
  BookOpen, LayoutDashboard, ArrowRight, Check,
  Menu, X, ChevronDown, Users, Building2, Star,
  MapPin, Bell, LucideIcon,
} from 'lucide-react'
import sajdaLogo from '@/images/sajda-logo.png'

/* ─────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────── */
const T = {
  ivory:       '#FAFAF7',
  stone:       '#EDEAE3',
  sage:        '#EEF2EF',
  border:      '#E2DDD6',
  borderMid:   '#D0CABF',

  gold:        '#B5924C',
  goldDark:    '#8F7038',
  goldPale:    '#F7F0E3',
  goldBorder:  '#D9BA82',

  teal:        '#2D7D6F',
  tealDark:    '#1F5C52',
  tealPale:    '#EBF4F2',
  tealBorder:  '#9DCEC7',

  text:        '#1A1A2E',
  textSub:     '#4A4A5A',
  textMuted:   '#7A7A8A',
  white:       '#FAFAF7',
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
   SHARED: SECTION LABEL
───────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      display: 'inline-block',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.10em',
      textTransform: 'uppercase', color: T.teal,
      marginBottom: 16,
    }}>
      {children}
    </p>
  )
}

/* ─────────────────────────────────────────────
   SHARED: BUTTONS
───────────────────────────────────────────── */
function GoldBtn({ children, href, style = {} }: {
  children: React.ReactNode; href: string; style?: React.CSSProperties
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex' }}>
      <Link href={href} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 24px', borderRadius: 8,
        fontSize: 14, fontWeight: 700, textDecoration: 'none',
        background: T.gold, color: T.ivory,
        border: `1.5px solid ${T.goldDark}`,
        letterSpacing: '0.01em',
        transition: 'background 0.15s',
        ...style,
      }}
        onMouseEnter={e => (e.currentTarget.style.background = T.goldDark)}
        onMouseLeave={e => (e.currentTarget.style.background = T.gold)}
      >
        {children}
      </Link>
    </motion.div>
  )
}

function OutlineBtn({ children, href, style = {} }: {
  children: React.ReactNode; href: string; style?: React.CSSProperties
}) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} style={{ display: 'inline-flex' }}>
      <Link href={href} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 24px', borderRadius: 8,
        fontSize: 14, fontWeight: 600, textDecoration: 'none',
        background: 'transparent', color: T.text,
        border: `1.5px solid ${T.border}`,
        letterSpacing: '0.01em',
        transition: 'border-color 0.15s, color 0.15s',
        ...style,
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = T.gold
          ;(e.currentTarget as HTMLElement).style.color = T.goldDark
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = T.border
          ;(e.currentTarget as HTMLElement).style.color = T.text
        }}
      >
        {children}
      </Link>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   CSS MOCKUP — Dashboard Preview
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
      border: `1.5px solid ${T.border}`,
      borderRadius: 16, overflow: 'hidden',
      background: T.ivory,
      fontFamily: 'var(--font-dm-sans, sans-serif)',
    }}>
      {/* Browser chrome */}
      <div style={{
        background: T.stone, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#E57373','#FFB74D','#81C784'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
          ))}
        </div>
        <div style={{
          flex: 1, height: 22, borderRadius: 4, background: T.ivory,
          border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', paddingLeft: 8,
          fontSize: 10, color: T.textMuted,
        }}>
          sajda.my/masjid-saujana-utama
        </div>
      </div>

      {/* App header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${T.border}`,
        background: T.ivory,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 14, height: 14, border: `2px solid ${T.ivory}`, borderRadius: 2, transform: 'rotate(45deg)', borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Masjid Saujana Utama</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Bell size={13} color={T.textMuted} />
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9, color: T.ivory, fontWeight: 700 }}>AJ</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Prayer times panel */}
        <div style={{ padding: '14px 14px 16px', borderRight: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted, marginBottom: 10 }}>Waktu Solat Hari Ini</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {prayers.map(p => (
              <div key={p.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '5px 8px', borderRadius: 5,
                background: p.next ? T.tealPale : 'transparent',
                border: `1px solid ${p.next ? T.tealBorder : 'transparent'}`,
              }}>
                <span style={{ fontSize: 10, fontWeight: p.next ? 700 : 400, color: p.done ? T.textMuted : p.next ? T.teal : T.text }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: p.done ? T.textMuted : p.next ? T.teal : T.textSub, fontFamily: 'monospace' }}>
                  {p.time}
                </span>
              </div>
            ))}
          </div>
          {/* Countdown */}
          <div style={{ marginTop: 10, padding: '8px', background: T.teal, borderRadius: 6, textAlign: 'center' }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Asar dalam</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: T.ivory, fontFamily: 'monospace', lineHeight: 1 }}>2:46:18</p>
          </div>
        </div>

        {/* Announcements panel */}
        <div style={{ padding: '14px 14px 16px' }}>
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted, marginBottom: 10 }}>Pengumuman</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { tag: 'PENTING', tagColor: T.gold, title: 'Kuliah Subuh Jumaat', sub: 'Ustaz Hafiz · 6:00 pagi' },
              { tag: 'PROGRAM', tagColor: T.teal, title: 'Gotong Royong Masjid', sub: 'Ahad, 7 April' },
              { tag: 'KELAS', tagColor: '#7C6A9A', title: 'Pendaftaran Fardhu Ain', sub: 'Dibuka — 12 tempat' },
            ].map(a => (
              <div key={a.title} style={{
                padding: '7px 8px', borderRadius: 5,
                background: T.stone, border: `1px solid ${T.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', color: a.tagColor }}>{a.tag}</span>
                </div>
                <p style={{ fontSize: 10, fontWeight: 600, color: T.text, lineHeight: 1.3, marginBottom: 1 }}>{a.title}</p>
                <p style={{ fontSize: 9, color: T.textMuted }}>{a.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom stat bar */}
      <div style={{
        borderTop: `1px solid ${T.border}`,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        background: T.stone,
      }}>
        {[
          { val: '847', label: 'Jemaah' },
          { val: '12', label: 'Program' },
          { val: '5', label: 'Keperluan' },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '8px 0', textAlign: 'center',
            borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
          }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: T.text, lineHeight: 1 }}>{s.val}</p>
            <p style={{ fontSize: 8, color: T.textMuted, marginTop: 2, letterSpacing: '0.04em' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   FEATURE CARD DATA
───────────────────────────────────────────── */
const FEATURES = [
  {
    Icon: Clock3,
    title: 'Waktu Solat Automatik',
    tags: ['JAKIM API', 'Zon Solat', 'Realtime'],
    desc: 'Waktu solat 5 waktu dikemaskini setiap hari dari API e-Solat JAKIM berdasarkan zon solat masjid anda. Paparan countdown timer masa solat berikutnya — jemaah tahu masa tanpa perlu tanya.',
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
    desc: 'Platform digital untuk jemaah mohon bantuan atau tawarkan pertolongan — pengangkutan, makanan, kemahiran. AJK luluskan sebelum tersiar awam. Semangat gotong-royong Islam, kini digital.',
  },
  {
    Icon: CalendarDays,
    title: 'Slot Sukarelawan',
    tags: ['Had Slot', 'Daftar Realtime'],
    desc: 'Buka slot sukarela untuk program masjid dengan bilangan had. Jemaah daftar secara realtime — AJK nampak nama, bilangan, dan status serta-merta. Tamat zaman spreadsheet WhatsApp.',
  },
  {
    Icon: BookOpen,
    title: 'Kelas & Pendaftaran',
    tags: ['Usrah', 'Fardhu Ain', 'Tahfiz'],
    desc: 'Senaraikan kelas agama — usrah, fardhu ain, tahfiz, bahasa Arab. Jemaah tempah tempat dalam talian, kapasiti dikawal automatik, dan ustaz menerima senarai peserta lengkap.',
  },
  {
    Icon: LayoutDashboard,
    title: 'Dashboard AJK',
    tags: ['Analitik', 'Multi-pentadbir', 'Peranan'],
    desc: 'Panel pengurusan lengkap untuk Ahli Jawatankuasa Masjid. Statistik jemaah, urus kandungan semua modul, jemput pentadbir tambahan, dan kawal peranan akses setiap AJK.',
  },
]

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
export default function LandingPage() {
  const [navOpen, setNavOpen]   = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: T.ivory, color: T.text, fontFamily: 'var(--font-dm-sans, Plus Jakarta Sans, sans-serif)' }}>

      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <motion.header
        initial={false}
        animate={{
          background: scrolled ? 'rgba(250,250,247,0.92)' : T.ivory,
          borderBottomColor: scrolled ? T.border : 'transparent',
        }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 64, display: 'flex', alignItems: 'center',
          padding: '0 32px', justifyContent: 'space-between',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: '1px solid transparent',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Image src={sajdaLogo} alt="Sajda" height={36} style={{ objectFit: 'contain' }} />
        </Link>

        {/* Desktop nav */}
        <nav className="lp-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['#features','Ciri-ciri'],['#pricing','Harga'],['#how','Cara Kerja']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 14, fontWeight: 500, color: T.textSub, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = T.text)}
              onMouseLeave={e => (e.currentTarget.style.color = T.textSub)}>
              {label}
            </a>
          ))}
          <div style={{ width: 1, height: 16, background: T.border }} />
          <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: T.textSub, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = T.text)}
            onMouseLeave={e => (e.currentTarget.style.color = T.textSub)}>
            Log Masuk
          </Link>
          <GoldBtn href="/daftar" style={{ padding: '8px 18px', fontSize: 13 }}>
            Daftar Masjid
          </GoldBtn>
        </nav>

        <button className="lp-mobile" onClick={() => setNavOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text, padding: 4 }}>
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
              background: T.ivory, borderBottom: `1px solid ${T.border}`,
              padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20,
            }}
          >
            {[['#features','Ciri-ciri'],['#pricing','Harga'],['#how','Cara Kerja']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setNavOpen(false)}
                style={{ fontSize: 16, fontWeight: 500, color: T.textSub, textDecoration: 'none' }}>
                {label}
              </a>
            ))}
            <div style={{ height: 1, background: T.border }} />
            <Link href="/login" onClick={() => setNavOpen(false)}
              style={{ fontSize: 16, color: T.textSub, textDecoration: 'none' }}>
              Log Masuk
            </Link>
            <GoldBtn href="/daftar" style={{ width: '100%', justifyContent: 'center', padding: '14px 24px' }}>
              Daftar Masjid Percuma
            </GoldBtn>
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
        background: T.ivory,
      }}>
        {/* Subtle Islamic geometric background */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }} aria-hidden>
          <defs>
            <pattern id="geo-lp" x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse">
              <polygon points="36,5 42,22 60,22 46,33 52,50 36,40 20,50 26,33 12,22 30,22"
                fill="none" stroke={T.teal} strokeWidth="0.8" />
              <rect x="23" y="23" width="26" height="26" fill="none" stroke={T.teal} strokeWidth="0.4" transform="rotate(45 36 36)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo-lp)" />
        </svg>

        {/* Warm gold glow top-right */}
        <div style={{ position: 'absolute', top: -96, right: -96, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,146,76,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Teal glow bottom-left */}
        <div style={{ position: 'absolute', bottom: -64, left: -64, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,125,111,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

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
                padding: '5px 12px', borderRadius: 999,
                background: T.tealPale, border: `1px solid ${T.tealBorder}`,
                marginBottom: 24,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: T.teal, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
                fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em',
                color: T.text, marginBottom: 24,
              }}
            >
              Platform Digital<br />
              <span style={{ color: T.teal }}>untuk Komuniti</span><br />
              Masjid Malaysia
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: EASE }}
              style={{
                fontSize: 17, color: T.textSub,
                lineHeight: 1.75, maxWidth: 480, marginBottom: 40,
              }}
            >
              Sajda membantu masjid dan surau mengurus waktu solat, pengumuman, keperluan jemaah, slot sukarelawan, dan kelas agama — dalam satu platform yang mudah digunakan.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32, ease: EASE }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 32 }}
            >
              <GoldBtn href="/daftar" style={{ padding: '13px 28px', fontSize: 15 }}>
                Daftar Masjid Percuma <ArrowRight size={16} />
              </GoldBtn>
              <OutlineBtn href="#features" style={{ padding: '13px 24px', fontSize: 15 }}>
                Lihat Ciri-ciri <ChevronDown size={16} />
              </OutlineBtn>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.44, ease: EASE }}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              {/* Avatars */}
              <div style={{ display: 'flex' }}>
                {['#2D7D6F','#B5924C','#7C6A9A','#4A7C9A'].map((c, i) => (
                  <div key={c} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c,
                    border: `2px solid ${T.ivory}`, marginLeft: i === 0 ? 0 : -8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 9, color: T.ivory, fontWeight: 700 }}>
                      {['AJ','MH','SR','FZ'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} fill={T.gold} color={T.gold} />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: T.textMuted }}>
                  Dipercayai oleh <strong style={{ color: T.textSub }}>50+ masjid</strong> di Malaysia
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
      <section id="features" style={{ padding: '96px 24px', background: T.ivory }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
            <Label>Apa yang Sajda Tawarkan</Label>
            <h2 style={{
              fontFamily: 'var(--font-syne, Syne, sans-serif)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700, letterSpacing: '-0.025em',
              lineHeight: 1.15, color: T.text, marginBottom: 16,
            }}>
              Semua yang masjid anda perlukan,<br />
              <span style={{ color: T.teal }}>dalam satu platform.</span>
            </h2>
            <p style={{ fontSize: 17, color: T.textSub, lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              Enam modul utama, direka khas untuk cara kerja jawatankuasa masjid Malaysia.
            </p>
          </FadeUp>

          <div className="lp-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: T.border, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
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
      <section id="how" style={{ padding: '96px 24px', background: T.stone }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
            <Label>Bagaimana SAJDA Berfungsi</Label>
            <h2 style={{
              fontFamily: 'var(--font-syne, Syne, sans-serif)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700, letterSpacing: '-0.025em',
              lineHeight: 1.15, color: T.text,
            }}>
              Masjid anda aktif dalam<br />masa 10 minit.
            </h2>
          </FadeUp>

          <div className="lp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, position: 'relative' }}>
            {/* Connector line desktop */}
            <div className="lp-steps-connector" style={{
              position: 'absolute', top: 28, left: 'calc(16.66% + 16px)', right: 'calc(16.66% + 16px)',
              height: 1, background: `linear-gradient(90deg, ${T.goldBorder}, ${T.goldBorder})`,
              opacity: 0.5,
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
                    background: T.gold, color: T.ivory,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-syne, Syne, sans-serif)',
                    fontSize: 16, fontWeight: 800,
                    margin: '0 auto 24px',
                    border: `3px solid ${T.ivory}`,
                    outline: `1px solid ${T.goldBorder}`,
                  }}>
                    {step.n}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-syne, Syne, sans-serif)',
                    fontSize: 18, fontWeight: 700, color: T.text,
                    letterSpacing: '-0.01em', marginBottom: 12,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 15, color: T.textSub, lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICING
      ════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: '96px 24px', background: T.ivory }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
            <Label>Pelan & Harga</Label>
            <h2 style={{
              fontFamily: 'var(--font-syne, Syne, sans-serif)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700, letterSpacing: '-0.025em',
              lineHeight: 1.15, color: T.text, marginBottom: 16,
            }}>
              Pelan yang sesuai untuk<br />semua saiz masjid.
            </h2>
            <p style={{ fontSize: 16, color: T.textMuted }}>Tanpa kontrak. Batalkan bila-bila masa. Mula secara percuma.</p>
          </FadeUp>

          <div className="lp-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'start' }}>
            {PLANS.map((plan, i) => (
              <FadeUp key={plan.key} delay={i * 80}>
                <PricingCard plan={plan} />
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={320}>
            <p style={{ textAlign: 'center', fontSize: 14, color: T.textMuted, marginTop: 32 }}>
              Semua pelan termasuk percubaan percuma 14 hari · Sokongan melalui e-mel
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px', background: T.stone }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
            <Label>Apa Kata Pengguna Kami</Label>
            <h2 style={{
              fontFamily: 'var(--font-syne, Syne, sans-serif)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700, letterSpacing: '-0.025em',
              lineHeight: 1.15, color: T.text,
            }}>
              Dipercayai AJK masjid<br />seluruh Malaysia.
            </h2>
          </FadeUp>

          <div className="lp-testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 80}>
                <div style={{
                  padding: '32px',
                  background: T.ivory,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 16,
                  display: 'flex', flexDirection: 'column', gap: 24,
                }}>
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={14} fill={T.gold} color={T.gold} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p style={{ fontSize: 15, color: T.textSub, lineHeight: 1.75, flex: 1 }}>
                    "{t.quote}"
                  </p>
                  {/* Attribution */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: T.teal,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.ivory }}>
                        {t.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: T.textMuted }}>{t.role} · {t.mosque}</p>
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
      <section style={{ padding: '96px 24px', background: T.gold }}>
        <FadeUp>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            {/* Islamic pattern overlay */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }} aria-hidden>
              <defs>
                <pattern id="geo-cta" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <polygon points="30,4 35,18 50,18 39,27 43,42 30,33 17,42 21,27 10,18 25,18"
                    fill="none" stroke={T.ivory} strokeWidth="0.9" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#geo-cta)" />
            </svg>
            <div style={{ position: 'relative' }}>
              <Image src={sajdaLogo} alt="Sajda" height={36} style={{ objectFit: 'contain', display: 'block', margin: '0 auto 24px', filter: 'brightness(0) invert(1)' }} />
              <h2 style={{
                fontFamily: 'var(--font-syne, Syne, sans-serif)',
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 700, letterSpacing: '-0.025em',
                color: T.ivory, marginBottom: 16, lineHeight: 1.2,
              }}>
                Mulakan perjalanan digital<br />masjid anda hari ini.
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(250,250,247,0.82)', marginBottom: 40, lineHeight: 1.7 }}>
                Percuma untuk surau kecil. Tanpa kontrak. Setup dalam 5 minit.
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex' }}>
                <Link href="/daftar" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '16px 40px', borderRadius: 8,
                  fontSize: 16, fontWeight: 700, textDecoration: 'none',
                  background: T.ivory, color: T.goldDark,
                  border: `1.5px solid rgba(250,250,247,0.3)`,
                  letterSpacing: '0.01em',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = T.goldPale)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = T.ivory)}
                >
                  Daftar Sekarang — Percuma <ArrowRight size={18} />
                </Link>
              </motion.div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer style={{ background: T.text, padding: '64px 24px 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="lp-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 64, paddingBottom: 64, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
            {/* Brand */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <Image src={sajdaLogo} alt="Sajda" height={32} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
              </div>
              <p style={{ fontSize: 14, color: 'rgba(250,250,247,0.55)', lineHeight: 1.7, maxWidth: 260 }}>
                Platform pengurusan komuniti masjid digital untuk Malaysia. Kini dan masa hadapan.
              </p>
            </div>

            {/* Links */}
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
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(250,250,247,0.4)', marginBottom: 20 }}>
                  {col.heading}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(([href, label]) => (
                    <a key={href} href={href} style={{ fontSize: 14, color: 'rgba(250,250,247,0.6)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = T.ivory)}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,250,247,0.6)')}>
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'rgba(250,250,247,0.35)' }}>
              © {new Date().getFullYear()} Sajda · Platform Komuniti Masjid Digital Malaysia
            </p>
            <p style={{ fontSize: 13, color: 'rgba(250,250,247,0.35)' }}>
              Dibina dengan ❤️ untuk komuniti Muslim Malaysia
            </p>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════
          RESPONSIVE + ANIMATION CSS
      ════════════════════════════════════════ */}
      <style>{`
        /* Nav */
        @media (max-width: 680px) {
          .lp-desktop { display: none !important; }
          .lp-mobile  { display: flex !important; }
        }
        @media (min-width: 681px) {
          .lp-mobile { display: none !important; }
        }

        /* Hero */
        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .lp-hero-mockup { justify-content: flex-start !important; }
        }

        /* Features */
        @media (max-width: 860px) {
          .lp-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .lp-features-grid { grid-template-columns: 1fr !important; }
        }

        /* Steps */
        @media (max-width: 768px) {
          .lp-steps-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .lp-steps-connector { display: none !important; }
        }

        /* Pricing */
        @media (max-width: 860px) {
          .lp-pricing-grid { grid-template-columns: 1fr !important; max-width: 480px; margin-left: auto; margin-right: auto; }
        }

        /* Testimonials */
        @media (max-width: 860px) {
          .lp-testimonials-grid { grid-template-columns: 1fr !important; max-width: 560px; margin-left: auto; margin-right: auto; }
        }

        /* Footer */
        @media (max-width: 860px) {
          .lp-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 480px) {
          .lp-footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────
   STATS BAR (separate component for count-up)
───────────────────────────────────────────── */
function StatsBar() {
  const ref = useRef(null)
  const vis = useInView(ref, { once: true, margin: '-40px 0px' })
  const mosques = useCountUp(50, vis)
  const prayers = useCountUp(5, vis, 0.8)

  const stats = [
    { val: `${prayers} Waktu Solat`, label: 'Dipaparkan automatik setiap hari' },
    { val: '100% JAKIM', label: 'Data waktu solat dari sumber rasmi' },
    { val: 'Multi-tenant', label: 'Setiap masjid instance tersendiri' },
    { val: '3 Pelan Harga', label: 'Bermula dari percuma' },
  ]

  return (
    <div ref={ref} style={{ background: T.stone, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        <div className="lp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={vis ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
              style={{
                padding: '32px 24px',
                borderRight: i < stats.length - 1 ? `1px solid ${T.border}` : 'none',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}
            >
              <p style={{
                fontFamily: 'var(--font-syne, Syne, sans-serif)',
                fontSize: 20, fontWeight: 800, color: T.text, lineHeight: 1,
              }}>
                {s.val}
              </p>
              <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .lp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 420px) {
          .lp-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────────── */
function FeatureCard({ f }: { f: typeof FEATURES[number] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '32px',
        background: hov ? T.tealPale : T.ivory,
        transition: 'background 0.2s',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top border accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: hov ? T.teal : 'transparent',
        transition: 'background 0.2s',
      }} />

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, marginBottom: 20,
        background: hov ? T.teal : T.tealPale,
        border: `1.5px solid ${hov ? T.teal : T.tealBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        <f.Icon size={20} color={hov ? T.ivory : T.teal} strokeWidth={1.8} />
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-syne, Syne, sans-serif)',
        fontSize: 17, fontWeight: 700, color: T.text,
        marginBottom: 12, letterSpacing: '-0.01em', lineHeight: 1.3,
      }}>
        {f.title}
      </h3>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {f.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: T.teal,
            background: T.tealPale, border: `1px solid ${T.tealBorder}`,
            padding: '2px 8px', borderRadius: 999,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Desc */}
      <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.75, marginBottom: 16 }}>
        {f.desc}
      </p>

      {/* Link */}
      <a href="#pricing" style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 13, fontWeight: 600, color: T.teal,
        textDecoration: 'none',
        transition: 'gap 0.15s',
      }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.gap = '8px')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.gap = '4px')}
      >
        Ketahui lebih lanjut <ArrowRight size={13} />
      </a>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PRICING CARD
───────────────────────────────────────────── */
function PricingCard({ plan }: { plan: typeof PLANS[number] }) {
  return (
    <motion.div
      whileHover={plan.highlight ? { scale: 1.02 } : { y: -4 }}
      transition={{ duration: 0.2, ease: EASE }}
      style={{
        padding: '32px',
        background: plan.highlight ? T.tealPale : T.ivory,
        border: `${plan.highlight ? 1.5 : 1}px solid ${plan.highlight ? T.teal : T.border}`,
        borderRadius: 16,
        position: 'relative',
      }}
    >
      {plan.highlight && (
        <div style={{
          position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
          background: T.teal, color: T.ivory,
          fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
          padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap',
          textTransform: 'uppercase',
        }}>
          PALING POPULAR
        </div>
      )}

      {/* Plan name */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: plan.highlight ? T.teal : T.textMuted, marginBottom: 16 }}>
        {plan.name}
      </p>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: T.textMuted, fontWeight: 500 }}>RM</span>
        <span style={{ fontFamily: 'var(--font-syne, Syne, sans-serif)', fontSize: 48, fontWeight: 800, lineHeight: 1, color: plan.highlight ? T.teal : T.text }}>
          {plan.price}
        </span>
        <span style={{ fontSize: 14, color: T.textMuted }}>{plan.sub}</span>
      </div>

      <p style={{ fontSize: 14, color: T.textSub, marginBottom: 24, lineHeight: 1.6 }}>{plan.desc}</p>

      {/* CTA */}
      {plan.highlight ? (
        <GoldBtn href={`/daftar?plan=${plan.key}`} style={{ width: '100%', justifyContent: 'center', marginBottom: 24 }}>
          Mulakan — {plan.name}
        </GoldBtn>
      ) : (
        <OutlineBtn href={`/daftar?plan=${plan.key}`} style={{ width: '100%', justifyContent: 'center', marginBottom: 24 }}>
          Mulakan — {plan.name}
        </OutlineBtn>
      )}

      <div style={{ height: 1, background: plan.highlight ? T.tealBorder : T.border, marginBottom: 24 }} />

      {/* Features list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {plan.features.map(feat => (
          <div key={feat} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: plan.highlight ? T.teal : T.tealPale,
              border: `1px solid ${plan.highlight ? T.teal : T.tealBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={10} color={plan.highlight ? T.ivory : T.teal} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 14, color: T.textSub, lineHeight: 1.5 }}>{feat}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
