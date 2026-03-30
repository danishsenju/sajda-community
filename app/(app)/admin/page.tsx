export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Users, Heart, Calendar, BookOpen, ChevronRight, AlertTriangle } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: pendingKeperluan },
    { count: activeKeperluan },
    { count: upcomingPrograms },
    { count: activeKelas },
    { count: totalBookings },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('keperluan').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('keperluan').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('programs').select('id', { count: 'exact', head: true }).eq('is_published', true).gte('program_date', new Date().toISOString().split('T')[0]),
    supabase.from('kelas').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('kelas_bookings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const hasPending = (pendingKeperluan ?? 0) > 0

  const stats = [
    { label: 'Jumlah Jemaah',      value: totalUsers       ?? 0, icon: Users,    color: '#2D6A4F', bg: '#E8F5EE', href: null },
    { label: 'Keperluan Pending',  value: pendingKeperluan ?? 0, icon: Heart,    color: '#DC2626', bg: '#FEF2F2', href: '/admin/keperluan', alert: true },
    { label: 'Keperluan Aktif',    value: activeKeperluan  ?? 0, icon: Heart,    color: '#2D6A4F', bg: '#E8F5EE', href: '/admin/keperluan' },
    { label: 'Program Akan Datang',value: upcomingPrograms ?? 0, icon: Calendar, color: '#B78628', bg: '#FEF9EC', href: '/admin/programs' },
    { label: 'Kelas Aktif',        value: activeKelas      ?? 0, icon: BookOpen, color: '#7C3AED', bg: '#F5F3FF', href: '/admin/kelas' },
    { label: 'Tempahan Kelas',     value: totalBookings    ?? 0, icon: BookOpen, color: '#1D4ED8', bg: '#EFF6FF', href: '/admin/kelas' },
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>
          Panel Admin
        </p>
        <h1 className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
      </div>

      {/* Alert banner */}
      {hasPending && (
        <div className="flex items-center gap-3 rounded-xl border p-4 mb-6"
          style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#DC2626' }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: '#DC2626' }}>
              {pendingKeperluan} keperluan menunggu kelulusan
            </p>
            <p className="text-xs" style={{ fontFamily: 'var(--font-jakarta)', color: '#EF4444' }}>
              Semak dan luluskan keperluan komuniti yang baharu
            </p>
          </div>
          <Link href="/admin/keperluan"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
            style={{ background: '#DC2626', color: '#fff', fontFamily: 'var(--font-jakarta)' }}>
            Semak
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg, href, alert }, i) => {
          const isAlert = alert && value > 0
          const content = (
            <div className="rounded-2xl border p-5 animate-slideUp transition-all hover:shadow-md"
              style={{
                background: isAlert ? '#FEF2F2' : 'var(--surface)',
                borderColor: isAlert ? '#FECACA' : 'var(--border)',
                animationDelay: `${i * 0.05}s`,
              }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isAlert ? '#FEE2E2' : bg }}>
                  <Icon className="w-5 h-5" style={{ color: isAlert ? '#DC2626' : color }} />
                </div>
                {href && <ChevronRight className="w-4 h-4 mt-1" style={{ color: 'var(--text-dim)' }} />}
              </div>
              <p className="text-3xl font-bold mb-1"
                style={{ fontFamily: 'var(--font-playfair)', color: isAlert ? '#DC2626' : 'var(--text-primary)' }}>
                {value}
              </p>
              <p className="text-xs" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                {label}
              </p>
              {isAlert && (
                <p className="text-[11px] font-semibold mt-1.5" style={{ fontFamily: 'var(--font-jakarta)', color: '#DC2626' }}>
                  Perlu tindakan
                </p>
              )}
            </div>
          )

          return href ? (
            <Link key={label} href={href} className="block">
              {content}
            </Link>
          ) : (
            <div key={label}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
