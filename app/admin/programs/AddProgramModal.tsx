'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus, ImagePlus, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

async function compressToJpeg(file: File, maxWidth = 800, quality = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas tidak disokong'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Pemampatan gagal'))
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = reject
    img.src = url
  })
}

export function AddProgramModal({ addAction }: { addAction: (fd: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageLoading(true)
    setError(null)
    try {
      const compressed = await compressToJpeg(file)
      const preview = URL.createObjectURL(compressed)
      setImagePreview(preview)

      const supabase = createClient()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('program-images')
        .upload(filename, compressed, { contentType: 'image/jpeg', upsert: false })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('program-images').getPublicUrl(filename)
      setImageUrl(data.publicUrl)
    } catch (err: any) {
      setError(err?.message ?? 'Gagal memuat naik gambar.')
      setImagePreview(null)
      setImageUrl(null)
    } finally {
      setImageLoading(false)
    }
  }

  function clearImage() {
    setImagePreview(null)
    setImageUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const fd = new FormData(e.currentTarget)
      if (imageUrl) fd.set('image_url', imageUrl)
      await addAction(fd)
      setOpen(false)
      formRef.current?.reset()
      clearImage()
    } catch (err: any) {
      setError(err?.message ?? 'Gagal menyimpan. Cuba semula.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="w-4 h-4" /> Tambah
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Program">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: '#FCA5A5',
            }}>
              {error}
            </div>
          )}

          <Input label="Tajuk" name="title" required />
          <Textarea label="Penerangan" name="description" rows={3} />
          <Select label="Kategori" name="category" defaultValue="umum">
            <option value="umum">Umum</option>
            <option value="solat">Solat</option>
            <option value="kebajikan">Kebajikan</option>
            <option value="ramadan">Ramadan</option>
            <option value="gotong_royong">Gotong Royong</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tarikh" name="program_date" type="date" required />
            <Input label="Masa Mula" name="start_time" type="time" required />
            <Input label="Masa Tamat" name="end_time" type="time" />
            <Input label="Lokasi" name="location" />
          </div>

          {/* Image upload */}
          <div>
            <p className="text-xs font-semibold tracking-[0.1em] uppercase mb-1.5"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Gambar Program (pilihan)
            </p>
            {imagePreview ? (
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '150px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={clearImage} style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%',
                  width: '28px', height: '28px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                }}>
                  <X className="w-3.5 h-3.5" />
                </button>
                {imageLoading && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'white',
                  }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memampatkan &amp; memuat naik...
                  </div>
                )}
              </div>
            ) : (
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '22px', borderRadius: '10px', cursor: imageLoading ? 'not-allowed' : 'pointer',
                border: '1.5px dashed var(--border)', background: 'var(--elevated)',
                fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)',
              }}>
                {imageLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Memuat naik...</>
                  : <><ImagePlus className="w-4 h-4" /> Klik untuk pilih gambar</>
                }
                <input ref={fileRef} type="file" accept="image/*" className="sr-only"
                  onChange={handleImageChange} disabled={imageLoading} />
              </label>
            )}
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px' }}>
              Gambar dipadat secara automatik ke maks. 800px lebar, format JPEG.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="needs_volunteers" value="1"
              className="w-4 h-4" style={{ accentColor: 'var(--primary)' }} />
            <span className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
              Perlukan Sukarelawan
            </span>
          </label>

          <Input label="Bilangan Slot (0 = tiada had)" name="volunteer_slots" type="number" min={0} defaultValue="0" />

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="is_published" value="1" defaultChecked
              className="w-4 h-4" style={{ accentColor: 'var(--primary)' }} />
            <span className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
              Siarkan serta-merta
            </span>
          </label>

          <Button type="submit" loading={saving} className="w-full">Simpan</Button>
        </form>
      </Modal>
    </>
  )
}
