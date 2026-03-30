export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase-admin'
import { getMosqueById } from '@/lib/mosque'
import { isBillPaid } from '@/lib/billplz'
import sajdaLogo from '@/images/sajda-logo.png'
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react'

interface Props {
  searchParams: Promise<{
    bill_id?:  string
    status_id?: string
    mosque_id?: string
    sub_id?:    string
  }>
}

export default async function BerjayaPage({ searchParams }: Props) {
  const { bill_id, status_id, mosque_id, sub_id } = await searchParams

  const success = status_id === '1'
  let mosque = mosque_id ? await getMosqueById(mosque_id) : null

  // Activate mosque + subscription if payment was successful (in case callback hasn't fired yet)
  if (success && bill_id && mosque_id) {
    const paid = await isBillPaid(bill_id).catch(() => false)
    if (paid) {
      const supabase = createAdminClient()
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      await supabase.from('mosques').update({ is_active: true }).eq('id', mosque_id)

      if (sub_id) {
        await supabase.from('subscriptions').update({
          status:     'active',
          starts_at:  now.toISOString(),
          expires_at: expiresAt.toISOString(),
        }).eq('id', sub_id)
      }

      // Re-fetch mosque (now active)
      mosque = await getMosqueById(mosque_id)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
    }}>
      <Image
        src={sajdaLogo}
        alt="Sajda"
        height={36}
        width={116}
        style={{ filter: 'brightness(0) invert(1)', marginBottom: '36px' }}
      />

      {success ? (
        <>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(34,197,94,0.1)',
            border: '2px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <CheckCircle style={{ width: '36px', height: '36px', color: '#22C55E' }} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '28px',
            fontWeight: 700,
            color: '#F0FDF4',
            marginBottom: '10px',
          }}>
            Pembayaran Berjaya!
          </h1>

          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '15px',
            color: 'rgba(186,230,200,0.6)',
            marginBottom: '8px',
            maxWidth: '420px',
          }}>
            {mosque
              ? `${mosque.name} kini aktif di Sajda.`
              : 'Masjid anda kini aktif di Sajda.'}
          </p>

          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            color: 'rgba(186,230,200,0.4)',
            marginBottom: '32px',
            maxWidth: '380px',
          }}>
            Semak e-mel anda untuk mengesahkan akaun pentadbir, kemudian log masuk ke dashboard admin.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {mosque?.slug && (
              <Link href={`/${mosque.slug}`} style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: '#22C55E',
                color: '#08090E',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                Pergi ke Halaman Masjid <ChevronRight style={{ width: '14px', height: '14px' }} />
              </Link>
            )}
            <Link href="/login" style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#F0FDF4',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Log Masuk Admin
            </Link>
          </div>
        </>
      ) : (
        <>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            border: '2px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <XCircle style={{ width: '36px', height: '36px', color: '#EF4444' }} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '28px',
            fontWeight: 700,
            color: '#F0FDF4',
            marginBottom: '10px',
          }}>
            Pembayaran Gagal
          </h1>

          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '15px',
            color: 'rgba(186,230,200,0.6)',
            marginBottom: '32px',
            maxWidth: '380px',
          }}>
            Pembayaran tidak berjaya atau dibatalkan. Masjid anda belum diaktifkan.
            Sila cuba semula.
          </p>

          <Link href="/daftar" style={{
            padding: '12px 24px',
            borderRadius: '12px',
            background: '#22C55E',
            color: '#08090E',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            Cuba Semula
          </Link>
        </>
      )}
    </div>
  )
}
