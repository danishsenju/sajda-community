import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase-admin'
import { createBill, PLAN_PRICES }   from '@/lib/billplz'
import type { PlanKey }              from '@/lib/billplz'

interface CreateBillBody {
  plan:        string
  mosque_name: string
  email:       string
  mosque_id:   string
}

const VALID_PLANS = new Set<string>(['surau', 'kariah', 'komuniti'])

export async function POST(req: NextRequest) {
  // ── 1. Parse + validate body ────────────────────────────────────────────
  let body: CreateBillBody
  try {
    body = await req.json() as CreateBillBody
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Format permintaan tidak sah.' },
      { status: 400 },
    )
  }

  const { plan, mosque_name, email, mosque_id } = body

  if (!plan || !mosque_name || !email || !mosque_id) {
    return NextResponse.json(
      { ok: false, message: 'Semua medan diperlukan: plan, mosque_name, email, mosque_id.' },
      { status: 400 },
    )
  }

  if (!VALID_PLANS.has(plan)) {
    return NextResponse.json(
      { ok: false, message: 'Pelan tidak sah. Sila pilih: surau, kariah, atau komuniti.' },
      { status: 400 },
    )
  }

  const planKey    = plan as PlanKey
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const callbackUrl = `${appUrl}/api/billplz/webhook`
  const redirectUrl = `${appUrl}/dashboard/billing?status=success`

  // ── 2. Call Billplz API ─────────────────────────────────────────────────
  let billId: string
  let billUrl: string

  try {
    const result = await createBill({
      plan:        planKey,
      email,
      name:        mosque_name,
      mosqueId:    mosque_id,
      callbackUrl,
      redirectUrl,
    })
    billId  = result.billId
    billUrl = result.billUrl
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { ok: false, message: `Ralat pembayaran. Sila hubungi kami di hello@sajda.my. (${msg})` },
      { status: 502 },
    )
  }

  // ── 3. Create a pending subscription row ────────────────────────────────
  const supabase = createAdminClient()
  const amountRm = PLAN_PRICES[planKey].amount / 100   // cents → RM

  const { error: dbErr } = await supabase
    .from('subscriptions')
    .upsert(
      {
        mosque_id:      mosque_id,
        plan:           planKey,
        status:         'pending',
        amount_rm:      amountRm,
        billing_cycle:  'monthly',
        billplz_bill_id: billId,
      },
      { onConflict: 'mosque_id' },   // one active subscription per mosque
    )

  if (dbErr) {
    // Non-fatal — payment can still proceed, webhook will activate
    // Log internally but don't expose DB error to client
    void dbErr
  }

  // ── 4. Return bill details to client ────────────────────────────────────
  return NextResponse.json({ ok: true, bill_url: billUrl, bill_id: billId })
}
