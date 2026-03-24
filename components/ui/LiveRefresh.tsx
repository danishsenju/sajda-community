'use client'

/**
 * LiveRefresh — subscribes to Supabase Realtime for announcements + programs.
 * When AJK posts something new, shows a toast and auto-refreshes the page.
 * Falls back to 60-second polling so it still works even if the WebSocket
 * connection limit is hit (Supabase Free = 200 concurrent connections).
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Bell, X } from 'lucide-react'

type Toast = { id: number; message: string }

export function LiveRefresh() {
  const router     = useRouter()
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const counter    = useRef(0)

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ id: ++counter.current, message: msg })
    toastTimer.current = setTimeout(() => setToast(null), 5000)
  }, [])

  const refresh = useCallback((msg: string) => {
    showToast(msg)
    // Small delay so the toast appears before the page re-renders
    setTimeout(() => router.refresh(), 400)
  }, [router, showToast])

  // Stable refs so the useEffect never re-runs after mount
  const refreshRef = useRef(refresh)
  const routerRef  = useRef(router)
  useEffect(() => { refreshRef.current = refresh }, [refresh])
  useEffect(() => { routerRef.current  = router  }, [router])

  useEffect(() => {
    const supabase = createClient()

    // ── Supabase Realtime subscription ──────────────────────────────
    const channel = supabase
      .channel('live-refresh')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        () => refreshRef.current('Pengumuman baru dari AJK'),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'programs' },
        () => refreshRef.current('Program baru telah ditambah'),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'announcements' },
        () => routerRef.current.refresh(),
      )
      .subscribe()

    // ── Polling fallback every 90s ────────────────────────────────
    // Ensures stale content is never shown even if WS limit is hit.
    const poll = setInterval(() => routerRef.current.refresh(), 90_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, []) // empty — runs once on mount only

  if (!toast) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '72px',           // below navbar
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9000,
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '11px 16px',
        borderRadius: '100px',
        background: 'rgba(8,9,14,0.92)',
        border: '1px solid rgba(82,201,122,0.35)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(82,201,122,0.08)',
        animation: 'fadeUp 0.3s ease forwards',
        whiteSpace: 'nowrap',
        maxWidth: 'calc(100vw - 40px)',
      }}
    >
      {/* Pulsing dot */}
      <div style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: '#52c97a', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          opacity: 0.5,
        }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#52c97a' }} />
      </div>

      <Bell style={{ width: '13px', height: '13px', color: '#52c97a', flexShrink: 0 }} />

      <span style={{
        fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
        color: 'rgba(255,255,255,0.85)',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {toast.message}
      </span>

      <button
        onClick={() => setToast(null)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '2px', display: 'flex', flexShrink: 0,
        }}
      >
        <X style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.35)' }} />
      </button>
    </div>
  )
}
