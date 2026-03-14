export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import { Badge } from '@/components/ui/Badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { VolunteerButton } from './VolunteerButton'
import { KenaganPanel } from './KenaganPanel'
import { MemoriesFeed } from './MemoriesFeed'

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  solat:         { label: 'Solat',         color: '#2D6A4F', bg: '#E8F5EE' },
  kebajikan:     { label: 'Kebajikan',     color: '#1D4ED8', bg: '#EFF6FF' },
  ramadan:       { label: 'Ramadan',       color: '#B78628', bg: '#FEF9EC' },
  gotong_royong: { label: 'Gotong Royong', color: '#7C3AED', bg: '#F5F3FF' },
  umum:          { label: 'Umum',          color: '#6B7280', bg: '#F9FAFB' },
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: program } = await supabase
    .from('programs')
    .select('*, volunteer_signups(id, user_id, status)')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!program) notFound()

  const signups = (program.volunteer_signups as unknown as { id: string; user_id: string; status: string }[]) ?? []
  const confirmedCount = signups.filter((s) => s.status === 'confirmed').length

  // Check if current user has a confirmed signup
  const userSignedUp = user ? signups.some(s => s.user_id === user.id && s.status === 'confirmed') : false

  // Fetch existing memory for this user (if any)
  const existingMemory = user && userSignedUp
    ? await supabase
        .from('program_memories')
        .select('reflection')
        .eq('program_id', id)
        .eq('user_id', user.id)
        .single()
        .then(r => r.data?.reflection ?? null)
    : null
  const slots = program.volunteer_slots
  const slotsFull = slots > 0 && confirmedCount >= slots
  const isPast = new Date(program.program_date) < new Date()
  const cfg = CATEGORY_CONFIG[program.category] ?? CATEGORY_CONFIG.umum

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/program"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-[var(--primary)]"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
          <ArrowLeft className="w-4 h-4" /> Program &amp; Sukarela
        </Link>

        <div className="rounded-2xl border overflow-hidden mb-5 animate-slideUp"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="h-1" style={{ background: cfg.color }} />

          {program.image_url && (
            <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={program.image_url}
                alt={program.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
                background: 'linear-gradient(to top, var(--surface), transparent)',
              }} />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: cfg.bg, color: cfg.color, fontFamily: 'var(--font-jakarta)' }}>
                {cfg.label}
              </span>
              {isPast && <Badge variant="dim">Selesai</Badge>}
            </div>

            <h1 className="text-2xl font-bold mb-5"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
              {program.title}
            </h1>

            <div className="flex flex-col gap-3 mb-5">
              <div className="flex items-center gap-3 text-sm"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                {formatDate(program.program_date)}
              </div>
              <div className="flex items-center gap-3 text-sm"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                {formatTime(program.start_time)}
                {program.end_time && ` — ${formatTime(program.end_time)}`}
              </div>
              {program.location && (
                <div className="flex items-center gap-3 text-sm"
                  style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                  {program.location}
                </div>
              )}
            </div>

            {program.description && (
              <p className="text-sm leading-relaxed pt-4 border-t"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)', borderColor: 'var(--border)', lineHeight: 1.8 }}>
                {program.description}
              </p>
            )}
          </div>
        </div>

        {program.needs_volunteers && !isPast && (
          <div className="rounded-2xl border p-5 mb-5 animate-slideUp"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
                Sukarelawan
              </h2>
              <div className="flex items-center gap-1.5 text-sm"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                <Users className="w-4 h-4" style={{ color: cfg.color }} />
                {slots === 0 ? `${confirmedCount} sukarelawan` : `${confirmedCount}/${slots} slot`}
              </div>
            </div>

            {slots > 0 && (
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((confirmedCount / slots) * 100, 100)}%`,
                    background: slotsFull ? '#9CA3AF' : cfg.color,
                  }} />
              </div>
            )}

            {slotsFull ? (
              <p className="text-sm text-center py-2"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                Slot sukarelawan sudah penuh.
              </p>
            ) : (
              <VolunteerButton programId={program.id} />
            )}
          </div>
        )}

        {/* Kenangan panel — shown if user has confirmed signup */}
        {userSignedUp && user && (
          <KenaganPanel
            programId={program.id}
            userId={user.id}
            programTitle={program.title}
            programDate={program.program_date}
            programCategory={program.category}
            existingReflection={existingMemory}
          />
        )}

        {/* Memories feed */}
        <MemoriesFeed programId={program.id} />
      </div>
    </div>
  )
}
