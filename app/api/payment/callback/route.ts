import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifySignature, isBillPaid } from '@/lib/billplz'

/**
 * Billplz sends a POST callback when payment status changes.
 * Relevant fields: id, paid (bool), state, amount, paid_amount, x_signature, reference_1
 *
 * Docs: https://www.billplz.com/api#x-signature
 */
export async function POST(req: NextRequest) {
  try {
    const body      = await req.formData()
    const params    = Object.fromEntries(body.entries()) as Record<string, string>
    const billId    = params['id']
    const paid      = params['paid']           // 'true' | 'false'
    const xSig      = params['x_signature'] ?? ''

    if (!billId) {
      return NextResponse.json({ ok: false, message: 'Missing bill ID.' }, { status: 400 })
    }

    // 1. Verify X-Signature to reject forged callbacks
    if (!verifySignature(params, xSig)) {
      console.warn('[payment/callback] Invalid X-Signature')
      return NextResponse.json({ ok: false, message: 'Invalid signature.' }, { status: 401 })
    }

    // 2. Only proceed on successful payment
    if (paid !== 'true') {
      return NextResponse.json({ ok: true, message: 'Payment not completed, ignored.' })
    }

    // 3. Double-verify with Billplz API (prevent replay attacks)
    const confirmed = await isBillPaid(billId)
    if (!confirmed) {
      return NextResponse.json({ ok: false, message: 'Payment verification failed.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 4. Find subscription by bill ID
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, mosque_id, plan')
      .eq('toyyibpay_bill_code', billId)   // column reused for Billplz bill ID
      .single()

    if (!sub) {
      return NextResponse.json({ ok: false, message: 'Subscription not found.' }, { status: 404 })
    }

    // 5. Activate subscription for 1 month
    const now       = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    await supabase
      .from('subscriptions')
      .update({ status: 'active', starts_at: now.toISOString(), expires_at: expiresAt.toISOString() })
      .eq('id', sub.id)

    // 6. Activate mosque
    await supabase
      .from('mosques')
      .update({ is_active: true })
      .eq('id', sub.mosque_id)

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('[payment/callback]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// Billplz may redirect user via GET after payment — redirect gracefully
export async function GET() {
  return NextResponse.redirect('/', { status: 302 })
}
