import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { ShareSijilButtons } from './ShareSijilButtons'

const CATEGORY_LABELS: Record<string, string> = {
  solat: 'Solat', kebajikan: 'Kebajikan',
  ramadan: 'Ramadan', gotong_royong: 'Gotong Royong', umum: 'Program',
}

function formatDateMY(dateStr: string): string {
  const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
  const d = new Date(dateStr)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

type Props = { params: Promise<{ id: string; userId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, userId } = await params
  const supabase = await createClient()

  const [{ data: program }, { data: profile }] = await Promise.all([
    supabase.from('programs').select('title, program_date, category').eq('id', id).single(),
    supabase.from('profiles').select('full_name').eq('id', userId).single(),
  ])

  if (!program || !profile) return {}

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  const ogParams = new URLSearchParams({
    title:    program.title,
    date:     program.program_date,
    name:     profile.full_name ?? 'Jemaah',
    category: program.category,
  })

  const name = profile.full_name ?? 'Jemaah'
  const title = `Sijil ${name} — ${program.title}`

  return {
    title,
    description: `${name} telah menyertai ${program.title} di Masjid Saujana Utama.`,
    openGraph: {
      title,
      description: `${name} telah menyertai ${program.title}.`,
      images: [`${origin}/api/og/sijil?${ogParams.toString()}`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [`${origin}/api/og/sijil?${ogParams.toString()}`],
    },
  }
}

export default async function SijilPage({ params }: Props) {
  const { id, userId } = await params
  const supabase = await createClient()

  const [{ data: program }, { data: profile }, { data: memory }] = await Promise.all([
    supabase.from('programs').select('title, program_date, category, location').eq('id', id).single(),
    supabase.from('profiles').select('full_name').eq('id', userId).single(),
    supabase.from('program_memories').select('reflection').eq('program_id', id).eq('user_id', userId).single(),
  ])

  if (!program || !profile) notFound()

  const name = profile.full_name ?? 'Jemaah'
  const catLabel = CATEGORY_LABELS[program.category] ?? 'Program'
  const dateLabel = formatDateMY(program.program_date)

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const shareUrl = `${protocol}://${host}/program/${id}/sijil/${userId}`

  const shareText = `Saya telah menyertai "${program.title}" di Masjid Saujana Utama! 🕌`

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-4 py-12">

        {/* Certificate card */}
        <div style={{
          borderRadius: '20px',
          border: '1px solid rgba(34,197,94,0.2)',
          background: 'var(--surface)',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '24px',
        }}>
          {/* Top accent line */}
          <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #22C55E 30%, #22C55E 70%, transparent)' }} />

          {/* Corner SVG decorations */}
          <svg style={{ position: 'absolute', top: 16, left: 16, opacity: 0.4 }} width="32" height="32" viewBox="0 0 32 32">
            <path d="M0 32 L0 0 L32 0" fill="none" stroke="#22C55E" strokeWidth="1.5"/>
          </svg>
          <svg style={{ position: 'absolute', top: 16, right: 16, opacity: 0.4 }} width="32" height="32" viewBox="0 0 32 32">
            <path d="M32 32 L32 0 L0 0" fill="none" stroke="#22C55E" strokeWidth="1.5"/>
          </svg>
          <svg style={{ position: 'absolute', bottom: 16, left: 16, opacity: 0.4 }} width="32" height="32" viewBox="0 0 32 32">
            <path d="M0 0 L0 32 L32 32" fill="none" stroke="#22C55E" strokeWidth="1.5"/>
          </svg>
          <svg style={{ position: 'absolute', bottom: 16, right: 16, opacity: 0.4 }} width="32" height="32" viewBox="0 0 32 32">
            <path d="M32 0 L32 32 L0 32" fill="none" stroke="#22C55E" strokeWidth="1.5"/>
          </svg>

          {/* Radial glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 60%, rgba(34,197,94,0.05) 0%, transparent 70%)',
          }} />

          <div style={{ padding: '48px 36px', textAlign: 'center', position: 'relative' }}>

            {/* Mosque label */}
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'var(--primary)', marginBottom: '8px',
            }}>
              Masjid Saujana Utama
            </p>

            {/* Divider */}
            <div style={{ width: '40px', height: '1px', background: 'rgba(34,197,94,0.3)', margin: '0 auto 10px' }} />

            {/* Certificate label */}
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: 'var(--text-dim)', marginBottom: '32px',
            }}>
              Sijil Penyertaan
            </p>

            {/* Attendee name */}
            <h1 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '32px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.2,
            }}>
              {name}
            </h1>

            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px',
              color: 'var(--text-dim)', marginBottom: '20px',
            }}>
              telah menyertai
            </p>

            {/* Program title */}
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 600,
              color: 'var(--primary)', marginBottom: '24px', lineHeight: 1.35,
            }}>
              {program.title}
            </h2>

            {/* Date · Category */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '100px',
              border: '1px solid var(--border)', background: 'var(--void)',
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)',
            }}>
              {dateLabel}
              <span style={{ opacity: 0.4 }}>·</span>
              {catLabel}
            </div>

            {/* Reflection if exists */}
            {memory?.reflection && (
              <div style={{
                marginTop: '28px', padding: '14px 18px', borderRadius: '12px',
                border: '1px solid var(--border)', background: 'var(--void)',
                textAlign: 'left',
              }}>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                  color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0,
                  fontStyle: 'italic',
                }}>
                  &ldquo;{memory.reflection}&rdquo;
                </p>
              </div>
            )}

            {/* Sajda wordmark */}
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(34,197,94,0.3)', marginTop: '32px',
            }}>
              SAJDA
            </p>
          </div>

          {/* Bottom accent line */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.2) 50%, transparent)' }} />
        </div>

        {/* Share buttons */}
        <ShareSijilButtons shareUrl={shareUrl} shareText={shareText} programHref={`/program/${id}`} />

      </div>
    </div>
  )
}
