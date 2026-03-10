'use client'

import Link from 'next/link'
import { Heart, Calendar, BookOpen, Landmark, HandCoins, ArrowRight, LucideIcon } from 'lucide-react'

const QUICK_ACCESS: { href: string; icon: LucideIcon; label: string; desc: string; color: string; bg: string }[] = [
  { href: '/keperluan', icon: Heart,      label: 'Keperluan',   desc: 'Minta atau hulur bantuan',   color: '#2D6A4F', bg: '#E8F5EE' },
  { href: '/program',   icon: Calendar,   label: 'Program',     desc: 'Sertai program & sukarela',  color: '#B78628', bg: '#FEF9EC' },
  { href: '/kelas',     icon: BookOpen,   label: 'Kelas',       desc: 'Kelas quran & agama',        color: '#1D4ED8', bg: '#EFF6FF' },
  { href: '/derma',     icon: HandCoins,  label: 'Derma',       desc: 'Sokong masjid kita',         color: '#B78628', bg: '#FEF9EC' },
  { href: '/masjid',    icon: Landmark,   label: 'Info Masjid', desc: 'Lokasi & kemudahan',         color: '#7C3AED', bg: '#F5F3FF' },
]

export function QuickAccessCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
      {QUICK_ACCESS.map(({ href, icon: Icon, label, desc, color, bg }, i) => (
        <Link key={href} href={href}>
          <div
            className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 p-4 animate-slideUp delay-${i + 2} hover:-translate-y-0.5`}
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = `${color}40`
              el.style.boxShadow = `0 4px 16px ${color}10`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--border)'
              el.style.boxShadow = 'none'
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>

            <p
              className="font-bold text-sm mb-0.5"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}
            >
              {label}
            </p>
            <p
              className="text-[11px] leading-snug"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}
            >
              {desc}
            </p>

            <ArrowRight
              className="absolute bottom-3 right-3 w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-all group-hover:translate-x-0.5"
              style={{ color }}
            />
          </div>
        </Link>
      ))}
    </div>
  )
}
