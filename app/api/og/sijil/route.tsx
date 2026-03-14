import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const CATEGORY_LABELS: Record<string, string> = {
  solat: 'Solat',
  kebajikan: 'Kebajikan',
  ramadan: 'Ramadan',
  gotong_royong: 'Gotong Royong',
  umum: 'Program',
}

function formatDateMY(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogs', 'Sep', 'Okt', 'Nov', 'Dis']
  const d = new Date(dateStr)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title    = searchParams.get('title')    ?? 'Program Masjid'
  const date     = searchParams.get('date')     ?? ''
  const name     = searchParams.get('name')     ?? 'Jemaah'
  const category = searchParams.get('category') ?? 'umum'

  const catLabel = CATEGORY_LABELS[category] ?? 'Program'
  const dateLabel = date ? formatDateMY(date) : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#08090E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Corner decorations */}
        <div style={{
          position: 'absolute', top: 24, left: 24,
          width: 48, height: 48, borderTop: '2px solid rgba(34,197,94,0.4)',
          borderLeft: '2px solid rgba(34,197,94,0.4)', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', top: 24, right: 24,
          width: 48, height: 48, borderTop: '2px solid rgba(34,197,94,0.4)',
          borderRight: '2px solid rgba(34,197,94,0.4)', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: 24, left: 24,
          width: 48, height: 48, borderBottom: '2px solid rgba(34,197,94,0.4)',
          borderLeft: '2px solid rgba(34,197,94,0.4)', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: 24, right: 24,
          width: 48, height: 48, borderBottom: '2px solid rgba(34,197,94,0.4)',
          borderRight: '2px solid rgba(34,197,94,0.4)', display: 'flex',
        }} />

        {/* Subtle radial glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Mosque name */}
        <div style={{
          color: '#22C55E',
          fontSize: 15,
          letterSpacing: 8,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          fontWeight: 600,
          marginBottom: 10,
          display: 'flex',
        }}>
          MASJID SAUJANA UTAMA
        </div>

        {/* Divider line */}
        <div style={{ width: 80, height: 1, background: 'rgba(34,197,94,0.35)', marginBottom: 14, display: 'flex' }} />

        {/* Certificate label */}
        <div style={{
          color: 'rgba(255,255,255,0.25)',
          fontSize: 12,
          letterSpacing: 6,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          marginBottom: 44,
          display: 'flex',
        }}>
          SIJIL PENYERTAAN
        </div>

        {/* Attendee name */}
        <div style={{
          color: '#F0FDF4',
          fontSize: 54,
          fontWeight: 700,
          marginBottom: 14,
          display: 'flex',
          maxWidth: 900,
          textAlign: 'center',
        }}>
          {name}
        </div>

        {/* "telah menyertai" */}
        <div style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: 18,
          fontFamily: 'sans-serif',
          marginBottom: 20,
          display: 'flex',
        }}>
          telah menyertai
        </div>

        {/* Program title */}
        <div style={{
          color: '#22C55E',
          fontSize: 30,
          fontWeight: 600,
          textAlign: 'center',
          maxWidth: 800,
          marginBottom: 28,
          display: 'flex',
          lineHeight: 1.3,
        }}>
          {title}
        </div>

        {/* Date · Category pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 20px',
          borderRadius: 100,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'sans-serif', display: 'flex' }}>
            {dateLabel}
          </span>
          {dateLabel && catLabel && (
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14, fontFamily: 'sans-serif', display: 'flex' }}>·</span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'sans-serif', display: 'flex' }}>
            {catLabel}
          </span>
        </div>

        {/* Sajda wordmark bottom */}
        <div style={{
          position: 'absolute', bottom: 32, right: 44,
          color: 'rgba(34,197,94,0.5)',
          fontSize: 13,
          letterSpacing: 5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          fontWeight: 700,
          display: 'flex',
        }}>
          SAJDA
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
