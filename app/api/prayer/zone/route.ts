import { NextRequest, NextResponse } from 'next/server'
import { resolveZone, DEFAULT_ZONE, DEFAULT_LABEL } from '@/lib/prayer-zones'

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lng = req.nextUrl.searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ code: DEFAULT_ZONE, label: DEFAULT_LABEL })
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'KariahApp/1.0' } }
    )
    const data = await res.json()
    const addr = data.address ?? {}
    const zone = resolveZone({
      state:   addr.state,
      county:  addr.county,
      city:    addr.city,
      town:    addr.town,
      village: addr.village,
      suburb:  addr.suburb,
    })
    const city = addr.city || addr.town || addr.village || addr.county || addr.state || ''
    return NextResponse.json({ ...zone, city })
  } catch {
    return NextResponse.json({ code: DEFAULT_ZONE, label: DEFAULT_LABEL, city: '' })
  }
}
