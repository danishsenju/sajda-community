'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Plus, Trash2, Radio, Youtube, ExternalLink } from 'lucide-react'

type LiveStream = {
  id: string
  title: string
  url: string
  platform: 'youtube' | 'facebook'
  is_active: boolean
  created_at: string
}

function detectPlatform(url: string): 'youtube' | 'facebook' | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook'
  return null
}

export default function AdminLivePage() {
  const supabase = createClient()
  const [streams, setStreams]   = useState<LiveStream[]>([])
  const [open, setOpen]         = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ title: '', url: '' })
  const [urlError, setUrlError] = useState('')
  const [userId, setUserId]     = useState<string | null>(null)

  useEffect(() => {
    // getSession() is synchronous/cached — no network call
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
    })
    supabase
      .from('live_streams')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setStreams(data ?? []))
  }, [])

  function handleUrlChange(url: string) {
    setForm(p => ({ ...p, url }))
    if (url && !detectPlatform(url)) {
      setUrlError('URL mesti dari YouTube atau Facebook')
    } else {
      setUrlError('')
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const platform = detectPlatform(form.url)
    if (!platform) { setUrlError('URL mesti dari YouTube atau Facebook'); return }
    setSaving(true)
    const { data: inserted } = await supabase.from('live_streams').insert({
      title: form.title,
      url: form.url,
      platform,
      is_active: false,
      created_by: userId,
    }).select().single()
    setSaving(false)
    setOpen(false)
    setForm({ title: '', url: '' })
    setUrlError('')
    // Optimistic update — no extra load() round-trip
    if (inserted) setStreams(prev => [inserted as LiveStream, ...prev])
  }

  async function toggleActive(id: string, currentlyActive: boolean) {
    const newActive = !currentlyActive
    // Optimistic update immediately
    setStreams(prev => prev.map(s => ({ ...s, is_active: newActive ? s.id === id : s.id === id ? false : s.is_active })))
    // Run both DB updates in parallel when activating
    if (newActive) {
      await Promise.all([
        supabase.from('live_streams').update({ is_active: false }).neq('id', id),
        supabase.from('live_streams').update({ is_active: true }).eq('id', id),
      ])
    } else {
      await supabase.from('live_streams').update({ is_active: false }).eq('id', id)
    }
  }

  async function del(id: string) {
    if (!confirm('Padam siaran ini?')) return
    // Optimistic update — remove immediately
    setStreams(prev => prev.filter(s => s.id !== id))
    await supabase.from('live_streams').delete().eq('id', id)
  }

  const platform = detectPlatform(form.url)

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-1"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>Admin</p>
          <h1 className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
            Siaran Langsung
          </h1>
          <p className="text-xs mt-1" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
            Hanya satu siaran boleh aktif pada satu masa. Jemaah akan nampak siaran yang diaktifkan.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {streams.map((s) => (
          <div key={s.id}
            className="rounded-2xl border p-4"
            style={{
              background: 'var(--surface)',
              borderColor: s.is_active ? 'rgba(239,68,68,0.35)' : 'var(--border)',
              boxShadow: s.is_active ? '0 0 0 1px rgba(239,68,68,0.12)' : 'none',
            }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                {/* Platform icon */}
                {s.platform === 'youtube' ? (
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Youtube style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                  </div>
                ) : (
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(24,119,242,0.1)', border: '1px solid rgba(24,119,242,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-bold text-sm truncate"
                      style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
                      {s.title}
                    </p>
                    {s.is_active && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '2px 8px', borderRadius: '100px',
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                        fontFamily: 'var(--font-jakarta)', fontSize: '9px', fontWeight: 700,
                        letterSpacing: '0.1em', color: '#EF4444',
                      }}>
                        <div style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: '#EF4444', animation: 'breathe 1.2s ease-in-out infinite',
                        }} />
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                    {s.url}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="p-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <button
                  onClick={() => toggleActive(s.id, s.is_active)}
                  style={{
                    padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${s.is_active ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.35)'}`,
                    background: s.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                    color: s.is_active ? '#EF4444' : 'var(--primary)',
                    fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                  }}
                >
                  {s.is_active ? 'Nyahaktif' : 'Aktifkan'}
                </button>
                <Button variant="danger" size="sm" className="p-1.5" onClick={() => del(s.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {streams.length === 0 && (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            <Radio style={{ width: '28px', height: '28px', color: 'var(--text-dim)', margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <p className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Tiada siaran ditambah. Klik <strong>Tambah</strong> untuk mula.
            </p>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setForm({ title: '', url: '' }); setUrlError('') }} title="Tambah Siaran Langsung">
        <form onSubmit={save} className="flex flex-col gap-4">
          <Input
            label="Tajuk Siaran"
            placeholder="cth: Ceramah Jumaat — Ustaz Ahmad"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            required
          />

          <div>
            <Input
              label="URL Siaran (YouTube / Facebook)"
              placeholder="https://www.youtube.com/watch?v=... atau https://www.facebook.com/..."
              value={form.url}
              onChange={e => handleUrlChange(e.target.value)}
              required
            />
            {urlError && (
              <p style={{ marginTop: '4px', fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: '#EF4444' }}>
                {urlError}
              </p>
            )}
            {platform && !urlError && (
              <div style={{
                marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 8px', borderRadius: '6px',
                background: platform === 'youtube' ? 'rgba(239,68,68,0.08)' : 'rgba(24,119,242,0.08)',
                border: `1px solid ${platform === 'youtube' ? 'rgba(239,68,68,0.25)' : 'rgba(24,119,242,0.25)'}`,
              }}>
                {platform === 'youtube'
                  ? <Youtube style={{ width: '11px', height: '11px', color: '#EF4444' }} />
                  : <svg width="11" height="11" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                }
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 600,
                  color: platform === 'youtube' ? '#EF4444' : '#1877F2',
                }}>
                  {platform === 'youtube' ? 'YouTube dikesan' : 'Facebook dikesan'}
                </span>
              </div>
            )}
          </div>

          <div style={{
            padding: '12px 14px', borderRadius: '10px',
            background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)',
            fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.5,
          }}>
            Siaran akan disimpan sebagai <strong>tidak aktif</strong>. Aktifkan bila siaran bermula.
            Hanya satu siaran boleh aktif pada satu masa.
          </div>

          <Button type="submit" loading={saving} className="w-full" disabled={!!urlError}>
            Simpan Siaran
          </Button>
        </form>
      </Modal>
    </div>
  )
}
