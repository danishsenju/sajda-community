import { NextRequest, NextResponse } from 'next/server'
import { createClient as createRaw } from '@supabase/supabase-js'
import webpush from 'web-push'

// Called by Vercel Cron every minute.
// Vercel automatically sets: Authorization: Bearer {CRON_SECRET}
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )

  // Current Malaysia time (UTC+8), format HH:MM:00
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(now.getUTCMinutes()).padStart(2, '0')
  const currentTime = `${hh}:${mm}:00`

  const admin = createRaw(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const nowISO = new Date().toISOString()

  // Find all active alarms matching this exact minute (skip snoozed ones)
  const { data: alarms } = await admin
    .from('qiam_alarms')
    .select('user_id')
    .eq('is_active', true)
    .eq('alarm_time', currentTime)
    .or(`snoozed_until.is.null,snoozed_until.lt.${nowISO}`)

  if (!alarms?.length) {
    return NextResponse.json({ sent: 0, time: currentTime })
  }

  const userIds = alarms.map((a: { user_id: string }) => a.user_id)

  // Get push subscriptions for these users (include user_id to embed in payload)
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth_key, user_id')
    .in('user_id', userIds)

  if (!subs?.length) {
    return NextResponse.json({ sent: 0, time: currentTime })
  }

  const results = await Promise.allSettled(
    subs.map((sub: { endpoint: string; p256dh: string; auth_key: string; user_id: string }) => {
      const payload = JSON.stringify({
        title: '🌙 Masa Qiam al-Lail',
        body: 'Bangun dan solat sunat Tahajud. Sepertiga malam terakhir — waktu yang paling mustajab.',
        url: '/solat',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'qiam-alarm',
        requireInteraction: true,
        userId: sub.user_id,
        actions: [
          { action: 'snooze', title: '⏰ Snooze 10 min' },
          { action: 'off',    title: '🔕 Matikan Alarm' },
        ],
      })
      return webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        payload,
      )
    })
  )

  // Clean up expired subscriptions (410 Gone)
  const expiredEndpoints = subs
    .filter((_: unknown, i: number) => {
      const r = results[i]
      return r.status === 'rejected' &&
        (r.reason as { statusCode?: number })?.statusCode === 410
    })
    .map((s: { endpoint: string }) => s.endpoint)

  if (expiredEndpoints.length) {
    await admin.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
  }

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: subs.length, time: currentTime })
}
