'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Plus, Trash2, Eye } from 'lucide-react'
import type { Kelas } from '@/types/database.types'
import Link from 'next/link'

const CATEGORY_LABELS: Record<string, string> = {
  quran: 'Quran', fiqh: 'Fiqh', akhlak: 'Akhlak', bahasa_arab: 'Bahasa Arab', lain: 'Lain-lain',
}

export default function AdminKelasPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Kelas[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', ustaz_name: '', category: 'quran',
    schedule_day: '', start_date: '', end_date: '', time_start: '', time_end: '',
    location: '', capacity: 0, is_active: true,
  })

  function set(key: string, value: string | boolean | number) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  async function load() {
    const { data } = await supabase.from('kelas').select('*').order('created_at', { ascending: false })
    setItems(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('kelas').insert({
      ...form,
      category: form.category as Kelas['category'],
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      time_start: form.time_start || null,
      time_end: form.time_end || null,
      capacity: form.capacity > 0 ? form.capacity : null,
      created_by: user?.id,
    })
    setSaving(false)
    setOpen(false)
    setForm({ title: '', description: '', ustaz_name: '', category: 'quran', schedule_day: '', start_date: '', end_date: '', time_start: '', time_end: '', location: '', capacity: 0, is_active: true })
    load()
  }

  async function del(id: string) {
    if (!confirm('Padam kelas ini?')) return
    await supabase.from('kelas').delete().eq('id', id)
    load()
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from('kelas').update({ is_active: !active }).eq('id', id)
    load()
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-1"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>Admin</p>
          <h1 className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
            Kelas
          </h1>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((k) => (
          <div key={k.id}
            className="rounded-2xl border p-4 animate-slideUp"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="green">{CATEGORY_LABELS[k.category] ?? k.category}</Badge>
                  {!k.is_active && <Badge variant="dim">Tidak Aktif</Badge>}
                  {k.ustaz_name && (
                    <span className="text-xs"
                      style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                      {k.ustaz_name}
                    </span>
                  )}
                </div>
                <p className="font-bold text-sm"
                  style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
                  {k.title}
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Link href={`/kelas/${k.id}`}>
                  <Button variant="ghost" size="sm" className="p-1.5"><Eye className="w-3.5 h-3.5" /></Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => toggleActive(k.id, k.is_active)}>
                  {k.is_active ? 'Nyahaktif' : 'Aktifkan'}
                </Button>
                <Button variant="danger" size="sm" className="p-1.5" onClick={() => del(k.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm py-8 text-center"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
            Tiada kelas.
          </p>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Kelas">
        <form onSubmit={save} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input label="Tajuk Kelas" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          <Input label="Nama Ustaz" value={form.ustaz_name} onChange={(e) => set('ustaz_name', e.target.value)} />
          <Select label="Kategori" value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="quran">Quran</option>
            <option value="fiqh">Fiqh</option>
            <option value="akhlak">Akhlak</option>
            <option value="bahasa_arab">Bahasa Arab</option>
            <option value="lain">Lain-lain</option>
          </Select>
          <Textarea label="Penerangan" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Hari" placeholder="Isnin" value={form.schedule_day} onChange={(e) => set('schedule_day', e.target.value)} />
            <Input label="Lokasi" value={form.location} onChange={(e) => set('location', e.target.value)} />
            <Input label="Masa Mula" type="time" value={form.time_start} onChange={(e) => set('time_start', e.target.value)} />
            <Input label="Masa Tamat" type="time" value={form.time_end} onChange={(e) => set('time_end', e.target.value)} />
            <Input label="Tarikh Mula" type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
            <Input label="Tarikh Tamat" type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
            <div className="col-span-2">
              <Input label="Kapasiti (0 = tiada had)" type="number" min={0}
                value={form.capacity}
                onChange={(e) => set('capacity', parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <Button type="submit" loading={saving} className="w-full">Simpan</Button>
        </form>
      </Modal>
    </div>
  )
}
