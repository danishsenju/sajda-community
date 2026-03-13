import { NextRequest, NextResponse } from 'next/server'
import { ZONE_LABELS, DEFAULT_ZONE, DEFAULT_LABEL } from '@/lib/prayer-zones'

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lng = req.nextUrl.searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ code: DEFAULT_ZONE, label: DEFAULT_LABEL })
  }

  try {
    const res = await fetch(`https://api.waktusolat.app/zones/${lat}/${lng}`)
    if (!res.ok) throw new Error(`waktusolat.app zones HTTP ${res.status}`)
    const data = await res.json()

    const code: string = data.zone ?? DEFAULT_ZONE
    const label: string = ZONE_LABELS[code] ?? DEFAULT_LABEL
    const city: string = data.district || data.state || ''

    return NextResponse.json({ code, label, city })
  } catch {
    return NextResponse.json({ code: DEFAULT_ZONE, label: DEFAULT_LABEL, city: '' })
  }
}
