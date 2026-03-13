import { NextRequest, NextResponse } from 'next/server'

// Cache per zone per MYT day: key = "SGR01:2026-03-14"
const memCache = new Map<string, { data: unknown; expires: number }>()

/** Malaysia is UTC+8. Vercel runs UTC — always use this for correct date. */
function mytDate(): { day: number; month: number; year: number; iso: string } {
  const myt = new Date(Date.now() + 8 * 3600_000)
  const day   = myt.getUTCDate()
  const month = myt.getUTCMonth() + 1
  const year  = myt.getUTCFullYear()
  const iso   = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return { day, month, year, iso }
}

function imsakFromFajr(fajr: string): string {
  const [h, m] = fajr.split(':').map(Number)
  const total = h * 60 + m - 10
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export async function GET(req: NextRequest) {
  const zone = req.nextUrl.searchParams.get('zone') ?? 'SGR01'

  // Validate zone format (e.g. SGR01, WLY01, JHR02)
  if (!/^[A-Z]{2,3}\d{2}$/.test(zone)) {
    return NextResponse.json({ error: 'Invalid zone' }, { status: 400 })
  }

  const { day, month, year, iso: today } = mytDate()
  const cacheKey = `${zone}:${today}`

  // In-memory cache hit
  const cached = memCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    })
  }

  // Primary: waktusolat.app — explicit day+month+year using MYT date
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(
      `https://api.waktusolat.app/solat/${zone}/${day}?month=${month}&year=${year}`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`waktusolat.app HTTP ${res.status}`)
    const json = await res.json()
    if (json.status !== 'OK!') throw new Error('waktusolat.app status not OK')

    // Single-day endpoint returns prayerTime as a plain object (not array)
    const pt = json.prayerTime
    if (!pt || typeof pt !== 'object' || Array.isArray(pt)) throw new Error('Unexpected prayerTime shape')

    const imsak = imsakFromFajr(pt.fajr as string)
    const times = [imsak, pt.fajr, pt.syuruk, pt.dhuhr, pt.asr, pt.maghrib, pt.isha]
      .map(t => (typeof t === 'string' ? t.slice(0, 5) : null))
    const payload = { source: 'jakim', zone, times, hijri: pt.hijri ?? '', date: today }

    // Cache until start of next MYT day (avoids stale times after midnight MYT)
    const nextMytMidnight = new Date(Date.now() + 8 * 3600_000)
    nextMytMidnight.setUTCHours(16, 0, 0, 0) // 16:00 UTC = 00:00 MYT next day
    if (nextMytMidnight.getTime() <= Date.now()) nextMytMidnight.setUTCDate(nextMytMidnight.getUTCDate() + 1)
    memCache.set(cacheKey, { data: payload, expires: nextMytMidnight.getTime() })

    return NextResponse.json(payload, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    })
  } catch (err) {
    // Aladhan fallback — method=11 (JAKIM), KL coordinates, with correct MYT date
    try {
      const aladhanUrl = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=3.1716&longitude=101.5344&method=11`
      const controller2 = new AbortController()
      const timeout2 = setTimeout(() => controller2.abort(), 8000)
      const res2 = await fetch(aladhanUrl, { signal: controller2.signal })
      clearTimeout(timeout2)
      if (!res2.ok) throw new Error('Aladhan failed')
      const json2 = await res2.json()
      const t = json2?.data?.timings
      if (!t) throw new Error('No timings')

      const imsak = imsakFromFajr(t.Fajr as string)
      const times = [imsak, t.Fajr?.slice(0,5), t.Sunrise?.slice(0,5), t.Dhuhr?.slice(0,5), t.Asr?.slice(0,5), t.Maghrib?.slice(0,5), t.Isha?.slice(0,5)]
      const payload = { source: 'aladhan', zone, times, hijri: json2?.data?.date?.hijri?.date ?? '', date: today }

      memCache.set(cacheKey, { data: payload, expires: Date.now() + 3600_000 })
      return NextResponse.json(payload, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
      })
    } catch {
      return NextResponse.json({ error: 'Prayer times unavailable', detail: String(err) }, { status: 503 })
    }
  }
}
