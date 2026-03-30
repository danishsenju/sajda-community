'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import type { MosqueInfo } from '@/types/database.types'

export default function AdminMosquePage() {
  const supabase = createClient()
  const [mosque, setMosque] = useState<MosqueInfo | null>(null)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const [syncError, setSyncError] = useState('')

  const [mosqueForm, setMosqueForm] = useState({
    name: '', address: '', phone: '', description: '',
    gmaps_url: '', has_wudhu: true, has_womens_section: true,
    has_parking: true, has_accessibility: false, parking_notes: '', operating_notes: '',
    jakim_zone: 'SGR02',
  })

  useEffect(() => {
    async function load() {
      const { data: m } = await supabase.from('mosque_info').select('*').eq('id', 1).single()
      if (m) {
        setMosque(m)
        setMosqueForm({
          name: m.name, address: m.address ?? '', phone: m.phone ?? '',
          description: m.description ?? '', gmaps_url: m.gmaps_url ?? '',
          has_wudhu: m.has_wudhu, has_womens_section: m.has_womens_section,
          has_parking: m.has_parking, has_accessibility: m.has_accessibility,
          parking_notes: m.parking_notes ?? '', operating_notes: m.operating_notes ?? '',
          jakim_zone: (m as any).jakim_zone ?? 'SGR02',
        })
      }
    }
    load()
  }, [])

  async function syncPrayerTimes() {
    setSyncing(true)
    setSyncError('')
    setMessage('')
    try {
      const res = await fetch('/api/prayer-times/sync', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal segerak')
      setMessage(`Berjaya disegerak: ${json.synced} hari dari zon ${json.zone} (${json.from} — ${json.to})`)
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Ralat tidak diketahui')
    }
    setSyncing(false)
    setTimeout(() => { setMessage(''); setSyncError('') }, 5000)
  }

  async function saveMosque(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('mosque_info').update(mosqueForm).eq('id', 1)
    setMessage('Maklumat masjid disimpan.')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-1"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>Admin</p>
        <h1 className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
          Maklumat Masjid
        </h1>
      </div>

      {message && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border text-sm"
          style={{ background: '#E8F5EE', borderColor: '#B7DFC9', color: '#2D6A4F', fontFamily: 'var(--font-jakarta)' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {message}
        </div>
      )}

      {syncError && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border text-sm"
          style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626', fontFamily: 'var(--font-jakarta)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {syncError}
        </div>
      )}

      {/* Prayer Times Sync */}
      <div className="rounded-2xl border p-5 mb-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold mb-0.5"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
              Waktu Solat
            </h2>
            <p className="text-xs" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-dim)' }}>
              Data diambil secara automatik dari WaktuSolat.app
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" loading={syncing}
            onClick={syncPrayerTimes} className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Segerak 30 Hari
          </Button>
        </div>
      </div>

      {/* Mosque Info Form */}
      <div className="rounded-2xl border p-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="text-base font-bold mb-4"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>
          Info Masjid
        </h2>
        <form onSubmit={saveMosque} className="flex flex-col gap-3">
          <Input label="Nama Masjid" value={mosqueForm.name} onChange={(e) => setMosqueForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Alamat" value={mosqueForm.address} onChange={(e) => setMosqueForm((p) => ({ ...p, address: e.target.value }))} />
          <Input label="Telefon" value={mosqueForm.phone} onChange={(e) => setMosqueForm((p) => ({ ...p, phone: e.target.value }))} />
          <Input label="Google Maps URL" value={mosqueForm.gmaps_url} onChange={(e) => setMosqueForm((p) => ({ ...p, gmaps_url: e.target.value }))} />
          <Select label="Zon Waktu Solat (JAKIM)" value={mosqueForm.jakim_zone}
            onChange={(e) => setMosqueForm((p) => ({ ...p, jakim_zone: e.target.value }))}>
            <optgroup label="Selangor">
              <option value="SGR01">SGR01 — Gombak, Hulu Langat, Hulu Selangor, Rawang</option>
              <option value="SGR02">SGR02 — Petaling, Shah Alam, Subang, Sungai Buloh</option>
              <option value="SGR03">SGR03 — Klang, Kuala Langat, Kuala Selangor, Sepang</option>
            </optgroup>
            <optgroup label="Kuala Lumpur / Putrajaya">
              <option value="WLY01">WLY01 — Kuala Lumpur</option>
              <option value="WLY02">WLY02 — Putrajaya</option>
            </optgroup>
            <optgroup label="Johor">
              <option value="JHR01">JHR01 — Pulau Aur, Pulau Pemanggil</option>
              <option value="JHR02">JHR02 — Johor Bahru, Pontian</option>
              <option value="JHR03">JHR03 — Batu Pahat, Muar, Segamat</option>
              <option value="JHR04">JHR04 — Kota Tinggi, Mersing</option>
            </optgroup>
            <optgroup label="Kedah">
              <option value="KDH01">KDH01 — Kota Setar, Kubang Pasu</option>
              <option value="KDH02">KDH02 — Kuala Muda, Yan, Sik</option>
              <option value="KDH05">KDH05 — Langkawi</option>
            </optgroup>
            <optgroup label="Kelantan">
              <option value="KTN01">KTN01 — Kota Bharu, Bachok</option>
              <option value="KTN02">KTN02 — Gua Musang, Kuala Krai</option>
            </optgroup>
            <optgroup label="Lain-lain Negeri">
              <option value="MLK01">MLK01 — Melaka</option>
              <option value="NGS01">NGS01 — Negeri Sembilan (Jempol, Rembau)</option>
              <option value="NGS02">NGS02 — Negeri Sembilan (Seremban)</option>
              <option value="PNG01">PNG01 — Pulau Pinang</option>
              <option value="PLS01">PLS01 — Perlis</option>
            </optgroup>
            <optgroup label="Sabah">
              <option value="SBH01">SBH01 — Kota Kinabalu</option>
              <option value="SBH04">SBH04 — Sandakan</option>
              <option value="SBH05">SBH05 — Tawau</option>
            </optgroup>
            <optgroup label="Sarawak">
              <option value="SWK01">SWK01 — Kuching</option>
              <option value="SWK03">SWK03 — Sibu</option>
              <option value="SWK04">SWK04 — Miri</option>
            </optgroup>
            <optgroup label="Terengganu">
              <option value="TRG01">TRG01 — Kuala Terengganu</option>
              <option value="TRG04">TRG04 — Dungun, Kemaman</option>
            </optgroup>
          </Select>
          <Textarea label="Penerangan" value={mosqueForm.description}
            onChange={(e) => setMosqueForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          <Textarea label="Nota Parking" value={mosqueForm.parking_notes}
            onChange={(e) => setMosqueForm((p) => ({ ...p, parking_notes: e.target.value }))} rows={2} />
          <Textarea label="Nota Operasi" value={mosqueForm.operating_notes}
            onChange={(e) => setMosqueForm((p) => ({ ...p, operating_notes: e.target.value }))} rows={2} />

          <div className="grid grid-cols-2 gap-3 pt-2">
            {([
              ['has_wudhu', 'Tempat Wudhu'],
              ['has_womens_section', 'Seksyen Wanita'],
              ['has_parking', 'Tempat Parking'],
              ['has_accessibility', 'Kemudahan OKU'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={mosqueForm[key]}
                  onChange={(e) => setMosqueForm((p) => ({ ...p, [key]: e.target.checked }))}
                  className="w-4 h-4" style={{ accentColor: 'var(--primary)' }} />
                <span className="text-sm" style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>
                  {label}
                </span>
              </label>
            ))}
          </div>

          <Button type="submit" loading={saving} className="w-full mt-2">
            Simpan Info Masjid
          </Button>
        </form>
      </div>
    </div>
  )
}
