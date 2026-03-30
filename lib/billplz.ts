import { createHmac } from 'crypto'

export type PlanKey = 'surau' | 'kariah' | 'komuniti'

const PLAN_AMOUNT_CENTS: Record<PlanKey, number> = {
  surau:    5900,
  kariah:   11900,
  komuniti: 21900,
}

const PLAN_LABEL: Record<PlanKey, string> = {
  surau:    'Sajda Surau',
  kariah:   'Sajda Kariah',
  komuniti: 'Sajda Komuniti',
}

function base(): string {
  return process.env.BILLPLZ_SANDBOX === 'true'
    ? 'https://www.billplz-sandbox.com/api/v3'
    : 'https://www.billplz.com/api/v3'
}

function authHeader(): string {
  const encoded = Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString('base64')
  return `Basic ${encoded}`
}

// ── Create a Billplz bill and return the payment URL ──────────────────────────
export async function createBill(params: {
  mosqueId:    string
  plan:        PlanKey
  email:       string
  name:        string
  redirectUrl: string
  callbackUrl: string
}): Promise<{ billId: string; paymentUrl: string }> {
  const { mosqueId, plan, email, name, redirectUrl, callbackUrl } = params
  const amount = PLAN_AMOUNT_CENTS[plan]

  const body = new URLSearchParams({
    collection_id:     process.env.BILLPLZ_COLLECTION_ID!,
    name,
    email,
    amount:            String(amount),
    description:       `Langganan ${PLAN_LABEL[plan]} (bulanan)`,
    redirect_url:      redirectUrl,
    callback_url:      callbackUrl,
    reference_1_label: 'Mosque ID',
    reference_1:       mosqueId,
  })

  const res = await fetch(`${base()}/bills`, {
    method:  'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = data?.error?.type ?? JSON.stringify(data?.error ?? data)
    throw new Error(`Billplz: ${msg}`)
  }

  return { billId: data.id as string, paymentUrl: data.url as string }
}

// ── Verify the X-Signature sent in Billplz webhook callbacks ──────────────────
export function verifySignature(
  params: Record<string, string>,
  receivedSignature: string
): boolean {
  const key = process.env.BILLPLZ_X_SIGNATURE_KEY
  if (!key) return false

  // Exclude x_signature from the payload before building the message
  const sortedKeys = Object.keys(params)
    .filter(k => k !== 'x_signature')
    .sort()

  const message = sortedKeys.map(k => `${k}${params[k]}`).join('|')
  const computed = createHmac('sha256', key).update(message).digest('hex')

  return computed === receivedSignature
}

// ── Check if a bill has been paid (double-verify after webhook) ───────────────
export async function isBillPaid(billId: string): Promise<boolean> {
  try {
    const res = await fetch(`${base()}/bills/${billId}`, {
      headers: { Authorization: authHeader() },
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.paid === true
  } catch {
    return false
  }
}
