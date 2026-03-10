import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createRaw } from '@supabase/supabase-js'

function rawClient() {
  return createRaw(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// GET — fetch current user's alarm setting
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ alarm: null })

  const { data } = await rawClient()
    .from('qiam_alarms')
    .select('alarm_time, is_active')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ alarm: data ?? { alarm_time: '03:30', is_active: false } })
}

// POST — save (upsert) alarm setting
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { alarm_time, is_active } = await req.json()
  if (!alarm_time) return NextResponse.json({ error: 'alarm_time required' }, { status: 400 })

  // Normalise to HH:MM:00 so matching works
  const [h, m] = alarm_time.split(':')
  const normalised = `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`

  const { error } = await rawClient()
    .from('qiam_alarms')
    .upsert({
      user_id: user.id,
      alarm_time: normalised,
      is_active: Boolean(is_active),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, alarm_time: normalised, is_active })
}
