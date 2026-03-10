import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
  // Verify caller is AJK/superadmin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['ajk', 'superadmin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, body, url = '/' } = await req.json()
  if (!title || !body) return NextResponse.json({ error: 'title and body required' }, { status: 400 })

  // Read all subscriptions using service role (bypasses RLS)
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data: subs } = await admin.from('push_subscriptions').select('*')
  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const payload = JSON.stringify({ title, body, url, icon: '/icons/icon.svg' })

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        payload,
      )
    )
  )

  // Clean up expired subscriptions (410 Gone)
  const expiredEndpoints = subs
    .filter((_, i) => {
      const r = results[i]
      return r.status === 'rejected' &&
        (r.reason as { statusCode?: number })?.statusCode === 410
    })
    .map(s => s.endpoint)

  if (expiredEndpoints.length) {
    await admin.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
  }

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: subs.length })
}
