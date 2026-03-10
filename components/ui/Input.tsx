import { cn } from '@/lib/utils'
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

const baseField = [
  'w-full px-4 py-3 rounded-xl border text-sm transition-all duration-150',
  'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]',
  'placeholder:text-[var(--text-muted)]',
  'focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(45,106,79,0.1)]',
].join(' ')

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jakarta)',
  color: 'var(--text-dim)',
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={labelStyle}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        suppressHydrationWarning
        className={cn(baseField, error && 'border-[#DC2626]/50 focus:border-[#DC2626]', className)}
        style={{ fontFamily: 'var(--font-jakarta)' }}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: 'var(--red)', fontFamily: 'var(--font-jakarta)' }}>{error}</p>
      )}
    </div>
  )
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={labelStyle}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(baseField, 'resize-none', error && 'border-[#DC2626]/50', className)}
        style={{ fontFamily: 'var(--font-jakarta)' }}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: 'var(--red)', fontFamily: 'var(--font-jakarta)' }}>{error}</p>
      )}
    </div>
  )
)
Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={labelStyle}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(baseField, error && 'border-[#DC2626]/50', className)}
        style={{ fontFamily: 'var(--font-jakarta)' }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs" style={{ color: 'var(--red)', fontFamily: 'var(--font-jakarta)' }}>{error}</p>
      )}
    </div>
  )
)
Select.displayName = 'Select'
