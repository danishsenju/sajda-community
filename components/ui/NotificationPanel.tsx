'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Bell, BellRing, BellOff, BookMarked, Megaphone, Calendar, ChevronRight, X, CheckCheck, Radio } from 'lucide-react'
import { createClient } from '@/lib/supabase'

// ── Push Notification helpers ──────────────────────────────────────────────
function urlBase64ToUint8Array(b64: string): Uint8Array {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4)
  const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

type PushState = 'loading' | 'unsupported' | 'denied' | 'off' | 'on'

function usePushState() {
  const [pushState, setPushState] = useState<PushState>('loading')
  const [pushLoading, setPushLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      setPushState('unsupported'); return
    }
    if (Notification.permission === 'denied') { setPushState('denied'); return }
    setPushState(localStorage.getItem('notif_subscribed') === 'true' ? 'on' : 'off')
  }, [])

  async function enablePush() {
    setPushLoading(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setPushState('denied'); return }
      const reg = await navigator.serviceWorker.ready
      const sub = (await reg.pushManager.getSubscription()) ??
        await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!).buffer as ArrayBuffer,
        })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
            auth:   btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
          },
        }),
      })
      localStorage.setItem('notif_subscribed', 'true')
      setPushState('on')
    } catch { /* ignore */ }
    finally { setPushLoading(false) }
  }

  async function disablePush() {
    setPushLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      localStorage.removeItem('notif_subscribed')
      setPushState('off')
    } catch { /* ignore */ }
    finally { setPushLoading(false) }
  }

  return { pushState, pushLoading, enablePush, disablePush }
}

type NotifItem = {
  id: string
  type: 'announcement' | 'hadis' | 'program' | 'live'
  title: string
  subtitle: string
  href: string
  time?: string
  color: string
  bg: string
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>
  isNew?: boolean
}

const LAST_SEEN_KEY = 'sajda-notif-last-seen'

const catMeta: Record<string, { color: string; bg: string }> = {
  kecemasan: { color: '#DC2626', bg: '#FEF2F2' },
  ramadan:   { color: '#D97706', bg: '#FFFBEB' },
  kewangan:  { color: '#2563EB', bg: '#EFF6FF' },
  umum:      { color: '#2D6A4F', bg: '#E8F5EE' },
}

export function NotificationPanel() {
  const [open, setOpen]           = useState(false)
  const [items, setItems]         = useState<NotifItem[]>([])
  const [loading, setLoading]     = useState(false)
  const [unread, setUnread]       = useState(0)
  const panelRef                  = useRef<HTMLDivElement>(null)
  const loadedRef                 = useRef(false)
  const { pushState, pushLoading, enablePush, disablePush } = usePushState()
  const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
  // Standalone = installed to Home Screen (PWA). On iOS standalone, push IS supported.
  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  )
  // Only show the "add to home screen" guide when on iOS Safari (not installed)
  const showIOSGuide = isIOS && !isStandalone

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Check unread count on mount (announcements since last seen + active live stream)
  useEffect(() => {
    async function checkUnread() {
      try {
        const lastSeen = localStorage.getItem(LAST_SEEN_KEY) ?? '1970-01-01T00:00:00Z'
        const supabase = createClient()
        const [{ count }, { data: live }] = await Promise.all([
          supabase.from('announcements')
            .select('id', { count: 'exact', head: true })
            .gt('created_at', lastSeen),
          supabase.from('live_streams')
            .select('id')
            .eq('is_active', true)
            .limit(1)
            .single(),
        ])
        setUnread((count ?? 0) + (live ? 1 : 0))
      } catch { /* ignore */ }
    }
    checkUnread()
  }, [])

  const loadNotifications = useCallback(async () => {
    if (loadedRef.current) return
    loadedRef.current = true
    setLoading(true)
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY) ?? '1970-01-01T00:00:00Z'

      const [{ data: announcements }, { data: programs }, { data: liveStream }] = await Promise.all([
        supabase.from('announcements')
          .select('id, title, content, category, created_at, is_pinned')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3),
        supabase.from('programs')
          .select('id, title, program_date, start_time')
          .gte('program_date', today)
          .order('program_date')
          .limit(1),
        supabase.from('live_streams')
          .select('id, title')
          .eq('is_active', true)
          .limit(1)
          .single(),
      ])

      const result: NotifItem[] = []

      // Active live stream — pinned at very top when broadcasting
      if (liveStream) {
        result.push({
          id: 'live-stream',
          type: 'live',
          title: 'Siaran Langsung',
          subtitle: liveStream.title,
          href: '/live',
          color: '#EF4444',
          bg: '#FEF2F2',
          Icon: Radio,
          isNew: true,
        })
      }

      // Hadis harian — always at top
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
      )
      result.push({
        id: 'hadis-daily',
        type: 'hadis',
        title: 'Hadis Harian',
        subtitle: `Hadis pilihan hari ini — koleksi pilihan untuk hari ke-${dayOfYear}`,
        href: '/hadis',
        color: '#2D6A4F',
        bg: '#E8F5EE',
        Icon: BookMarked,
      })

      // Announcements
      for (const ann of announcements ?? []) {
        const meta = catMeta[ann.category] ?? catMeta.umum
        result.push({
          id: ann.id,
          type: 'announcement',
          title: ann.title,
          subtitle: ann.content.slice(0, 72) + (ann.content.length > 72 ? '…' : ''),
          href: '/',
          time: new Date(ann.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }),
          color: meta.color,
          bg: meta.bg,
          Icon: Megaphone,
          isNew: ann.created_at > lastSeen,
        })
      }

      // Upcoming program
      if (programs?.[0]) {
        const prog = programs[0]
        const d = new Date(prog.program_date)
        result.push({
          id: prog.id,
          type: 'program',
          title: prog.title,
          subtitle: `${d.toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short' })} · ${prog.start_time?.slice(0, 5) ?? ''}`,
          href: `/program/${prog.id}`,
          color: '#D97706',
          bg: '#FFFBEB',
          Icon: Calendar,
        })
      }

      setItems(result)
    } catch { /* ignore */ }
    finally {
      setLoading(false)
      // Mark as read
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString())
      setUnread(0)
    }
  }, [])

  function handleOpen() {
    setOpen(p => {
      if (!p) loadNotifications()
      return !p
    })
  }

  const badgeCount = unread > 9 ? '9+' : unread > 0 ? String(unread) : null

  return (
    <div className="relative" ref={panelRef}>

      {/* ── BELL BUTTON ── */}
      <button
        onClick={handleOpen}
        aria-label="Notifikasi"
        aria-expanded={open}
        className="relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 active:scale-90"
        style={{
          borderColor: open ? 'var(--primary)' : 'var(--border)',
          background: open ? 'var(--primary-pale)' : 'transparent',
        }}
      >
        <Bell
          className="w-4 h-4 transition-colors"
          style={{ color: open ? 'var(--primary)' : 'var(--text-secondary)' }}
          strokeWidth={1.8}
        />
        {/* Unread badge */}
        {badgeCount && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white leading-none"
            style={{ background: '#DC2626', fontFamily: 'var(--font-jakarta)' }}
          >
            {badgeCount}
          </span>
        )}
      </button>

      {/* ── NOTIFICATION PANEL ── */}
      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-80 rounded-2xl border overflow-hidden z-[100] animate-slideUp"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: '0 16px 48px rgba(42,33,24,0.13), 0 4px 16px rgba(42,33,24,0.06)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--void)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--primary-pale)' }}
              >
                <Bell className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
                Notifikasi
              </p>
            </div>
            <div className="flex items-center gap-1">
              {items.some(i => i.isNew) && (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(45,106,79,0.10)', color: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}
                >
                  Baru
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-colors ml-1"
                aria-label="Tutup"
              >
                <X className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Items list */}
          <div className="max-h-[360px] overflow-y-auto scrollbar-none">
            {loading ? (
              // Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="skeleton h-3 w-3/4 rounded-full" />
                    <div className="skeleton h-2.5 w-full rounded-full" />
                    <div className="skeleton h-2.5 w-2/3 rounded-full" />
                  </div>
                </div>
              ))
            ) : items.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCheck className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-dim)' }} />
                <p className="text-sm" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-jakarta)' }}>
                  Semua sudah dibaca
                </p>
              </div>
            ) : (
              items.map((item, i) => {
                const { Icon } = item
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-[rgba(45,106,79,0.03)] group"
                    style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    {/* Icon bubble */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: item.bg }}
                    >
                      <Icon className="w-4 h-4" style={{ color: item.color }} strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p
                          className="text-sm font-semibold leading-snug"
                          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-jakarta)' }}
                        >
                          {item.title}
                          {item.isNew && (
                            <span
                              className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle -mt-0.5"
                              style={{ background: '#DC2626' }}
                            />
                          )}
                        </p>
                        {item.time && (
                          <span
                            className="text-[10px] flex-shrink-0 mt-0.5"
                            style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-jakarta)' }}
                          >
                            {item.time}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-jakarta)' }}
                      >
                        {item.subtitle}
                      </p>
                    </div>

                    <ChevronRight
                      className="w-3.5 h-3.5 self-center flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity"
                      style={{ color: 'var(--text-dim)' }}
                      strokeWidth={2}
                    />
                  </Link>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{ borderTop: '1px solid var(--border)', background: 'var(--void)' }}
          >
            {/* Push notification toggle */}
            {pushState !== 'unsupported' && (
              <div
                className="px-4 py-2.5 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  {pushState === 'on'
                    ? <BellRing className="w-3.5 h-3.5" style={{ color: '#22C55E' }} strokeWidth={2} />
                    : pushState === 'denied'
                    ? <BellOff className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} strokeWidth={2} />
                    : <Bell className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} strokeWidth={2} />
                  }
                  <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-jakarta)' }}>
                    {pushState === 'on'
                      ? 'Notifikasi push aktif'
                      : pushState === 'denied'
                      ? 'Notifikasi disekat'
                      : showIOSGuide
                      ? 'Tambah ke Home Screen untuk push'
                      : 'Notifikasi push tidak aktif'
                    }
                  </span>
                </div>
                {pushState !== 'denied' && !showIOSGuide && (
                  <button
                    onClick={() => pushState === 'on' ? disablePush() : enablePush()}
                    disabled={pushLoading || pushState === 'loading'}
                    className="text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{
                      color: pushState === 'on' ? 'var(--text-dim)' : '#22C55E',
                      fontFamily: 'var(--font-jakarta)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    {pushLoading ? '...' : pushState === 'on' ? 'Matikan' : 'Aktifkan'}
                  </button>
                )}
              </div>
            )}

            <div className="px-4 py-2.5 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-xs font-medium transition-opacity hover:opacity-60"
                style={{ color: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}
              >
                Semua Pengumuman
              </Link>
              <Link
                href="/hadis"
                onClick={() => setOpen(false)}
                className="text-xs font-medium transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-jakarta)' }}
              >
                Hadis Hari Ini
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
