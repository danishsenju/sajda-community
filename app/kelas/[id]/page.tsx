export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, User, MapPin, Calendar, Users } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { BookingButton } from './BookingButton'

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  quran:       { label: 'Al-Quran',    color: '#2D6A4F', bg: '#E8F5EE' },
  fiqh:        { label: 'Fiqh',        color: '#B78628', bg: '#FEF9EC' },
  akhlak:      { label: 'Akhlak',      color: '#1D4ED8', bg: '#EFF6FF' },
  bahasa_arab: { label: 'Bahasa Arab', color: '#7C3AED', bg: '#F5F3FF' },
  lain:        { label: 'Lain-lain',   color: '#6B7280', bg: '#F9FAFB' },
}

export default async function KelasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: kelas } = await supabase
    .from('kelas')
    .select('*, kelas_bookings(id, user_id, status)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!kelas) notFound()

  const bookings = (kelas.kelas_bookings as unknown as { id: string; user_id: string; status: string }[]) ?? []
  const activeCount = bookings.filter((b) => b.status === 'active').length
  const cap = kelas.capacity
  const full = cap !== null && activeCount >= cap
  const cfg = CATEGORY_CONFIG[kelas.category] ?? CATEGORY_CONFIG.lain

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/kelas"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-[var(--primary)]"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
          <ArrowLeft className="w-4 h-4" /> Kelas &amp; Ilmu
        </Link>

        <div className="rounded-2xl border overflow-hidden mb-5 animate-slideUp"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="h-1" style={{ background: cfg.color }} />

          <div className="p-6">
            <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4"
              style={{ background: cfg.bg, color: cfg.color, fontFamily: 'var(--font-jakarta)' }}>
              {cfg.label}
            </span>

            <h1 className="text-2xl font-bold mb-5"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
              {kelas.title}
            </h1>

            <div className="flex flex-col gap-3 mb-5">
              {kelas.ustaz_name && (
                <div className="flex items-center gap-3 text-sm"
                  style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                  <User className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                  {kelas.ustaz_name}
                </div>
              )}
              {kelas.schedule_day && (
                <div className="flex items-center gap-3 text-sm"
                  style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                  <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                  Setiap {kelas.schedule_day}
                </div>
              )}
              {kelas.time_start && (
                <div className="flex items-center gap-3 text-sm"
                  style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                  {formatTime(kelas.time_start)}
                  {kelas.time_end && ` — ${formatTime(kelas.time_end)}`}
                </div>
              )}
              {kelas.location && (
                <div className="flex items-center gap-3 text-sm"
                  style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                  {kelas.location}
                </div>
              )}
              {kelas.start_date && (
                <div className="flex items-center gap-3 text-sm"
                  style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                  <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                  {formatDate(kelas.start_date)}
                  {kelas.end_date && ` — ${formatDate(kelas.end_date)}`}
                </div>
              )}
            </div>

            {kelas.description && (
              <p className="text-sm leading-relaxed pt-4 border-t"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)', borderColor: 'var(--border)', lineHeight: 1.8 }}>
                {kelas.description}
              </p>
            )}
          </div>
        </div>

        {/* Booking card */}
        <div className="rounded-2xl border p-5 animate-slideUp"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
              Tempahan Kelas
            </h2>
            {cap !== null && (
              <div className="flex items-center gap-1.5 text-sm"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                <Users className="w-4 h-4" style={{ color: cfg.color }} />
                {activeCount}/{cap} tempat
              </div>
            )}
          </div>

          {cap !== null && (
            <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((activeCount / cap) * 100, 100)}%`,
                  background: full ? '#9CA3AF' : cfg.color,
                }} />
            </div>
          )}

          {full ? (
            <p className="text-sm text-center py-2"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Maaf, semua tempat sudah ditempah.
            </p>
          ) : (
            <BookingButton kelasId={kelas.id} />
          )}
        </div>
      </div>
    </div>
  )
}
