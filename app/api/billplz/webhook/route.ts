import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient }         from '@/lib/supabase-admin'
import { verifyWebhookSignature, isBillPaid } from '@/lib/billplz'

// Billplz sends a POST with form-encoded params when payment status changes.
// Required params: id, paid (bool string), state, x_signature, reference_1 (mosque_id)
//
// Billplz REQUIRES a 200 response even for unpaid callbacks — any non-200
// triggers repeated retries from their side.
export async function POST(req: NextRequest) {
  // ── 1. Parse form-encoded body ──────────────────────────────────────────
  let params: Record<string, string>
  try {
    const form = await req.formData()
    params = Object.fromEntries(form.entries()) as Record<string, string>
  } catch {
    return NextResponse.json({ ok: false, message: 'Format badan tidak sah.' }, { status: 400 })
  }

  const billId = params['id']
  const paid   = params['paid']          // 'true' | 'false'
  const xSig   = params['x_signature'] ?? ''

  if (!billId) {
    return NextResponse.json({ ok: false, message: 'Bill ID tiada.' }, { status: 400 })
  }

  // ── 2. Verify X-Signature (reject forged callbacks) ────────────────────
  if (!verifyWebhookSignature(params, xSig)) {
    return NextResponse.json({ ok: false, message: 'Tandatangan tidak sah.' }, { status: 400 })
  }

  // ── 3. Return 200 immediately for unpaid callbacks ──────────────────────
  // Billplz calls this endpoint for both paid and unpaid status changes.
  if (paid !== 'true') {
    return NextResponse.json({ ok: true, message: 'Belum bayar, diabaikan.' })
  }

  // ── 4. Double-verify payment with Billplz API (replay-attack guard) ─────
  const confirmed = await isBillPaid(billId)
  if (!confirmed) {
    // Signature was valid but payment not confirmed — suspicious
    return NextResponse.json({ ok: false, message: 'Pengesahan pembayaran gagal.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── 5. Find pending subscription by bill ID ─────────────────────────────
  const { data: sub, error: findErr } = await supabase
    .from('subscriptions')
    .select('id, mosque_id, plan')
    .eq('billplz_bill_id', billId)
    .single()

  if (findErr || !sub) {
    // Could be a duplicate callback for an already-activated subscription.
    // Return 200 so Billplz stops retrying.
    return NextResponse.json({ ok: true, message: 'Langganan tidak ditemui atau sudah aktif.' })
  }

  // ── 6. Activate subscription (30-day window) ────────────────────────────
  const now       = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + 30)

  const { error: subErr } = await supabase
    .from('subscriptions')
    .update({
      status:     'active',
      starts_at:  now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', sub.id)

  if (subErr) {
    return NextResponse.json({ ok: false, message: 'Gagal kemaskini langganan.' }, { status: 500 })
  }

  // ── 7. Activate mosque ──────────────────────────────────────────────────
  await supabase
    .from('mosques')
    .update({ is_active: true })
    .eq('id', sub.mosque_id)

  return NextResponse.json({ ok: true })
}

// Billplz may redirect users via GET after payment — handle gracefully.
export async function GET() {
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard/billing?status=success`,
    { status: 302 },
  )
}
