import { createClient } from './supabase-server'

const WAKTUSOLAT_BASE = 'https://api.waktusolat.app/v2/solat'

function tsToTime(ts: number): string {
  const d = new Date(ts * 1000)
  const h = d.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' })
  const m = d.toLocaleString('en-US', { minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' })
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

/**
 * Returns today's prayer times from DB.
 * If not found, auto-fetches from WaktuSolat.app, saves to DB, then returns.
 * Silent fail — returns null if API is unreachable.
 */
export async function getTodayPrayerTimes() {
  const supabase = await createClient()
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })

  // Fast path — already in DB
  const { data: existing } = await supabase
    .from('prayer_times')
    .select('*')
    .eq('date', today)
    .maybeSingle()

  if (existing) return existing

  // Slow path — fetch from WaktuSolat.app
  try {
    const { data: mosque } = await supabase
      .from('mosque_info')
      .select('jakim_zone')
      .eq('id', 1)
      .single()

    const zone = mosque?.jakim_zone ?? 'SGR02'
    const nowMY = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }))
    const year = nowMY.getFullYear()
    const month = nowMY.getMonth() + 1
    const day = nowMY.getDate()

    const res = await fetch(`${WAKTUSOLAT_BASE}/${zone}?month=${month}&year=${year}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null

    const json = await res.json()
    if (!Array.isArray(json.prayers)) return null

    const entry = json.prayers.find((p: { day: number }) => p.day === day)
    if (!entry) return null

    const row = {
      date: today,
      fajr: tsToTime(entry.fajr),
      syuruk: entry.syuruk ? tsToTime(entry.syuruk) : null,
      dhuhr: tsToTime(entry.dhuhr),
      asr: tsToTime(entry.asr),
      maghrib: tsToTime(entry.maghrib),
      isha: tsToTime(entry.isha),
    }

    // Save to DB (best-effort, don't block on error)
    await supabase.from('prayer_times').upsert(row, { onConflict: 'date', ignoreDuplicates: true })

    return row
  } catch {
    return null
  }
}
