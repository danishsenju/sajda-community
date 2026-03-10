import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// WaktuSolat.app API — free, no API key, data from JAKIM
// GET https://api.waktusolat.app/v2/solat/{zone}?month={1-12}&year={yyyy}
const WAKTUSOLAT_BASE = 'https://api.waktusolat.app/v2/solat'

type WaktuSolatEntry = {
  day: number
  hijri: string
  fajr: number    // Unix timestamp
  syuruk: number  // Unix timestamp
  dhuhr: number   // Unix timestamp
  asr: number     // Unix timestamp
  maghrib: number // Unix timestamp
  isha: number    // Unix timestamp
}

type WaktuSolatResponse = {
  zone: string
  year: number
  month_number: number
  prayers: WaktuSolatEntry[]
}

// Convert Unix timestamp → "HH:MM" in Malaysia time
function tsToTime(ts: number): string {
  const d = new Date(ts * 1000)
  const h = d.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' })
  const m = d.toLocaleString('en-US', { minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' })
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

async function fetchWaktuSolatMonth(zone: string, year: number, month: number): Promise<{ entries: WaktuSolatEntry[]; yearActual: number; monthActual: number }> {
  const url = `${WAKTUSOLAT_BASE}/${zone}?month=${month}&year=${year}`
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`WaktuSolat API returned ${res.status}`)
  const json: WaktuSolatResponse = await res.json()
  if (!Array.isArray(json.prayers)) {
    throw new Error('WaktuSolat API returned unexpected format')
  }
  return { entries: json.prayers, yearActual: json.year, monthActual: json.month_number }
}

export async function POST() {
  try {
    const supabase = await createClient()

    // Read zone from mosque_info
    const { data: mosqueData, error: mosqueError } = await supabase
      .from('mosque_info')
      .select('jakim_zone')
      .eq('id', 1)
      .single()

    if (mosqueError || !mosqueData) {
      return NextResponse.json({ error: 'Gagal baca info masjid' }, { status: 500 })
    }

    const zone = mosqueData.jakim_zone || 'SGR02'

    const nowMY = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }))
    const cutoff = new Date(nowMY)
    cutoff.setDate(cutoff.getDate() + 30)

    // Fetch current month
    const { entries, yearActual, monthActual } = await fetchWaktuSolatMonth(
      zone,
      nowMY.getFullYear(),
      nowMY.getMonth() + 1
    )

    // If cutoff spills into next month, fetch that too
    if (cutoff.getMonth() !== nowMY.getMonth()) {
      const { entries: nextEntries, yearActual: ny, monthActual: nm } = await fetchWaktuSolatMonth(
        zone,
        cutoff.getFullYear(),
        cutoff.getMonth() + 1
      )
      // Tag entries with their year/month for date construction
      entries.push(...nextEntries.map(e => ({ ...e, _year: ny, _month: nm })))
    }

    const todayStr = nowMY.toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })
    const cutoffStr = cutoff.toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })

    // Build rows — construct ISO date from year/month/day
    const rows = entries
      .map((e) => {
        const yr = (e as WaktuSolatEntry & { _year?: number })._year ?? yearActual
        const mo = (e as WaktuSolatEntry & { _month?: number })._month ?? monthActual
        const dateStr = `${yr}-${String(mo).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`
        return {
          date: dateStr,
          fajr: tsToTime(e.fajr),
          syuruk: e.syuruk ? tsToTime(e.syuruk) : null,
          dhuhr: tsToTime(e.dhuhr),
          asr: tsToTime(e.asr),
          maghrib: tsToTime(e.maghrib),
          isha: tsToTime(e.isha),
        }
      })
      .filter((r) => r.date >= todayStr && r.date <= cutoffStr)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Tiada data untuk disegerakkan' }, { status: 400 })
    }

    // Upsert — update existing rows too so times stay accurate
    const { error } = await supabase
      .from('prayer_times')
      .upsert(rows, { onConflict: 'date', ignoreDuplicates: false })

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ synced: rows.length, from: todayStr, to: cutoffStr, zone })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ralat tidak diketahui'
    console.error('Prayer sync error:', message)
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

// Allow GET too for easy browser testing
export const GET = POST
