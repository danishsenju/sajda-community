// UX RATIONALE: Input fields use translucent glass background — consistent with
// the glassmorphism card system. The subtle border is barely visible at rest,
// brightens strongly on focus — gives clear "this is active" signal.
// Min height 52px — WCAG AA 44px + 8px safety margin for arthritic fingers.
// Error state uses red ring + border — dual signal (color + shape) for color-blind users.
// Label above field — never inside (placeholder-as-label fails elderly users with poor memory).

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

/* ── Label ── */
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-nunito, var(--font-dm-sans, "Nunito", sans-serif))',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '6px',
  display: 'block',
}

/* ── Base field shared between input / textarea / select ── */
const baseField = [
  'w-full border transition-all duration-150',
  'text-[var(--text-primary)] placeholder:text-[var(--text-dim)]',
  'focus:outline-none',
].join(' ')

const baseFieldStyle: React.CSSProperties = {
  background: 'var(--bg-input, rgba(255,255,255,0.06))',
  borderColor: 'var(--border-lit, rgba(45,215,113,0.18))',
  fontFamily: 'var(--font-nunito, var(--font-dm-sans, "Nunito", sans-serif))',
  fontSize: '16px', /* minimum for elderly / accessibility — never lower */
  padding: '0 16px',
  borderRadius: '14px',
  color: 'var(--text-primary)',
}

const focusClass = [
  'focus:border-[var(--accent,#2DD771)]',
  'focus:ring-[3px] focus:ring-[rgba(45,215,113,0.15)]',
].join(' ')

const errorClass = [
  'border-[var(--danger,#F87171)]',
  'focus:border-[var(--danger,#F87171)]',
  'focus:ring-[3px] focus:ring-[rgba(248,113,113,0.12)]',
].join(' ')

/* ── Error message ── */
function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-nunito, "Nunito", sans-serif)',
      fontSize: '13px',
      color: 'var(--danger, #F87171)',
      marginTop: '5px',
    }}>
      {msg}
    </p>
  )
}

/* ─────────────── INPUT ─────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, style, ...props }, ref) => (
    <div className="flex flex-col">
      {label && <label style={labelStyle}>{label}</label>}
      <input
        ref={ref}
        suppressHydrationWarning
        className={cn(baseField, focusClass, error && errorClass, className)}
        style={{
          ...baseFieldStyle,
          height: '52px', /* WCAG AA: 48px+ touch target */
          ...style,
        }}
        {...props}
      />
      {hint && !error && (
        <p style={{ fontFamily: 'var(--font-nunito,"Nunito",sans-serif)', fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px' }}>
          {hint}
        </p>
      )}
      {error && <ErrorMsg msg={error} />}
    </div>
  )
)
Input.displayName = 'Input'

/* ─────────────── TEXTAREA ─────────────── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, style, ...props }, ref) => (
    <div className="flex flex-col">
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        ref={ref}
        className={cn(baseField, focusClass, 'resize-none', error && errorClass, className)}
        style={{
          ...baseFieldStyle,
          padding: '14px 16px',
          ...style,
        }}
        {...props}
      />
      {error && <ErrorMsg msg={error} />}
    </div>
  )
)
Textarea.displayName = 'Textarea'

/* ─────────────── SELECT ─────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, style, ...props }, ref) => (
    <div className="flex flex-col">
      {label && <label style={labelStyle}>{label}</label>}
      <select
        ref={ref}
        className={cn(baseField, focusClass, error && errorClass, className)}
        style={{
          ...baseFieldStyle,
          height: '52px',
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
      {error && <ErrorMsg msg={error} />}
    </div>
  )
)
Select.displayName = 'Select'
