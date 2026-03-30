'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ExternalLink, Radio, Youtube } from 'lucide-react'

type LiveStream = {
  id: string
  title: string
  url: string
  platform: 'youtube' | 'facebook'
  is_active: boolean
  created_at: string
}

function getEmbedUrl(url: string, platform: 'youtube' | 'facebook'): string | null {
  if (platform === 'youtube') {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    )
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
  }
  if (platform === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=800&show_text=false&autoplay=true`
  }
  return null
}

export default function LivePage() {
  const [stream, setStream] = useState<LiveStream | null | undefined>(undefined)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('live_streams')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    setStream(data ?? null)
  }

  useEffect(() => {
    load()

    // Realtime — auto-refresh when AJK changes the active stream
    const channel = supabase
      .channel('live_streams_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, () => {
        load()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const embedUrl = stream ? getEmbedUrl(stream.url, stream.platform) : null

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--elevated) 0%, var(--void) 70%)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="max-w-4xl mx-auto" style={{ padding: '40px 24px 28px' }}>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '12px',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--primary)', fontWeight: 700, marginBottom: '14px',
          }}>
            // KOMUNITI
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800, lineHeight: 1.05,
              color: 'var(--text-primary)', letterSpacing: '-0.025em',
            }}>
              Siaran <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Langsung</em>
            </h1>
            {stream && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 10px', borderRadius: '100px',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#EF4444',
                  animation: 'breathe 1.2s ease-in-out infinite',
                }} />
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                  fontWeight: 700, color: '#EF4444', letterSpacing: '0.1em',
                }}>
                  LIVE
                </span>
              </div>
            )}
          </div>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)' }}>
            Siaran langsung program & ceramah Masjid Saujana Utama
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto" style={{ padding: '32px 24px' }}>

        {/* ── LOADING ── */}
        {stream === undefined && (
          <div style={{
            aspectRatio: '16/9', borderRadius: '16px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '2px solid rgba(34,197,94,0.2)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        {/* ── NO ACTIVE STREAM ── */}
        {stream === null && (
          <div style={{
            padding: '64px 24px', textAlign: 'center',
            borderRadius: '16px',
            background: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 20px',
              background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Radio style={{ width: '24px', height: '24px', color: 'var(--primary)', opacity: 0.5 }} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '8px',
            }}>
              Tiada Siaran Langsung
            </h2>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px',
              color: 'var(--text-dim)', lineHeight: 1.6,
            }}>
              Belum ada siaran aktif pada masa ini.<br />
              Semak semula apabila ada program dijadualkan.
            </p>
          </div>
        )}

        {/* ── ACTIVE STREAM ── */}
        {stream && (
          <div>
            {/* Title + external link */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              gap: '16px', marginBottom: '16px', flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {stream.platform === 'youtube' ? (
                    <Youtube style={{ width: '16px', height: '16px', color: '#EF4444', flexShrink: 0 }} />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" style={{ flexShrink: 0 }}>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  <span style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: stream.platform === 'youtube' ? '#EF4444' : '#1877F2',
                  }}>
                    {stream.platform === 'youtube' ? 'YouTube' : 'Facebook'}
                  </span>
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {stream.title}
                </h2>
              </div>

              <a
                href={stream.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '10px', flexShrink: 0,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                  textDecoration: 'none', transition: 'border-color 0.15s',
                }}
              >
                <ExternalLink style={{ width: '13px', height: '13px' }} />
                Tonton di {stream.platform === 'youtube' ? 'YouTube' : 'Facebook'}
              </a>
            </div>

            {/* Embed player */}
            {embedUrl ? (
              <div style={{
                position: 'relative', aspectRatio: '16/9',
                borderRadius: '16px', overflow: 'hidden',
                border: '1px solid var(--border)',
                background: '#000',
              }}>
                <iframe
                  src={embedUrl}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div style={{
                aspectRatio: '16/9', borderRadius: '16px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
              }}>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)' }}>
                  Tidak dapat muat embed. Tonton terus di platform asal.
                </p>
                <a href={stream.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 20px', borderRadius: '10px',
                    background: 'var(--primary)', color: '#fff',
                    fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                    textDecoration: 'none',
                  }}>
                  <ExternalLink style={{ width: '14px', height: '14px' }} />
                  Buka Siaran Langsung
                </a>
              </div>
            )}

            {/* No comment notice */}
            <p style={{
              marginTop: '12px', textAlign: 'center',
              fontFamily: 'var(--font-jakarta)', fontSize: '13px',
              color: 'var(--text-dim)',
            }}>
              Untuk berinteraksi, lawati siaran di {stream.platform === 'youtube' ? 'YouTube' : 'Facebook'} secara terus.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
