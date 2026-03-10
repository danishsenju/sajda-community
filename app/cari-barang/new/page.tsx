'use server'



import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'

async function submitAction(fd: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const item_name = (fd.get('item_name') as string)?.trim()
  const contact   = (fd.get('contact') as string)?.trim()

  if (!item_name || !contact) return

  const { error } = await supabase.from('lost_found').insert({
    type:        fd.get('type') as 'lost' | 'found',
    item_name,
    description: (fd.get('description') as string)?.trim() || null,
    location:    (fd.get('location') as string)?.trim() || null,
    contact,
    posted_by:   user?.id ?? null,
  })

  if (error) {
    // redirect with error message in query param so the client can show it
    redirect(`/cari-barang/new?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/cari-barang')
}

export default async function NewCariBarangPage({
  searchParams,
}: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Back */}
        <Link href="/cari-barang"
          className="inline-flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-60"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--primary-pale)' }}>
            <Package className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
              Buat Laporan
            </h1>
            <p className="text-xs" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Isi maklumat barang hilang atau dijumpai
            </p>
          </div>
        </div>

        {/* Error from server */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
            fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: '#F87171',
          }}>
            Ralat: {error}
          </div>
        )}

        <form action={submitAction} className="flex flex-col gap-4">

          {/* Type toggle */}
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-2"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Jenis Laporan
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label style={{ cursor: 'pointer' }}>
                <input type="radio" name="type" value="lost" defaultChecked className="sr-only" />
                <div className="py-3 rounded-xl border text-sm font-semibold text-center transition-all"
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    background: 'rgba(220,38,38,0.10)',
                    borderColor: 'rgba(220,38,38,0.35)',
                    color: '#DC2626',
                  }}>
                  🔍 Barang Hilang
                </div>
              </label>
              <label style={{ cursor: 'pointer' }}>
                <input type="radio" name="type" value="found" className="sr-only" />
                <div className="py-3 rounded-xl border text-sm font-semibold text-center transition-all"
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}>
                  ✅ Barang Dijumpai
                </div>
              </label>
            </div>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
              Pilih jenis yang sesuai — tetapi kedua-dua pilihan di atas akan berfungsi.
            </p>
          </div>

          {/* Item name */}
          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase mb-1.5"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Nama Barang <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              name="item_name" type="text" required
              placeholder="cth: Dompet hitam, Kunci kereta Honda..."
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[var(--primary)]"
              style={{ fontFamily: 'var(--font-jakarta)', background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase mb-1.5"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Penerangan (pilihan)
            </label>
            <textarea
              name="description"
              placeholder="Ciri-ciri barang, warna, saiz..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border text-sm resize-none outline-none transition-colors focus:border-[var(--primary)]"
              style={{ fontFamily: 'var(--font-jakarta)', background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase mb-1.5"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Lokasi (pilihan)
            </label>
            <input
              name="location" type="text"
              placeholder="cth: Tandas wanita, Ruang solat utama..."
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[var(--primary)]"
              style={{ fontFamily: 'var(--font-jakarta)', background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase mb-1.5"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              No. Telefon Untuk Dihubungi <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              name="contact" type="tel" required
              placeholder="cth: 012-3456789"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[var(--primary)]"
              style={{ fontFamily: 'var(--font-jakarta)', background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all btn-press"
            style={{ background: 'var(--primary)', fontFamily: 'var(--font-jakarta)', marginTop: 8 }}
          >
            Hantar Laporan
          </button>
        </form>

      </div>
    </div>
  )
}
