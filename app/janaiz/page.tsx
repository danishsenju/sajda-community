'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Heart, MapPin, Clock, Plus, AlertCircle, RefreshCw, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase'

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
  created_at: string
  posted_by: string | null
  profiles?: { full_name: string | null } | null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  const days = Math.floor(hrs / 24)
  return `${days} hari lalu`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function JanaizPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('janaiz_notices')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(30)

      if (err) throw err
      setNotices((data ?? []) as unknown as Notice[])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--elevated) 0%, var(--void) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle geometric */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="jan-geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="25" fill="none" stroke="#fff" strokeWidth="0.5"/>
                <circle cx="30" cy="30" r="12" fill="none" stroke="#fff" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#jan-geo)"/>
          </svg>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', textDecoration: 'none',
            marginBottom: '24px',
          }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            Utama
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Heart style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                <span style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '10px',
                  fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                }}>
                  Notis Kematian & Takziah
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 700, color: 'var(--text-primary)',
                margin: 0, lineHeight: 1.1,
              }}>
                Papan Janaiz
              </h1>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '13px',
                color: 'var(--text-secondary)', marginTop: '8px',
              }}>
                Notis kematian, waktu solat jenazah & lokasi pengkebumian
              </p>
            </div>

            <Link
              href="/janaiz/new"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '10px 18px', borderRadius: '12px',
                background: 'var(--primary)', color: '#04080A',
                fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', flexShrink: 0,
              }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              Hantar Notis
            </Link>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Info banner */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          padding: '14px 16px', borderRadius: '12px',
          background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)',
          marginBottom: '24px',
        }}>
          <AlertCircle style={{ width: '14px', height: '14px', color: '#22C55E', flexShrink: 0, marginTop: '1px' }} />
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
            color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6,
          }}>
            Notis kematian boleh dihantar oleh ahli keluarga atau AJK masjid. Untuk pertanyaan waktu
            solat jenazah, sila hubungi pejabat masjid: <span style={{ color: 'var(--text-primary)' }}>012-3384586</span>
          </p>
        </div>

        {/* States */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                height: '160px', borderRadius: '16px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                animation: 'shimmer 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{
            padding: '40px 24px', textAlign: 'center',
            background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)',
          }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
              Gagal memuatkan notis
            </p>
            <button onClick={load} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: 'transparent', border: '1px solid var(--border)',
              cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>
              <RefreshCw style={{ width: '12px', height: '12px' }} />
              Cuba Semula
            </button>
          </div>
        )}

        {!loading && !error && notices.length === 0 && (
          <div style={{
            padding: '60px 24px', textAlign: 'center',
            background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)',
          }}>
            <Heart style={{ width: '28px', height: '28px', color: 'var(--text-dim)', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Tiada notis buat masa ini
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'var(--text-dim)' }}>
              Semoga kita semua dalam keadaan sihat dan sejahtera
            </p>
          </div>
        )}

        {/* Notices list */}
        {!loading && !error && notices.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/janaiz/${notice.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '20px',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Left accent bar */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: '3px',
                    background: notice.is_verified
                      ? 'linear-gradient(180deg, #22C55E 0%, rgba(34,197,94,0.2) 100%)'
                      : 'linear-gradient(180deg, var(--border-accent) 0%, transparent 100%)',
                  }} />

                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Al-Fatihah */}
                      <p style={{
                        fontFamily: 'var(--font-amiri)', fontSize: '14px',
                        color: 'var(--text-dim)', margin: '0 0 6px',
                        direction: 'rtl',
                      }}>
                        الفاتحة
                      </p>

                      <h2 style={{
                        fontFamily: 'var(--font-playfair)',
                        fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0, lineHeight: 1.2,
                      }}>
                        {notice.deceased_name}
                      </h2>

                      {notice.age && (
                        <p style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                          color: 'var(--text-dim)', margin: '3px 0 0',
                        }}>
                          {notice.age} tahun
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '10px',
                        color: 'var(--text-dim)', margin: 0,
                      }}>
                        {timeAgo(notice.created_at)}
                      </p>
                      {notice.is_verified && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          marginTop: '4px', padding: '2px 8px', borderRadius: '100px',
                          background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)',
                          fontFamily: 'var(--font-dm-sans)', fontSize: '9px', fontWeight: 600,
                          color: '#22C55E',
                        }}>
                          <Shield style={{ width: '8px', height: '8px' }} />
                          Disahkan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Death date */}
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                    color: 'var(--text-secondary)', margin: '0 0 10px',
                  }}>
                    Meninggal dunia pada {formatDate(notice.death_date)}
                  </p>

                  {/* Details row */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {notice.jenazah_time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock style={{ width: '11px', height: '11px', color: 'var(--text-dim)' }} />
                        <span style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
                          color: 'var(--text-secondary)',
                        }}>
                          Solat Jenazah: {notice.jenazah_time}
                        </span>
                      </div>
                    )}
                    {(notice.burial_location_text || notice.burial_lat) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin style={{ width: '11px', height: '11px', color: 'var(--text-dim)' }} />
                        <span style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
                          color: 'var(--text-secondary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '200px',
                        }}>
                          {notice.burial_location_text
                            ? notice.burial_location_text.split(',').slice(0, 2).join(', ')
                            : 'Lokasi ditandakan'}
                        </span>
                      </div>
                    )}
                  </div>

                  {notice.notes && (
                    <p style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: '12px',
                      color: 'var(--text-dim)', margin: '10px 0 0',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {notice.notes}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Islamic doa */}
        <div style={{
          marginTop: '40px', padding: '24px',
          borderRadius: '16px', background: 'var(--surface)',
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-amiri)',
            fontSize: '20px',
            color: 'var(--text-secondary)',
            direction: 'rtl', lineHeight: 2,
            margin: '0 0 12px',
          }}>
            إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
          </p>
          <p style={{
            fontFamily: 'var(--font-playfair)', fontStyle: 'italic',
            fontSize: '14px', color: 'var(--text-secondary)',
            margin: 0,
          }}>
            "Sesungguhnya kami milik Allah dan kepada-Nya kami kembali"
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '11px',
            color: 'var(--text-dim)', margin: '6px 0 0',
          }}>
            — Al-Baqarah, 2:156
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
