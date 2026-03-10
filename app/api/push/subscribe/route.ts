import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createRaw } from '@supabase/supabase-js'

// Untyped client for push_subscriptions (not yet in generated DB types)
function rawClient() {
  return createRaw(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { endpoint, keys } = body

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
  }

  const { error } = await rawClient().from('push_subscriptions').upsert({
    user_id:  user.id,
    endpoint,
    p256dh:   keys.p256dh,
    auth_key: keys.auth,
  }, { onConflict: 'endpoint' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { endpoint } = await req.json()
  await rawClient().from('push_subscriptions').delete()
    .eq('user_id', user.id).eq('endpoint', endpoint)

  return NextResponse.json({ ok: true })
}
