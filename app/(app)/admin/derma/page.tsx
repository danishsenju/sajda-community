'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Plus, Pencil, Trash2, GripVertical, CheckCircle2 } from 'lucide-react'

type DermaAccount = {
  id: string
  bank: string
  account_name: string
  account_no: string
  color: string
  is_active: boolean
  sort_order: number
}

const COLOR_OPTIONS = [
  { label: 'Hijau',  value: '#2D6A4F' },
  { label: 'Emas',   value: '#B78628' },
  { label: 'Biru',   value: '#1D4ED8' },
  { label: 'Ungu',   value: '#7C3AED' },
  { label: 'Merah',  value: '#DC2626' },
]

const EMPTY_FORM = { bank: '', account_name: '', account_no: '', color: '#2D6A4F', is_active: true }

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-3"
      style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
      {children}
    </p>
  )
}

export default function AdminDermaPage() {
  const supabase = createClient()
  const [accounts, setAccounts] = useState<DermaAccount[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DermaAccount | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function set(key: string, value: string | boolean) {
    setForm(p => ({ ...p, [key]: value }))
  }

  async function load() {
    const { data } = await supabase
      .from('derma_accounts')
      .select('*')
      .order('sort_order', { ascending: true })
    setAccounts(data ?? [])
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(acc: DermaAccount) {
    setEditing(acc)
    setForm({ bank: acc.bank, account_name: acc.account_name, account_no: acc.account_no, color: acc.color, is_active: acc.is_active })
    setOpen(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (editing) {
      await supabase.from('derma_accounts').update({
        bank: form.bank.trim(),
        account_name: form.account_name.trim(),
        account_no: form.account_no.trim(),
        color: form.color,
        is_active: form.is_active,
      }).eq('id', editing.id)
    } else {
      const maxOrder = accounts.length > 0 ? Math.max(...accounts.map(a => a.sort_order)) + 1 : 0
      await supabase.from('derma_accounts').insert({
        bank: form.bank.trim(),
        account_name: form.account_name.trim(),
        account_no: form.account_no.trim(),
        color: form.color,
        is_active: form.is_active,
        sort_order: maxOrder,
      })
    }

    setSaving(false)
    setOpen(false)
    load()
  }

  async function del(id: string, bank: string) {
    if (!confirm(`Padam akaun ${bank}?`)) return
    await supabase.from('derma_accounts').delete().eq('id', id)
    load()
  }

  async function toggleActive(acc: DermaAccount) {
    await supabase.from('derma_accounts').update({ is_active: !acc.is_active }).eq('id', acc.id)
    load()
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <SectionLabel>Pengurusan</SectionLabel>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
            Akaun Derma
          </h1>
          <p className="text-xs mt-1" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
            Akaun bank yang dipaparkan di halaman derma awam
          </p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" />
          Tambah Akaun
        </Button>
      </div>

      {/* Account list */}
      {accounts.length === 0 ? (
        <div
          className="border p-12 text-center"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
            Tiada akaun bank lagi. Tambah satu untuk mula.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="border p-4 flex items-center gap-4 animate-slideUp"
              style={{
                background: 'var(--surface)',
                borderColor: acc.is_active ? 'var(--border)' : 'rgba(255,255,255,0.04)',
                borderLeft: `3px solid ${acc.color}`,
                opacity: acc.is_active ? 1 : 0.5,
              }}
            >
              <GripVertical className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-dim)' }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 border"
                    style={{
                      color: acc.color,
                      borderColor: `${acc.color}30`,
                      background: `${acc.color}10`,
                      fontFamily: 'var(--font-jakarta)',
                    }}
                  >
                    {acc.bank}
                  </span>
                  {!acc.is_active && (
                    <span
                      className="text-[10px] tracking-widest uppercase"
                      style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}
                    >
                      Tidak aktif
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
                  {acc.account_name}
                </p>
                <p className="text-xs tracking-[0.08em]" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--text-dim)' }}>
                  {acc.account_no}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Toggle active */}
                <button
                  onClick={() => toggleActive(acc)}
                  className="p-2 border transition-all hover:border-[#243D2C]"
                  title={acc.is_active ? 'Nyahaktifkan' : 'Aktifkan'}
                  style={{ borderColor: 'var(--border)', background: 'transparent' }}
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5"
                    style={{ color: acc.is_active ? 'var(--primary)' : 'var(--text-dim)' }}
                  />
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(acc)}
                  className="p-2 border transition-all hover:border-[#243D2C]"
                  title="Edit"
                  style={{ borderColor: 'var(--border)', background: 'transparent' }}
                >
                  <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => del(acc.id, acc.bank)}
                  className="p-2 border transition-all hover:border-[rgba(239,68,68,0.3)]"
                  title="Padam"
                  style={{ borderColor: 'var(--border)', background: 'transparent' }}
                >
                  <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Akaun Bank' : 'Tambah Akaun Bank'}
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <Input
            label="Nama Bank"
            placeholder="cth: Maybank, Bank Islam, CIMB..."
            value={form.bank}
            onChange={e => set('bank', e.target.value)}
            required
          />
          <Input
            label="Nama Akaun"
            placeholder="cth: Masjid Saujana Utama"
            value={form.account_name}
            onChange={e => set('account_name', e.target.value)}
            required
          />
          <Input
            label="No. Akaun"
            placeholder="cth: 1234 5678 9012"
            value={form.account_no}
            onChange={e => set('account_no', e.target.value)}
            required
          />

          {/* Color picker */}
          <div>
            <p className="text-[10px] font-medium tracking-[0.18em] uppercase mb-2"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Warna Label
            </p>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('color', opt.value)}
                  className="w-8 h-8 border-2 transition-all"
                  style={{
                    background: opt.value,
                    borderColor: form.color === opt.value ? '#fff' : 'transparent',
                    transform: form.color === opt.value ? 'scale(1.15)' : 'scale(1)',
                  }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('is_active', !form.is_active)}
              className="w-10 h-5 border relative transition-all"
              style={{
                background: form.is_active ? 'var(--primary-pale)' : 'transparent',
                borderColor: form.is_active ? '#B7DFC9' : 'var(--border)',
              }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 transition-all"
                style={{
                  background: form.is_active ? 'var(--primary)' : 'var(--text-dim)',
                  left: form.is_active ? '20px' : '2px',
                }}
              />
            </div>
            <span className="text-xs" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Papar di halaman derma awam
            </span>
          </label>

          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={saving} className="flex-1">
              {editing ? 'Simpan Perubahan' : 'Tambah Akaun'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
