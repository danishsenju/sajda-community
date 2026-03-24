'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ChevronLeft, Clock, MapPin, Shield, Heart, Share2, Copy, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'

// Dynamic map for viewing location
const ViewMap = dynamic(() => import('./ViewMap'), { ssr: false })

type Notice = {
  id: string
  deceased_name: string
  age: number | null
  death_date: string
  jenazah_time: string | null
  jenazah_location: string | null
  burial_location_text: string | null
  burial_lat: number | null
  burial_lng: number | null
  notes: string | null
  is_verified: boolean
  posted_by: string | null
  created_at: string
  verified_at: string | null
  profiles?: { full_name: string | null } | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function JanaizDetailPage({ params }: { params: { id: string } }) {
  const { isAJK, user } = useUser()
  const [notice,   setNotice]   = useState<Notice | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('janaiz_notices')
        .select('*, profiles(full_name)')
        .eq('id', params.id)
        .single()

      if (error || !data) { setNotFound(true) }
      else { setNotice(data as unknown as Notice) }
      setLoading(false)
    }
    load()
  }, [params.id])

  async function handleVerify() {
    if (!notice || !user) return
    setVerifying(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('janaiz_notices')
      .update({ is_verified: true, verified_by: user.id, verified_at: new Date().toISOString() })
      .eq('id', notice.id)
      .select()
      .single()
    if (data) setNotice(data as unknown as Notice)
    setVerifying(false)
  }

  async function handleShare() {
    if (!notice) return
    const text = `Innalillahi wa inna ilaihi raaji'un\n\nTelah kembali ke rahmatullah:\n\n${notice.deceased_name}${notice.age ? ` (${notice.age} tahun)` : ''}\n\nTarikh: ${formatDate(notice.death_date)}${notice.jenazah_time ? `\nSolat Jenazah: ${notice.jenazah_time}` : ''}${notice.jenazah_location ? ` di ${notice.jenazah_location}` : ''}${notice.burial_location_text ? `\nPengkebumian: ${notice.burial_location_text}` : ''}\n\nSemoga rohnya dirahmati Allah.\n\nSajda — Masjid Saujana Utama`

    if (navigator.share) {
      navigator.share({ title: `Notis Kematian — ${notice.deceased_name}`, text })
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--void)', minHeight: '100vh', padding: '80px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[180, 120, 300].map((h, i) => (
            <div key={i} style={{
              height: `${h}px`, borderRadius: '16px',
              background: 'var(--surface)', animation: 'shimmer 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
        <style>{`@keyframes shimmer { 0%,100%{opacity:1}50%{opacity:.5} } @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (notFound || !notice) {
    return (
      <div style={{ background: 'var(--void)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', color: 'var(--text-secondary)' }}>Notis tidak dijumpai</p>
          <Link href="/janaiz" style={{
            display: 'inline-block', marginTop: '16px', padding: '10px 20px',
            borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)',
            fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none',
          }}>
            Kembali
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--elevated) 0%, var(--void) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 36px',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          <Link href="/janaiz" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none',
            marginBottom: '24px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            Papan Janaiz
          </Link>

          {/* Inna lillahi */}
          <p style={{
            fontFamily: 'var(--font-amiri)',
            fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
            color: 'var(--text-dim)',
            direction: 'rtl', marginBottom: '12px',
          }}>
            إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
          </p>

          {/* Name */}
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 700, color: 'var(--text-primary)',
            margin: 0, lineHeight: 1.1,
          }}>
            {notice.deceased_name}
          </h1>

          {notice.age && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
              {notice.age} tahun
            </p>
          )}

          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', margin: '12px 0 0' }}>
            Meninggal dunia pada {formatDate(notice.death_date)}
          </p>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            {notice.is_verified && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '100px',
                background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)',
                fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
                color: '#22C55E',
              }}>
                <Shield style={{ width: '10px', height: '10px' }} />
                Disahkan AJK
              </span>
            )}

            {/* Share button */}
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '100px',
                background: 'transparent', border: '1px solid var(--border)',
                fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 500,
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              {copied ? <CheckCircle2 style={{ width: '10px', height: '10px', color: '#22C55E' }} /> : <Share2 style={{ width: '10px', height: '10px' }} />}
              {copied ? 'Disalin!' : 'Kongsi'}
            </button>
          </div>
        </div>
      </div>

      {/* ── DETAILS ── */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Info cards */}
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>

          {/* Jenazah time */}
          {notice.jenazah_time && (
            <div style={{
              padding: '18px 20px', borderRadius: '14px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Clock style={{ width: '18px', height: '18px', color: '#22C55E' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: '0 0 3px' }}>
                  Waktu Solat Jenazah
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {notice.jenazah_time}
                </p>
                {notice.jenazah_location && (
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    {notice.jenazah_location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Burial location */}
          {(notice.burial_lat || notice.burial_location_text) && (
            <div style={{
              borderRadius: '14px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: notice.burial_lat ? '1px solid var(--border)' : 'none' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <MapPin style={{ width: '18px', height: '18px', color: '#22C55E' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: '0 0 3px' }}>
                    Lokasi Pengkebumian
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                    {notice.burial_location_text
                      ? notice.burial_location_text.split(',').slice(0, 3).join(', ')
                      : `${notice.burial_lat?.toFixed(5)}, ${notice.burial_lng?.toFixed(5)}`}
                  </p>
                </div>
              </div>

              {/* Map view */}
              {notice.burial_lat && notice.burial_lng && (
                <ViewMap lat={notice.burial_lat} lng={notice.burial_lng} label={notice.deceased_name} />
              )}

              {/* Open in Maps */}
              {notice.burial_lat && notice.burial_lng && (
                <div style={{ padding: '12px 20px' }}>
                  <a
                    href={`https://maps.google.com/?q=${notice.burial_lat},${notice.burial_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '10px',
                      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)',
                      fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 600,
                      color: '#22C55E', textDecoration: 'none',
                    }}
                  >
                    <MapPin style={{ width: '12px', height: '12px' }} />
                    Buka di Google Maps
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        {notice.notes && (
          <div style={{
            padding: '20px', borderRadius: '14px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            marginBottom: '16px',
          }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: '0 0 10px' }}>
              Maklumat Tambahan
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {notice.notes}
            </p>
          </div>
        )}

        {/* AJK verify button */}
        {isAJK && !notice.is_verified && (
          <button
            onClick={handleVerify}
            disabled={verifying}
            style={{
              width: '100%', padding: '12px',
              borderRadius: '12px', border: '1px solid rgba(34,197,94,0.30)',
              background: 'rgba(34,197,94,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
              color: '#22C55E', cursor: 'pointer', marginBottom: '16px',
            }}
          >
            <Shield style={{ width: '14px', height: '14px' }} />
            {verifying ? 'Mengesahkan...' : 'Sahkan Notis Ini (AJK)'}
          </button>
        )}

        {/* Doa box */}
        <div style={{
          padding: '24px', borderRadius: '14px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <Heart style={{ width: '16px', height: '16px', color: 'var(--text-dim)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontFamily: 'var(--font-amiri)', fontSize: '18px', color: 'var(--text-dim)', direction: 'rtl', margin: '0 0 8px', lineHeight: 2 }}>
            اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ
          </p>
          <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
            "Ya Allah, ampunilah dia, rahmatilah dia, sihatkanlah dia dan maafkanlah dia"
          </p>
        </div>

        {/* Footer info */}
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
          color: 'var(--text-dim)', textAlign: 'center', marginTop: '20px', lineHeight: 1.6,
        }}>
          Dihantar pada {new Date(notice.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {notice.is_verified && notice.verified_at && ` · Disahkan pada ${new Date(notice.verified_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long' })}`}
        </p>
      </div>
    </div>
  )
}
