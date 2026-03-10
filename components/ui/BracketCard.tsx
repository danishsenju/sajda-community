import { cn } from '@/lib/utils'

interface BracketCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  active?: boolean
  accentColor?: string
}

export function BracketCard({
  children,
  className,
  hover = true,
  active = false,
  accentColor,
}: BracketCardProps) {
  const borderColor = accentColor ?? 'var(--primary)'

  return (
    <div
      className={cn(
        'relative bg-[#0C1410] border border-[#1A2820] transition-all duration-250',
        hover && 'card-interactive',
        active && 'border-[#243D2C]',
        className
      )}
    >
      {/* Top-left bracket */}
      <span
        className="absolute top-0 left-0 w-[14px] h-[14px] pointer-events-none z-10 transition-opacity duration-200"
        style={{
          borderTop: `2px solid ${borderColor}`,
          borderLeft: `2px solid ${borderColor}`,
          opacity: active ? 1 : 0.5,
        }}
      />
      {/* Bottom-right bracket */}
      <span
        className="absolute bottom-0 right-0 w-[14px] h-[14px] pointer-events-none z-10 transition-opacity duration-200"
        style={{
          borderBottom: `2px solid ${borderColor}`,
          borderRight: `2px solid ${borderColor}`,
          opacity: active ? 1 : 0.5,
        }}
      />

      {children}
    </div>
  )
}
