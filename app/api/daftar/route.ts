import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createBill, PlanKey } from '@/lib/billplz'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(req: NextRequest) {
  try {
    const { mosque: mosqueData, admin, plan } = await req.json()

    if (!mosqueData?.name || !admin?.email || !admin?.password || !plan) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin

    // 1. Create the auth user account for the mosque admin
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email:          admin.email,
      password:       admin.password,
      email_confirm:  false,  // they'll get a confirmation email
      user_metadata:  { full_name: admin.fullName },
    })

    if (authError) {
      const msg = authError.message.includes('already registered')
        ? 'E-mel ini sudah didaftarkan. Sila gunakan e-mel lain.'
        : authError.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const userId = authData.user.id

    // 2. Generate unique slug for the mosque
    let slug = slugify(mosqueData.name)
    const { data: existingSlug } = await adminClient
      .from('mosques')
      .select('slug')
      .eq('slug', slug)
      .single()
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // 3. Insert the mosque row (is_active = false until payment confirmed)
    const { data: newMosque, error: mosqueError } = await adminClient
      .from('mosques')
      .insert({
        slug,
        name:                 mosqueData.name,
        category:             mosqueData.category ?? 'masjid',
        state:                mosqueData.state,
        address:              mosqueData.address,
        phone:                mosqueData.phone,
        jakim_zone:           mosqueData.jakim_zone ?? 'SGR01',
        is_active:            false,
      })
      .select('id')
      .single()

    if (mosqueError || !newMosque) {
      // Roll back the user creation on mosque insert failure
      await adminClient.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Gagal menyimpan maklumat masjid.' }, { status: 500 })
    }

    const mosqueId = newMosque.id

    // 4. Add the user as mosque admin in mosque_ajk
    await adminClient.from('mosque_ajk').insert({
      mosque_id:  mosqueId,
      user_id:    userId,
      role:       'admin',
    })

    // 5. Create a pending subscription row
    const priceMap: Record<string, number> = { surau: 59, kariah: 119, komuniti: 219 }
    const { data: sub, error: subError } = await adminClient
      .from('subscriptions')
      .insert({
        mosque_id:  mosqueId,
        plan:       plan,
        status:     'pending',
        amount_rm:  priceMap[plan] ?? 99,
      })
      .select('id')
      .single()

    if (subError || !sub) {
      await adminClient.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Gagal mencipta langganan.' }, { status: 500 })
    }

    // 6. Create Billplz bill — {bill_id} is a Billplz URL template placeholder, replaced by Billplz on redirect
    const { billId, paymentUrl } = await createBill({
      mosqueId,
      plan:        plan as PlanKey,
      email:       admin.email,
      name:        mosqueData.name,
      redirectUrl: `${origin}/daftar/berjaya?bill_id={bill_id}&mosque_id=${mosqueId}&sub_id=${sub.id}`,
      callbackUrl: `${origin}/api/payment/callback`,
    })

    // 7. Save the Billplz bill ID on the subscription row (column named toyyibpay_bill_code — repurposed)
    await adminClient
      .from('subscriptions')
      .update({ toyyibpay_bill_code: billId })
      .eq('id', sub.id)

    return NextResponse.json({ checkoutUrl: paymentUrl })

  } catch (err) {
    console.error('[daftar]', err)
    return NextResponse.json({ error: 'Ralat dalaman. Sila cuba semula.' }, { status: 500 })
  }
}
