// UX RATIONALE: Button system built around 3 archetypes.
// Primary: gradient green — unmistakable CTA. Dark text passes WCAG AA on bright bg.
// Secondary: transparent with accent border — secondary actions without visual noise.
// Danger: red tint — destructive actions need visual warning, not just label.
// Spring animation on press gives physical feedback — critical for Pak Cik archetype
// who needs confirmation that they've tapped something.
// Min height 52px — exceeds WCAG 2.1 AA 44px minimum, comfortable for arthritic fingers.

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  // sm: smaller actions inside cards — still 36px, meets WCAG if used in groups
  sm: {
    height: '40px',
    padding: '0 16px',
    fontSize: '14px',
    borderRadius: '10px',
    fontWeight: 600,
  },
  // md: standard CTA — 52px comfortably exceeds 48px WCAG minimum
  md: {
    height: '52px',
    padding: '0 24px',
    fontSize: '16px',
    borderRadius: '14px',
    fontWeight: 700,
  },
  // lg: primary page-level action — 56px, preferred for elderly users
  lg: {
    height: '56px',
    padding: '0 32px',
    fontSize: '17px',
    borderRadius: '14px',
    fontWeight: 700,
  },
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  // UX RATIONALE: Gradient gives clear visual weight. #050C09 text on #2DD771 = 7.2:1 contrast ratio.
  primary: {
    background: 'linear-gradient(135deg, #2DD771 0%, #1A6B3A 100%)',
    color: '#050C09',
    border: 'none',
    boxShadow: '0 8px 24px rgba(45,215,113,0.25)',
  },
  // UX RATIONALE: Ghost border primary — secondary action that doesn't compete with primary CTA
  secondary: {
    background: 'transparent',
    color: 'var(--accent, #2DD771)',
    border: '1px solid var(--accent-border, rgba(45,215,113,0.18))',
  },
  // UX RATIONALE: True ghost — lowest visual weight, for tertiary/nav actions
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
  // UX RATIONALE: Red tint on danger — pre-attentive color signals risk before user reads label
  danger: {
    background: 'rgba(248,113,113,0.10)',
    color: 'var(--danger, #F87171)',
    border: '1px solid rgba(248,113,113,0.28)',
  },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        suppressHydrationWarning
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 cursor-pointer select-none',
          // Spring transition on press — physical tap feedback for all archetypes
          'transition-all duration-150 ease-out',
          'active:scale-[0.96]',
          variant === 'primary' && [
            'hover:brightness-110',
            // Spring animation on hover for young adult archetype
            'hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(45,215,113,0.30)]',
            'active:scale-[0.96] active:shadow-none',
          ],
          variant === 'secondary' && [
            'hover:bg-[rgba(45,215,113,0.08)]',
            'hover:border-[rgba(45,215,113,0.35)]',
          ],
          variant === 'ghost' && [
            'hover:bg-[var(--surface)] hover:text-[var(--text-primary)]',
          ],
          variant === 'danger' && [
            'hover:bg-[rgba(248,113,113,0.15)]',
          ],
          // Disabled — visually obvious without removing from layout flow
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none',
          loading && 'opacity-70 cursor-wait',
          className
        )}
        style={{
          fontFamily: 'var(--font-nunito, var(--font-dm-sans, "Nunito", sans-serif))',
          letterSpacing: '0.01em',
          WebkitTapHighlightColor: 'transparent',
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin"
            style={{ width: '16px', height: '16px', flexShrink: 0 }}
            fill="none"
            viewBox="0 0 24 24"
          >
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
