import { NextRequest, NextResponse } from 'next/server'
import { createClient as createRaw } from '@supabase/supabase-js'

// Called by service worker action button — snooze alarm for 10 minutes
export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const snoozedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const admin = createRaw(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await admin
    .from('qiam_alarms')
    .update({ snoozed_until: snoozedUntil, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, snoozed_until: snoozedUntil })
}
