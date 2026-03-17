'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Plus, Trash2, Pin } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import type { Announcement } from '@/types/database.types'

export default function AdminAnnouncementsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Announcement[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pushResult, setPushResult] = useState<string>('')
  const [form, setForm] = useState({ title: '', content: '', category: 'umum', is_pinned: false, send_push: true })

  function set(key: string, value: string | boolean) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setItems(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('announcements').insert({
      title: form.title, content: form.content,
      category: form.category as 'umum' | 'kecemasan' | 'ramadan' | 'kewangan',
      is_pinned: form.is_pinned, created_by: user?.id,
    })

    // Close modal immediately — don't make AJK wait for push delivery
    setSaving(false)
    setOpen(false)
    setForm({ title: '', content: '', category: 'umum', is_pinned: false, send_push: true })
    load()

    // Fire-and-forget push in background
    if (form.send_push) {
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `📢 ${form.title}`,
          body: form.content.slice(0, 120),
          url: '/',
        }),
      })
        .then(r => r.json())
        .then(json => { if (json.sent > 0) setPushResult(`Notifikasi dihantar kepada ${json.sent} peranti.`) })
        .catch(() => {})
    }
  }

  async function del(id: string) {
    if (!confirm('Padam pengumuman ini?')) return
    await supabase.from('announcements').delete().eq('id', id)
    load()
  }

  async function togglePin(id: string, pinned: boolean) {
    await supabase.from('announcements').update({ is_pinned: !pinned }).eq('id', id)
    load()
  }

  const catLabel: Record<string, string> = { umum: 'Umum', kecemasan: 'Kecemasan', ramadan: 'Ramadan', kewangan: 'Kewangan' }

  return (
    <div className="max-w-3xl">
      {pushResult && (
        <div style={{
          marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--primary)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {pushResult}
          <button onClick={() => setPushResult('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '16px', lineHeight: 1 }}>×</button>
        </div>
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-1"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>Admin</p>
          <h1 className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
            Pengumuman
          </h1>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((a) => (
          <div key={a.id}
            className="rounded-2xl border p-4 animate-slideUp"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={a.category === 'kecemasan' ? 'red' : a.category === 'ramadan' ? 'gold' : 'green'}>
                    {catLabel[a.category]}
                  </Badge>
                  {a.is_pinned && (
                    <Badge variant="gold">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </Badge>
                  )}
                  <span className="text-xs ml-auto"
                    style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                    {timeAgo(a.created_at)}
                  </span>
                </div>
                <p className="font-bold text-sm mb-1"
                  style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
                  {a.title}
                </p>
                <p className="text-xs line-clamp-2"
                  style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                  {a.content}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button variant="ghost" size="sm" className="p-1.5" onClick={() => togglePin(a.id, a.is_pinned)}>
                  <Pin className="w-3.5 h-3.5" />
                </Button>
                <Button variant="danger" size="sm" className="p-1.5" onClick={() => del(a.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm py-8 text-center"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
            Tiada pengumuman.
          </p>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Pengumuman">
        <form onSubmit={save} className="flex flex-col gap-4">
          <Input label="Tajuk" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          <Textarea label="Kandungan" value={form.content} onChange={(e) => set('content', e.target.value)} rows={4} required />
          <Select label="Kategori" value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="umum">Umum</option>
            <option value="kecemasan">Kecemasan</option>
            <option value="ramadan">Ramadan</option>
            <option value="kewangan">Kewangan</option>
          </Select>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_pinned}
              onChange={(e) => set('is_pinned', e.target.checked)}
              className="w-4 h-4" style={{ accentColor: 'var(--primary)' }} />
            <span className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
              Sematkan pengumuman
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border"
            style={{ borderColor: form.send_push ? 'rgba(34,197,94,0.4)' : 'var(--border)', background: form.send_push ? 'rgba(34,197,94,0.06)' : 'transparent' }}>
            <input type="checkbox" checked={form.send_push}
              onChange={(e) => set('send_push', e.target.checked)}
              className="w-4 h-4" style={{ accentColor: 'var(--primary)' }} />
            <div>
              <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)', display: 'block' }}>
                Hantar notifikasi push
              </span>
              <span className="text-xs" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                Jemaah yang aktifkan notifikasi akan terima amaran
              </span>
            </div>
          </label>
          <Button type="submit" loading={saving} className="w-full">Hantar</Button>
        </form>
      </Modal>
    </div>
  )
}
