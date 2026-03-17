import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

// POST — save a new push subscription
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint, keys } = body as {
      endpoint: string
      keys: { p256dh: string; auth: string }
    }

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    // Get current user (optional — allow anonymous push if no user)
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()

    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user?.id ?? null,
          endpoint,
          p256dh: keys.p256dh,
          auth_key: keys.auth,
        },
        { onConflict: 'endpoint' }
      )

    if (error) {
      console.error('push subscribe error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('push subscribe unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE — remove a subscription by endpoint
export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })

    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('push unsubscribe error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
