import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Verify caller is AJK or superadmin
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['ajk', 'superadmin'].includes(profile.role ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, body, url, tag } = await req.json() as {
      title: string
      body: string
      url?: string
      tag?: string
    }

    if (!title || !body) {
      return NextResponse.json({ error: 'title and body required' }, { status: 400 })
    }

    // Fetch all subscriptions
    const admin = createAdminClient()
    const { data: subs, error: fetchErr } = await admin
      .from('push_subscriptions' as never)
      .select('endpoint, p256dh, auth_key')

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      tag: tag || `kariah-${Date.now()}`,
    })

    let sent = 0
    let failed = 0
    const staleEndpoints: string[] = []

    await Promise.allSettled(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (subs as any[]).map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth_key },
            },
            payload
          )
          sent++
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode
          if (status === 404 || status === 410) {
            // Subscription expired/gone — clean up
            staleEndpoints.push(sub.endpoint)
          }
          failed++
        }
      })
    )

    // Remove stale subscriptions
    if (staleEndpoints.length > 0) {
      await admin
        .from('push_subscriptions' as never)
        .delete()
        .in('endpoint', staleEndpoints)
    }

    return NextResponse.json({ ok: true, sent, failed })
  } catch (err) {
    console.error('push send error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
