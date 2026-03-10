import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  withOverlay?: boolean
  hover?: boolean
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden border rounded-2xl',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {children}
    </div>
  )
}
