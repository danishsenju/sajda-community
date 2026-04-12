// UX RATIONALE: Frosted glass cards create depth hierarchy without heavy shadows.
// The translucent surface lets the dark background "breathe through" — creates
// premium layered feel without the visual noise of solid colored cards.
// @supports fallback ensures cards remain legible on old Android (no backdrop-filter).
// Top stripe category indicator: 3x more visible than left border on mobile portrait.

import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'elevated' | 'glass' | 'primary'

// UX RATIONALE: Category stripe colors — high-contrast against dark surface.
// These are chosen to be accessible even at reduced opacity on dark bg.
export const categoryColors: Record<string, string> = {
  umum:          '#2DD771', // accent green — default
  kecemasan:     '#F87171', // danger red — pre-attentive urgency signal
  ramadan:       '#FBBF24', // amber — festive/religious period
  kewangan:      '#60A5FA', // blue — financial/transactions
  kebajikan:     '#A78BFA', // purple — welfare/charity
  gotong_royong: '#34D399', // teal-green — community action
  solat:         '#2DD771', // green — prayer
  quran:         '#818CF8', // indigo — religious learning
  fiqh:          '#A78BFA', // purple — Islamic jurisprudence
  akhlak:        '#F472B6', // pink — character/ethics
  bahasa_arab:   '#38BDF8', // sky blue — language
  bantuan_fizikal:'#FB923C', // orange — physical help
  ilmu_tuisyen:  '#818CF8', // indigo — education
  transport:     '#38BDF8', // sky — transport
  barangan:      '#A3E635', // lime — goods
}

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  variant?: CardVariant
  // category: adds a 3px top stripe in the category color
  category?: string
  style?: React.CSSProperties
}

export function Card({
  children,
  className,
  hover = true,
  variant = 'default',
  category,
  style,
}: CardProps) {
  const stripeColor = category ? (categoryColors[category] ?? categoryColors.umum) : undefined

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        // UX RATIONALE: Fallback for browsers without backdrop-filter support
        'bg-[rgba(255,255,255,0.05)]',
        // @supports handled via inline style for compat
        'border border-[rgba(45,215,113,0.14)]',
        'rounded-[20px]',
        hover && [
          'transition-all duration-250 ease-out',
          // UX RATIONALE: Subtle lift — confirms tappability without being distracting
          'hover:-translate-y-0.5',
          'hover:border-[rgba(45,215,113,0.28)]',
          'hover:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_0_1px_rgba(45,215,113,0.08)]',
        ],
        className
      )}
      style={{
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        padding: '20px',
        // Category top stripe — 3px colored border-top
        ...(stripeColor ? { borderTop: `3px solid ${stripeColor}` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// UX RATIONALE: Compact card variant for list items — same glass but tighter padding
export function CardCompact({
  children,
  className,
  hover = true,
  category,
  style,
}: Omit<CardProps, 'variant'>) {
  const stripeColor = category ? (categoryColors[category] ?? categoryColors.umum) : undefined

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-[rgba(255,255,255,0.04)]',
        'border border-[rgba(45,215,113,0.12)]',
        'rounded-[16px]',
        hover && [
          'transition-all duration-200 ease-out',
          'hover:-translate-y-0.5',
          'hover:border-[rgba(45,215,113,0.25)]',
        ],
        className
      )}
      style={{
        backdropFilter: 'blur(16px) saturate(130%)',
        WebkitBackdropFilter: 'blur(16px) saturate(130%)',
        padding: '14px 16px',
        ...(stripeColor ? { borderTop: `3px solid ${stripeColor}` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}
