// UX RATIONALE: Badges communicate status at a glance — pre-attentive processing.
// Pill shape (100px radius) is internationally recognisable as a tag/label.
// Minimum 26px height ensures legibility. Uppercase + letter-spacing = category distinction.
// Never use badges for primary info — always supplementary to the card title.

import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'gold'
  | 'green' | 'red' | 'dim' /* legacy aliases */

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  // dot: shows a small colored dot before the text (for status indicators)
  dot?: boolean
}

const variants: Record<BadgeVariant, React.CSSProperties> = {
  /* ── Semantic variants ── */
  success: {
    background: 'rgba(45,215,113,0.12)',
    color: 'var(--accent, #2DD771)',
    border: '1px solid rgba(45,215,113,0.22)',
  },
  // UX RATIONALE: Amber warning — FBBF24 on dark bg = 4.8:1 contrast, passes AA
  warning: {
    background: 'rgba(251,191,36,0.10)',
    color: '#FBBF24',
    border: '1px solid rgba(251,191,36,0.25)',
  },
  danger: {
    background: 'rgba(248,113,113,0.10)',
    color: 'var(--danger, #F87171)',
    border: '1px solid rgba(248,113,113,0.25)',
  },
  info: {
    background: 'rgba(96,165,250,0.10)',
    color: '#60A5FA',
    border: '1px solid rgba(96,165,250,0.25)',
  },
  // UX RATIONALE: Gold for Islamic cultural references (hijri dates, pinned content)
  gold: {
    background: 'rgba(201,168,76,0.12)',
    color: 'var(--gold, #C9A84C)',
    border: '1px solid rgba(201,168,76,0.25)',
  },
  muted: {
    background: 'var(--bg-card, rgba(255,255,255,0.05))',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-lit, rgba(45,215,113,0.18))',
  },

  /* ── Legacy aliases ── */
  green: {
    background: 'rgba(45,215,113,0.12)',
    color: 'var(--accent, #2DD771)',
    border: '1px solid rgba(45,215,113,0.22)',
  },
  red: {
    background: 'rgba(248,113,113,0.10)',
    color: 'var(--danger, #F87171)',
    border: '1px solid rgba(248,113,113,0.25)',
  },
  dim: {
    background: 'var(--bg-card, rgba(255,255,255,0.05))',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-lit, rgba(45,215,113,0.18))',
  },
}

const dotColors: Record<BadgeVariant, string> = {
  success: '#2DD771',
  green:   '#2DD771',
  warning: '#FBBF24',
  danger:  '#F87171',
  red:     '#F87171',
  info:    '#60A5FA',
  gold:    '#C9A84C',
  muted:   'var(--text-muted)',
  dim:     'var(--text-muted)',
}

export function Badge({ variant = 'success', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      style={{
        height: '26px',
        padding: '0 10px',
        borderRadius: '100px',
        fontFamily: 'var(--font-nunito, var(--font-dm-sans, "Nunito", sans-serif))',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
        ...variants[variant],
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: dotColors[variant] ?? '#2DD771',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  )
}

// UX RATIONALE: Category badge — uses category color system from Card.tsx
// Uppercase + tracking = category is LABEL not title, prevents reading as content
export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const categoryMap: Record<string, { label: string; color: string }> = {
    umum:           { label: 'Umum',          color: '#2DD771' },
    kecemasan:      { label: 'Kecemasan',      color: '#F87171' },
    ramadan:        { label: 'Ramadan',        color: '#FBBF24' },
    kewangan:       { label: 'Kewangan',       color: '#60A5FA' },
    kebajikan:      { label: 'Kebajikan',      color: '#A78BFA' },
    gotong_royong:  { label: 'Gotong Royong',  color: '#34D399' },
    solat:          { label: 'Solat',          color: '#2DD771' },
    quran:          { label: 'Al-Quran',       color: '#818CF8' },
    fiqh:           { label: 'Fiqh',           color: '#A78BFA' },
    akhlak:         { label: 'Akhlak',         color: '#F472B6' },
    bahasa_arab:    { label: 'Bahasa Arab',    color: '#38BDF8' },
    bantuan_fizikal:{ label: 'Bantuan Fizikal',color: '#FB923C' },
    ilmu_tuisyen:   { label: 'Tuisyen',        color: '#818CF8' },
    transport:      { label: 'Pengangkutan',   color: '#38BDF8' },
    barangan:       { label: 'Barangan',       color: '#A3E635' },
    lain:           { label: 'Lain-lain',      color: '#9CA3AF' },
  }

  const info = categoryMap[category] ?? { label: category, color: '#9CA3AF' }

  return (
    <span
      className={cn('inline-flex items-center', className)}
      style={{
        height: '22px',
        padding: '0 8px',
        borderRadius: '100px',
        fontFamily: 'var(--font-nunito, "Nunito", sans-serif)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: info.color,
        background: `${info.color}18`,
        border: `1px solid ${info.color}30`,
        whiteSpace: 'nowrap',
      }}
    >
      {info.label}
    </span>
  )
}
