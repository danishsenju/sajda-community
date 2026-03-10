import { createClient } from '@/lib/supabase-server'
import { Search, Package, AlertCircle, Plus, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

type Item = {
  id: string
  type: 'lost' | 'found'
  item_name: string
  description: string | null
  location: string | null
  contact: string | null
  is_resolved: boolean
  created_at: string
}

const TYPE_CONFIG = {
  lost:  { label: 'Barang Hilang', color: '#DC2626', bg: '#FEF2F2', icon: AlertCircle },
  found: { label: 'Barang Dijumpai', color: '#2D6A4F', bg: '#E8F5EE', icon: CheckCircle2 },
}

export default async function CariBarangPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('lost_found')
    .select('*')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })

  const lostItems = (items ?? []).filter((i: Item) => i.type === 'lost')
  const foundItems = (items ?? []).filter((i: Item) => i.type === 'found')

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* Header */}
      <div className="relative overflow-hidden border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
                style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>
                Papan Komuniti
              </p>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
                Cari Barang
              </h1>
              <p className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                Laporkan barang hilang atau barang dijumpai di kawasan masjid
              </p>
            </div>
            <Link
              href="/cari-barang/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all btn-press"
              style={{ background: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}
            >
              <Plus className="w-4 h-4" /> Laporkan
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {(items ?? []).length === 0 ? (
          <div className="text-center py-20 animate-slideUp">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--primary-pale)' }}>
              <Search className="w-10 h-10" style={{ color: 'var(--primary)' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
              Tiada Laporan Aktif
            </h2>
            <p className="text-sm mb-6" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Alhamdulillah, tiada barang hilang atau dijumpai buat masa ini.
            </p>
            <Link href="/cari-barang/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}>
              <Plus className="w-4 h-4" /> Buat Laporan Pertama
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">

            {/* LOST */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5" style={{ color: '#DC2626' }} />
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
                  Barang Hilang
                </h2>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#FEF2F2', color: '#DC2626', fontFamily: 'var(--font-jakarta)' }}>
                  {lostItems.length}
                </span>
              </div>

              {lostItems.length === 0 ? (
                <div className="rounded-2xl border p-6 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <p className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                    Tiada laporan barang hilang
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {lostItems.map((item: Item, i: number) => (
                    <ItemCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* FOUND */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
                  Barang Dijumpai
                </h2>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--primary-pale)', color: 'var(--primary)', fontFamily: 'var(--font-jakarta)' }}>
                  {foundItems.length}
                </span>
              </div>

              {foundItems.length === 0 ? (
                <div className="rounded-2xl border p-6 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <p className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
                    Tiada laporan barang dijumpai
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {foundItems.map((item: Item, i: number) => (
                    <ItemCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tip */}
        <div className="mt-10 rounded-2xl border p-5 flex items-start gap-3"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Package className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
          <div>
            <p className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
              Cara Guna
            </p>
            <p className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Jika anda kehilangan barang atau menjumpai barang di kawasan masjid, sila laporkan di sini. Hubungi terus melalui nombor yang tertera. Laporan akan ditutup apabila barang telah diserahkan kepada pemilik.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

function ItemCard({ item, index }: { item: Item; index: number }) {
  const cfg = TYPE_CONFIG[item.type]
  const Icon = cfg.icon
  const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000)

  return (
    <div
      className="rounded-2xl border p-5 animate-slideUp"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        borderLeft: `4px solid ${cfg.color}`,
        animationDelay: `${index * 0.07}s`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.color, fontFamily: 'var(--font-jakarta)' }}>
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
          <Clock className="w-3 h-3" />
          {daysAgo === 0 ? 'Hari ini' : `${daysAgo} hari lepas`}
        </span>
      </div>

      <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
        {item.item_name}
      </h3>

      {item.description && (
        <p className="text-sm mb-3 line-clamp-2" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
          {item.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {item.location && (
          <p className="text-xs" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
            📍 {item.location}
          </p>
        )}
        {item.contact && (
          <a
            href={`tel:${item.contact.replace(/\s/g, '')}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: cfg.bg, color: cfg.color, fontFamily: 'var(--font-jakarta)' }}
          >
            Hubungi →
          </a>
        )}
      </div>
    </div>
  )
}
