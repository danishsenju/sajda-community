import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const period = h >= 12 ? 'PTG' : 'PG'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayHour}:${minutes} ${period}`
}

export function timeAgo(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Baru sahaja'
  if (minutes < 60) return `${minutes} minit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  return formatDate(d)
}
