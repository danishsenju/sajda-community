'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewKeperluanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'bantuan_fizikal',
    urgency: 'normal',
  })

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirect=/keperluan/new')
      return
    }

    try {
      const { error } = await supabase.from('keperluan').insert({
        title: form.title,
        description: form.description,
        category: form.category as 'bantuan_fizikal' | 'ilmu_tuisyen' | 'transport' | 'barangan' | 'lain',
        urgency: form.urgency as 'normal' | 'urgent',
        posted_by: user.id,
        status: 'pending',
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/keperluan?posted=1')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href="/keperluan"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-[var(--primary)]"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>
            Keperluan Komuniti
          </p>
          <h1 className="text-2xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
            Hantar Keperluan
          </h1>
          <p className="text-sm"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
            Permohonan anda akan disemak oleh AJK sebelum disiarkan.
          </p>
        </div>

        <div className="rounded-2xl border p-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Tajuk"
              placeholder="Contoh: Perlukan bantuan angkat barang"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
            />
            <Textarea
              label="Penerangan"
              placeholder="Terangkan dengan lebih lanjut apa yang anda perlukan..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              required
            />
            <Select label="Kategori" value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="bantuan_fizikal">Bantuan Fizikal</option>
              <option value="ilmu_tuisyen">Ilmu &amp; Tuisyen</option>
              <option value="transport">Transport</option>
              <option value="barangan">Barangan</option>
              <option value="lain">Lain-lain</option>
            </Select>
            <Select label="Keutamaan" value={form.urgency} onChange={(e) => set('urgency', e.target.value)}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent / Mendesak</option>
            </Select>

            {error && (
              <p className="text-xs rounded-xl px-3 py-2 border"
                style={{ color: '#DC2626', background: '#FEF2F2', borderColor: '#FECACA', fontFamily: 'var(--font-jakarta)' }}>
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Hantar Permohonan
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
