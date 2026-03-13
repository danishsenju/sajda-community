import { NextRequest, NextResponse } from 'next/server'

const JAKIM_KEYS = ['imsak', 'fajr', 'syuruk', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

// Cache per zone per day: key = "SGR01:2026-03-14"
const memCache = new Map<string, { data: unknown; expires: number }>()

export async function GET(req: NextRequest) {
  const zone = req.nextUrl.searchParams.get('zone') ?? 'SGR01'

  // Validate zone format (e.g. SGR01, WLY01, JHR02)
  if (!/^[A-Z]{2,3}\d{2}$/.test(zone)) {
    return NextResponse.json({ error: 'Invalid zone' }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = `${zone}:${today}`

  // In-memory cache hit
  const cached = memCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    })
  }

  // Fetch from JAKIM
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(
      `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`,
      { signal: controller.signal, next: { revalidate: 3600 } }
    )
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`JAKIM HTTP ${res.status}`)
    const json = await res.json()
    if (json.status !== 'OK!') throw new Error('JAKIM status not OK')

    const pt = json.prayerTime?.[0]
    if (!pt) throw new Error('No prayerTime data')

    const times = JAKIM_KEYS.map(k => (typeof pt[k] === 'string' ? (pt[k] as string).slice(0, 5) : null))
    const payload = { source: 'jakim', zone, times, hijri: pt.hijri ?? '', date: today }

    // Store in memory cache for 1 hour
    memCache.set(cacheKey, { data: payload, expires: Date.now() + 3600_000 })

    return NextResponse.json(payload, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    })
  } catch (err) {
    // Aladhan fallback — fixed KL coordinates (close enough for zone fallback)
    try {
      const d = new Date()
      const aladhanUrl = `https://api.aladhan.com/v1/timings/${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}?latitude=3.1716&longitude=101.5344&method=11`
      const controller2 = new AbortController()
      const timeout2 = setTimeout(() => controller2.abort(), 8000)
      const res2 = await fetch(aladhanUrl, { signal: controller2.signal })
      clearTimeout(timeout2)
      if (!res2.ok) throw new Error('Aladhan failed')
      const json2 = await res2.json()
      const t = json2?.data?.timings
      if (!t) throw new Error('No timings')

      const fajrMin = parseInt(t.Fajr?.slice(0, 2)) * 60 + parseInt(t.Fajr?.slice(3, 5))
      const imsakMin = fajrMin - 10
      const imsak = `${String(Math.floor(imsakMin / 60)).padStart(2, '0')}:${String(imsakMin % 60).padStart(2, '0')}`

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
