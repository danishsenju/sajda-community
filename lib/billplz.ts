import { createHmac } from 'crypto'

export type PlanKey = 'surau' | 'kariah' | 'komuniti'

// Canonical plan config — amounts in cents (RM × 100)
export const PLAN_PRICES = {
  surau:    { amount: 4900,  label: 'Surau' },
  kariah:   { amount: 14900, label: 'Kariah' },
  komuniti: { amount: 34900, label: 'Komuniti' },
} as const satisfies Record<PlanKey, { amount: number; label: string }>

// ── Helpers ──────────────────────────────────────────────────────────────────

function baseUrl(): string {
  // Keep sandbox URL hard-coded per spec; swap to live URL in production env
  return process.env.BILLPLZ_SANDBOX !== 'false'
    ? 'https://billplz-sandbox.com/api/v3'
    : 'https://www.billplz.com/api/v3'
}

function authHeader(): string {
  const key     = process.env.BILLPLZ_API_KEY ?? ''
  const encoded = Buffer.from(`${key}:`).toString('base64')
  return `Basic ${encoded}`
}

function collectionId(plan: PlanKey): string {
  switch (plan) {
    case 'surau':    return process.env.BILLPLZ_COLLECTION_ID_SURAU    ?? ''
    case 'kariah':   return process.env.BILLPLZ_COLLECTION_ID_KARIAH   ?? ''
    case 'komuniti': return process.env.BILLPLZ_COLLECTION_ID_KOMUNITI ?? ''
  }
}

// ── Create a Billplz bill ─────────────────────────────────────────────────────
export async function createBill(params: {
  plan:        PlanKey
  email:       string
  name:        string          // mosque name shown on receipt
  mosqueId:    string          // stored in reference_1 for webhook lookup
  callbackUrl: string
  redirectUrl: string
}): Promise<{ billId: string; billUrl: string }> {
  const { plan, email, name, mosqueId, callbackUrl, redirectUrl } = params
  const { amount, label } = PLAN_PRICES[plan]

  const body = new URLSearchParams({
    collection_id:     collectionId(plan),
    name,
    email,
    amount:            String(amount),
    description:       `SAJDA ${label} - ${name}`,
    callback_url:      callbackUrl,
    redirect_url:      redirectUrl,
    reference_1_label: 'mosque_id',
    reference_1:       mosqueId,
  })

  const res  = await fetch(`${baseUrl()}/bills`, {
    method:  'POST',
    headers: {
      Authorization:  authHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const data = await res.json() as Record<string, unknown>

  if (!res.ok) {
    const errType = (data?.error as Record<string, unknown>)?.type
    const errMsg  = typeof errType === 'string' ? errType : JSON.stringify(data?.error ?? data)
    throw new Error(`Billplz: ${errMsg}`)
  }

  return {
    billId:  data.id  as string,
    billUrl: data.url as string,
  }
}

// ── Verify Billplz X-Signature ────────────────────────────────────────────────
// Billplz builds the signed message by sorting all param keys (excluding
// x_signature), then joining as "key1value1|key2value2|..." — HMAC-SHA256.
export function verifyWebhookSignature(
  params:   Record<string, string>,
  received: string,
): boolean {
  const secret = process.env.BILLPLZ_X_SIGNATURE
  if (!secret) return false

  const sortedKeys = Object.keys(params)
    .filter(k => k !== 'x_signature')
    .sort()

  const message  = sortedKeys.map(k => `${k}${params[k]}`).join('|')
  const computed = createHmac('sha256', secret).update(message).digest('hex')

  return computed === received
}

// ── Double-verify a bill via GET (replay-attack guard) ────────────────────────
export async function isBillPaid(billId: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl()}/bills/${billId}`, {
      headers: { Authorization: authHeader() },
    })
    if (!res.ok) return false
    const data = await res.json() as Record<string, unknown>
    return data.paid === true
  } catch {
    return false
  }
}
