import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, MapPin, AlertTriangle, CheckCircle2, Loader2, Timer } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import { OfferHelpButton } from './OfferHelpButton'

const CAT: Record<string, { label: string; accent: string; glow: string; bg: string }> = {
  bantuan_fizikal: { label: 'Bantuan Fizikal', accent: '#60A5FA', glow: 'rgba(96,165,250,0.15)', bg: 'rgba(59,130,246,0.07)' },
  ilmu_tuisyen:    { label: 'Ilmu & Tuisyen',  accent: '#A78BFA', glow: 'rgba(167,139,250,0.15)', bg: 'rgba(139,92,246,0.07)' },
  transport:       { label: 'Transport',        accent: '#34D399', glow: 'rgba(52,211,153,0.15)',  bg: 'rgba(16,185,129,0.07)' },
  barangan:        { label: 'Barangan',         accent: '#FBBF24', glow: 'rgba(251,191,36,0.15)',  bg: 'rgba(245,158,11,0.07)' },
  lain:            { label: 'Lain-lain',        accent: '#94A3B8', glow: 'rgba(148,163,184,0.12)', bg: 'rgba(100,116,139,0.07)' },
}

const STATUS: Record<string, { label: string; color: string; icon: string }> = {
  open:        { label: 'Terbuka',          color: '#4ADE80', icon: '●' },
  in_progress: { label: 'Sedang Dibantu',   color: '#FBBF24', icon: '◐' },
  resolved:    { label: 'Selesai',          color: '#94A3B8', icon: '✓' },
  pending:     { label: 'Menunggu Kelulusan', color: '#FB923C', icon: '○' },
}

export default async function KeperluanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('keperluan')
    .select('*, profiles!posted_by(full_name, avatar_url), keperluan_helpers(id, helper_id, message, created_at, profiles!helper_id(full_name))')
    .eq('id', id)
    .single()

  if (!item) notFound()

  const poster = item.profiles as unknown as { full_name: string | null; avatar_url: string | null } | null
  type Helper = { id: string; message: string | null; created_at: string; profiles: { full_name: string | null } | null }
  const helpers = (item.keperluan_helpers as unknown as Helper[]) ?? []
  const cfg = CAT[item.category] ?? CAT.lain
  const st = STATUS[item.status] ?? STATUS.open
  const isResolved = item.status === 'resolved'

  const posterInitial = (poster?.full_name ?? 'J').charAt(0).toUpperCase()

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── TOP ACCENT BAR ── */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${cfg.accent}, transparent)` }} />

      {/* ── BACK NAV ── */}
      <div style={{ padding: '20px 24px 0', maxWidth: '1100px', margin: '0 auto' }}>
        <Link href="/keperluan"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.04em',
            transition: 'color 0.2s',
          }}
          className="hover:text-white">
          <ArrowLeft style={{ width: '14px', height: '14px' }} />
          KEPERLUAN KOMUNITI
        </Link>
      </div>

      {/* ── HERO HEADER ── */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '28px 24px 0',
      }}>
        <div style={{
          borderRadius: '20px', overflow: 'hidden',
          background: `linear-gradient(135deg, ${cfg.bg} 0%, transparent 60%)`,
          border: `1px solid ${cfg.accent}22`,
          position: 'relative',
          marginBottom: '20px',
        }}>
          {/* Corner bracket TL */}
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            width: '20px', height: '20px',
            borderTop: `2px solid ${cfg.accent}55`,
            borderLeft: `2px solid ${cfg.accent}55`,
            borderRadius: '2px 0 0 0',
          }} />
          {/* Corner bracket BR */}
          <div style={{
            position: 'absolute', bottom: '16px', right: '16px',
            width: '20px', height: '20px',
            borderBottom: `2px solid ${cfg.accent}33`,
            borderRight: `2px solid ${cfg.accent}33`,
            borderRadius: '0 0 2px 0',
          }} />

          <div style={{ padding: '36px 40px 32px' }}>
            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: cfg.accent, padding: '5px 12px',
                background: `${cfg.accent}18`, borderRadius: '4px',
                border: `1px solid ${cfg.accent}30`,
              }}>
                {cfg.label}
              </span>

              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: st.color, padding: '5px 12px',
                background: `${st.color}15`, borderRadius: '4px',
                border: `1px solid ${st.color}30`,
              }}>
                <span style={{ fontSize: '8px' }}>{st.icon}</span>
                {st.label}
              </span>

              {item.urgency === 'urgent' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#F87171', padding: '5px 12px',
                  background: 'rgba(239,68,68,0.12)', borderRadius: '4px',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}>
                  <AlertTriangle style={{ width: '10px', height: '10px' }} />
                  MENDESAK
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 800, lineHeight: 1.1,
              color: 'var(--text-primary)', marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>
              {item.title}
            </h1>

            {/* Meta row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
            }}>
              {/* Poster */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${cfg.accent}40, ${cfg.accent}15)`,
                  border: `1.5px solid ${cfg.accent}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-playfair)', fontSize: '14px', fontWeight: 700,
                  color: cfg.accent,
                }}>
                  {posterInitial}
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '1px' }}>
                    Dipos oleh
                  </p>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {poster?.full_name ?? 'Jemaah'}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} className="hidden sm:block" />

              {/* Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock style={{ width: '13px', height: '13px', color: 'var(--text-dim)' }} />
                <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
                  {timeAgo(item.created_at)}
                </span>
              </div>

              {/* Helper count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users style={{ width: '13px', height: '13px', color: cfg.accent }} />
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: cfg.accent, fontWeight: 700 }}>
                  {helpers.length}
                </span>
                <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
                  nak bantu
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ gap: '20px', display: 'grid', gridTemplateColumns: '1fr' }}
          className="md:[grid-template-columns:1fr_340px]">

          {/* Left: content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Description card */}
            <div style={{
              borderRadius: '16px', padding: '32px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: cfg.accent, marginBottom: '16px',
              }}>
                // PENERANGAN
              </p>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '15px', lineHeight: 1.9,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
              }}>
                {item.description}
              </p>
            </div>

            {/* Helpers section */}
            <div style={{
              borderRadius: '16px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '20px 28px',
                borderBottom: helpers.length > 0 ? '1px solid var(--border)' : 'none',
                background: 'var(--elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users style={{ width: '15px', height: '15px', color: cfg.accent }} />
                  <p style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)',
                  }}>
                    SUKARELAWAN
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-jetbrains)', fontSize: '20px', fontWeight: 700,
                  color: helpers.length > 0 ? cfg.accent : 'var(--text-dim)',
                }}>
                  {helpers.length.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Helper list */}
              {helpers.length > 0 ? (
                <div style={{ padding: '8px 16px 16px' }}>
                  {helpers.map((h, i) => (
                    <div key={h.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '14px',
                      padding: '14px 12px',
                      borderBottom: i < helpers.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: `${cfg.accent}18`,
                        border: `1px solid ${cfg.accent}28`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 700,
                        color: cfg.accent,
                      }}>
                        {(h.profiles?.full_name ?? 'J').charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <p style={{
                            fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                            color: 'var(--text-primary)',
                          }}>
                            {h.profiles?.full_name ?? 'Jemaah'}
                          </p>
                          <span style={{
                            fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                            color: 'var(--text-dim)',
                          }}>
                            {timeAgo(h.created_at)}
                          </span>
                        </div>
                        {h.message && (
                          <div style={{
                            padding: '10px 14px', borderRadius: '8px',
                            background: 'var(--elevated)',
                            border: '1px solid var(--border)',
                            fontFamily: 'var(--font-jakarta)', fontSize: '13px', lineHeight: 1.7,
                            color: 'var(--text-dim)',
                            borderLeft: `3px solid ${cfg.accent}40`,
                          }}>
                            {h.message}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px 28px', textAlign: 'center' }}>
                  <p style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                    color: 'var(--text-dim)',
                  }}>
                    Belum ada sukarelawan. Jadi yang pertama!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: sidebar — desktop only */}
          <div className="hidden md:flex flex-col" style={{ gap: '14px' }}>

            {/* Status card */}
            <div style={{
              borderRadius: '16px', padding: '24px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--text-dim)', marginBottom: '16px',
              }}>
                STATUS SEMASA
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Status */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: '10px',
                  background: `${st.color}10`, border: `1px solid ${st.color}25`,
                }}>
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
                    Status
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.status === 'resolved' ? (
                      <CheckCircle2 style={{ width: '13px', height: '13px', color: st.color }} />
                    ) : item.status === 'in_progress' ? (
                      <Loader2 style={{ width: '13px', height: '13px', color: st.color }} />
                    ) : (
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                    )}
                    <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>Kategori</span>
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600, color: cfg.accent }}>{cfg.label}</span>
                </div>

                {/* Urgency */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>Keutamaan</span>
                  <span style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                    color: item.urgency === 'urgent' ? '#F87171' : '#4ADE80',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {item.urgency === 'urgent' ? '⚡ Mendesak' : '● Normal'}
                  </span>
                </div>

                {/* Helper count */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '2px',
                }}>
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>Sukarelawan</span>
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '22px', fontWeight: 700, color: cfg.accent }}>
                    {helpers.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Posted by card */}
            <div style={{
              borderRadius: '16px', padding: '20px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--text-dim)', marginBottom: '14px',
              }}>
                DIPOS OLEH
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${cfg.accent}35, ${cfg.accent}10)`,
                  border: `1.5px solid ${cfg.accent}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700,
                  color: cfg.accent, flexShrink: 0,
                }}>
                  {posterInitial}
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {poster?.full_name ?? 'Jemaah'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Timer style={{ width: '11px', height: '11px', color: 'var(--text-dim)' }} />
                    <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)' }}>
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA on desktop */}
            {!isResolved && (
              <div style={{
                borderRadius: '16px', padding: '24px',
                background: `linear-gradient(135deg, ${cfg.glow}, var(--surface))`,
                border: `1px solid ${cfg.accent}30`,
              }}>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '12px', lineHeight: 1.6,
                  color: 'var(--text-dim)', marginBottom: '16px',
                }}>
                  Anda mempunyai kemahiran atau masa untuk membantu?
                </p>
                <OfferHelpButton keperluanId={item.id} />
              </div>
            )}

            {isResolved && (
              <div style={{
                borderRadius: '16px', padding: '20px',
                background: 'rgba(74,222,128,0.06)',
                border: '1px solid rgba(74,222,128,0.2)',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#4ADE80', flexShrink: 0 }} />
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Keperluan ini telah diselesaikan. Alhamdulillah.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── MOBILE CTA (below content) ── */}
        {!isResolved && (
          <div className="md:hidden" style={{ marginTop: '20px' }}>
            <div style={{
              borderRadius: '16px', padding: '24px',
              background: `linear-gradient(135deg, ${cfg.glow}, var(--surface))`,
              border: `1px solid ${cfg.accent}30`,
            }}>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '13px', lineHeight: 1.6,
                color: 'var(--text-dim)', marginBottom: '16px',
              }}>
                Anda boleh membantu? Tawarkan bantuan anda di sini.
              </p>
              <OfferHelpButton keperluanId={item.id} />
            </div>
          </div>
        )}

        {isResolved && (
          <div className="md:hidden" style={{ marginTop: '20px' }}>
            <div style={{
              borderRadius: '16px', padding: '18px',
              background: 'rgba(74,222,128,0.06)',
              border: '1px solid rgba(74,222,128,0.2)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <CheckCircle2 style={{ width: '18px', height: '18px', color: '#4ADE80', flexShrink: 0 }} />
              <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Keperluan ini telah diselesaikan. Alhamdulillah.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
