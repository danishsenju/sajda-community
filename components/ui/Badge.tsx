import { cn } from '@/lib/utils'

type BadgeVariant = 'green' | 'gold' | 'red' | 'dim'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, React.CSSProperties> = {
  green: { color: '#2D6A4F', background: '#E8F5EE',  border: '1px solid #B7DFC9' },
  gold:  { color: '#B78628', background: '#FEF9EC', border: '1px solid #F0D080' },
  red:   { color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' },
  dim:   { color: '#6B7280', background: '#F9FAFB', border: '1px solid #E5E7EB' },
}

export function Badge({ variant = 'green', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
        className
      )}
      style={{ fontFamily: 'var(--font-jakarta)', ...variants[variant] }}
    >
      {children}
    </span>
  )
}
