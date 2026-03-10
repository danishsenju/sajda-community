import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:   'text-white font-semibold hover:brightness-105 active:scale-[0.97]',
  secondary: 'border font-medium active:scale-[0.97]',
  ghost:     'border font-medium active:scale-[0.97]',
  danger:    'border font-medium active:scale-[0.97]',
}

const variantBg: Record<ButtonVariant, object> = {
  primary:   { background: 'var(--primary)', color: '#fff' },
  secondary: { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' },
  ghost:     { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' },
  danger:    { background: 'rgba(220,38,38,0.06)', borderColor: 'rgba(220,38,38,0.25)', color: '#DC2626' },
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        suppressHydrationWarning
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        style={{
          fontFamily: 'var(--font-jakarta)',
          ...variantBg[variant],
          ...style,
        }}
        {...props}
      >
        {loading && (
          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
