'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl',
          'animate-fadeUp',
          className
        )}
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1.5">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
