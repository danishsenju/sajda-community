import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

// Quick debug endpoint — visit /api/push/debug to check push setup
// Remove this file after debugging is done
export async function GET() {
  const checks: Record<string, string> = {}

  // 1. Check env vars
  checks.vapid_public  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? '✅ Set' : '❌ MISSING'
  checks.vapid_private = process.env.VAPID_PRIVATE_KEY ? '✅ Set' : '❌ MISSING'
  checks.vapid_email   = process.env.VAPID_EMAIL ? `✅ ${process.env.VAPID_EMAIL}` : '❌ MISSING'

  // 2. Check subscription count in DB
  try {
    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (admin as any)
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })

    if (error) {
      checks.db_table = `❌ Error: ${error.message}`
    } else {
      checks.db_table = `✅ Table exists — ${count ?? 0} subscription(s) saved`
    }
  } catch (e) {
    checks.db_table = `❌ Exception: ${String(e)}`
  }

  return NextResponse.json(checks, { status: 200 })
}
