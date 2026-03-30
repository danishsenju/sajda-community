export const revalidate = 30

import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Users, Clock } from 'lucide-react'

type Keperluan = {
  id: string; title: string; description: string
  category: string; urgency: string; status: string; created_at: string
}

const CAT_CONFIG: Record<string, { label: string; color: string; dot: string; glassStyle: React.CSSProperties }> = {
  bantuan_fizikal: {
    label: 'Bantuan Fizikal', color: '#93C5FD', dot: '#3B82F6',
    glassStyle: {
      background: 'rgba(59,130,246,0.07)',
      border: '1px solid rgba(59,130,246,0.22)',
      boxShadow: '0 1.5px 0 rgba(147,197,253,0.5) inset, 0 6px 24px rgba(59,130,246,0.1)',
    },
  },
  ilmu_tuisyen: {
    label: 'Ilmu & Tuisyen', color: '#C4B5FD', dot: '#8B5CF6',
    glassStyle: {
      background: 'rgba(139,92,246,0.07)',
      border: '1px solid rgba(139,92,246,0.22)',
      boxShadow: '0 1.5px 0 rgba(196,181,253,0.5) inset, 0 6px 24px rgba(139,92,246,0.1)',
    },
  },
  transport: {
    label: 'Transport', color: '#6EE7B7', dot: '#10B981',
    glassStyle: {
      background: 'rgba(16,185,129,0.07)',
      border: '1px solid rgba(16,185,129,0.22)',
      boxShadow: '0 1.5px 0 rgba(110,231,183,0.5) inset, 0 6px 24px rgba(16,185,129,0.1)',
    },
  },
  barangan: {
    label: 'Barangan', color: '#FCD34D', dot: '#F59E0B',
    glassStyle: {
      background: 'rgba(245,158,11,0.07)',
      border: '1px solid rgba(245,158,11,0.22)',
      boxShadow: '0 1.5px 0 rgba(252,211,77,0.5) inset, 0 6px 24px rgba(245,158,11,0.1)',
    },
  },
  lain: {
    label: 'Lain-lain', color: '#9CA3AF', dot: '#6B7280',
    glassStyle: {
      background: 'rgba(107,114,128,0.07)',
      border: '1px solid rgba(107,114,128,0.18)',
      boxShadow: '0 1.5px 0 rgba(156,163,175,0.4) inset, 0 6px 24px rgba(107,114,128,0.07)',
    },
  },
}

const FILTERS = ['semua', 'bantuan_fizikal', 'ilmu_tuisyen', 'transport', 'barangan', 'lain']

export default async function KeperluanPage({
  searchParams,
}: { searchParams: Promise<{ cat?: string; urgency?: string }> }) {
  const { cat, urgency } = await searchParams
  const supabase = await createClient()

  type KCat = 'bantuan_fizikal' | 'ilmu_tuisyen' | 'transport' | 'barangan' | 'lain'

  // Build main query before awaiting so we can parallelise with getUser()
  let q = supabase.from('keperluan')
    .select('id, title, description, category, urgency, status, created_at, keperluan_helpers(count)')
    .in('status', ['open', 'in_progress'])
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: false })

  if (cat && cat !== 'semua') q = q.eq('category', cat as KCat)
  if (urgency === 'urgent') q = q.eq('urgency', 'urgent')

  // Run auth check + main DB query in parallel — saves one full roundtrip
  const [{ data: { user } }, { data: items }] = await Promise.all([
    supabase.auth.getUser(),
    q,
  ])

  const safeItems = items ?? []
  const urgentCount = safeItems.filter((i: Keperluan) => i.urgency === 'urgent').length

  // Pending items only needed if user is logged in — runs after parallel block
  let pendingItems: any[] = []
  if (user) {
    let pq = supabase.from('keperluan')
      .select('id, title, description, category, urgency, status, created_at')
      .eq('status', 'pending')
      .eq('posted_by', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (cat && cat !== 'semua') pq = pq.eq('category', cat as KCat)
    const { data: pData } = await pq
    pendingItems = pData ?? []
  }

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'var(--elevated)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Watermark counter */}
        <div style={{
          position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--font-jetbrains)', fontSize: '180px', fontWeight: 700,
          color: 'rgba(82,201,122,0.05)', lineHeight: 1,
          pointerEvents: 'none', userSelect: 'none', letterSpacing: '-8px',
        }}>
          {safeItems.length.toString().padStart(2, '0')}
        </div>

        <div className="max-w-5xl mx-auto" style={{ padding: '40px 24px 0' }}>
          {/* Label */}
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '12px',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: '#52c97a', fontWeight: 700, marginBottom: '14px',
          }}>
            // KOMUNITI
          </p>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 800, lineHeight: 1.05,
              color: 'var(--text-primary)', letterSpacing: '-0.025em',
            }}>
              Keperluan<br />
              <em style={{ color: '#52c97a', fontStyle: 'italic' }}>Komuniti</em>
            </h1>
            <Link href="/keperluan/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', borderRadius: '8px',
              background: '#52c97a', color: '#04080A',
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
              flexShrink: 0, textDecoration: 'none', letterSpacing: '0.02em',
            }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Hantar
            </Link>
          </div>

          {/* Urgent strip */}
          {urgentCount > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)',
              padding: '8px 16px', borderRadius: '6px', marginBottom: '20px',
            }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%', background: '#EF4444',
                  opacity: 0.7, animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
                }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              </span>
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                color: '#FCA5A5', letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                {urgentCount} Keperluan Mendesak
              </span>
            </div>
          )}

          {/* Category filter tabs */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: 0 }} className="scrollbar-none">
            {FILTERS.map((f) => {
              const active = (cat ?? 'semua') === f
              const dotColor = f !== 'semua' ? CAT_CONFIG[f]?.dot : '#52c97a'
              return (
                <Link key={f}
                  href={`/keperluan?cat=${f}${urgency ? `&urgency=${urgency}` : ''}`}
                  style={{
                    flexShrink: 0, padding: '13px 16px',
                    fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                    borderBottom: `2px solid ${active ? (dotColor ?? '#52c97a') : 'transparent'}`,
                    color: active ? (dotColor ?? '#52c97a') : 'var(--text-dim)',
                    textDecoration: 'none', letterSpacing: '0.02em',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}>
                  {f === 'semua' ? 'Semua' : CAT_CONFIG[f]?.label ?? f}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-5xl mx-auto" style={{ padding: '28px 24px' }}>

        {/* ── User's own pending posts ── */}
        {pendingItems.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
            }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%', background: '#F59E0B',
                  opacity: 0.7, animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
                }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
              </span>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                color: '#FCD34D', letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>
                Permohonan Anda — Menunggu Kelulusan AJK
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingItems.map((item: any) => {
                const cfg = CAT_CONFIG[item.category] ?? CAT_CONFIG.lain
                const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000)
                return (
                  <Link key={item.id} href={`/keperluan/${item.id}`}
                    style={{
                      display: 'block', textDecoration: 'none', borderRadius: '12px',
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.30)',
                      borderLeft: '3px solid #F59E0B',
                      padding: '16px 20px',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{
                            fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: cfg.color, padding: '3px 8px',
                            background: `${cfg.dot}15`, borderRadius: '4px',
                          }}>
                            {cfg.label}
                          </span>
                          {item.urgency === 'urgent' && (
                            <span style={{
                              fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
                              letterSpacing: '0.1em', textTransform: 'uppercase',
                              color: '#FCA5A5', padding: '3px 8px',
                              background: 'rgba(239,68,68,0.14)', borderRadius: '4px',
                            }}>MENDESAK</span>
                          )}
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 700,
                          color: 'var(--text-primary)', marginBottom: '4px',
                        }}>{item.title}</p>
                        <p style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                          color: 'var(--text-dim)',
                          display: '-webkit-box', WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{item.description}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <span style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          color: '#FCD34D', padding: '4px 10px',
                          background: 'rgba(245,158,11,0.15)', borderRadius: '4px',
                        }}>
                          ⏳ Dalam Semakan
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                          color: 'var(--text-dim)',
                        }}>
                          {daysAgo === 0 ? 'Hari ini' : `${daysAgo}h lepas`}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div style={{
              height: '1px', background: 'var(--border)',
              margin: '24px 0',
            }} />
          </div>
        )}

        {/* Count + urgent toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {safeItems.length}
            </span>{' '}keperluan dijumpai
          </p>
          <Link href={`/keperluan?cat=${cat ?? 'semua'}${urgency === 'urgent' ? '' : '&urgency=urgent'}`}
            style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600,
              padding: '6px 14px', borderRadius: '6px',
              border: `1px solid ${urgency === 'urgent' ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
              color: urgency === 'urgent' ? '#FCA5A5' : 'var(--text-dim)',
              background: urgency === 'urgent' ? 'rgba(239,68,68,0.08)' : 'transparent',
              textDecoration: 'none', letterSpacing: '0.04em',
            }}>
            ⚡ Mendesak Sahaja
          </Link>
        </div>

        {/* Empty state */}
        {safeItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '12px', margin: '0 auto 20px',
              background: 'rgba(82,201,122,0.07)', border: '1px solid rgba(82,201,122,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users style={{ width: '26px', height: '26px', color: '#52c97a' }} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '22px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '10px',
            }}>
              Tiada Keperluan
            </h2>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '14px',
              color: 'var(--text-dim)', marginBottom: '28px',
            }}>
              Alhamdulillah, tiada keperluan buat masa ini.
            </p>
            <Link href="/keperluan/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', borderRadius: '8px',
              background: '#52c97a', color: '#04080A',
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
              textDecoration: 'none',
            }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Hantar Keperluan
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '14px' }}>
            {safeItems.map((item: any, i: number) => {
              const cfg = CAT_CONFIG[item.category] ?? CAT_CONFIG.lain
              const helperCount = item.keperluan_helpers?.[0]?.count ?? 0
              const daysAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000)

              return (
                <Link key={item.id} href={`/keperluan/${item.id}`}
                  style={{
                    display: 'block', textDecoration: 'none',
                    borderRadius: '14px', overflow: 'hidden',
                    borderLeft: `3px solid ${cfg.dot}`,
                    backdropFilter: 'blur(20px) saturate(160%)',
                    transition: 'transform 0.25s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.2s',
                    position: 'relative',
                    ...cfg.glassStyle,
                  }}
                  className="hover:-translate-y-1 animate-fadeUp"
                  // @ts-ignore
                  style2={{ animationDelay: `${(i % 6) * 0.07}s` }}
                >
                  <div style={{ padding: '20px' }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: cfg.color, padding: '3px 8px',
                        background: `${cfg.dot}15`, borderRadius: '4px',
                      }}>
                        {cfg.label}
                      </span>
                      {item.urgency === 'urgent' && (
                        <span style={{
                          fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: '#FCA5A5', padding: '3px 8px',
                          background: 'rgba(239,68,68,0.14)', borderRadius: '4px',
                        }}>
                          MENDESAK
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontFamily: 'var(--font-playfair)', fontSize: '17px', fontWeight: 700,
                      color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3,
                    }}>
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                      fontFamily: 'var(--font-jakarta)', fontSize: '13px', lineHeight: 1.65,
                      color: 'var(--text-dim)', marginBottom: '16px',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {item.description}
                    </p>

                    {/* Footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: '12px', borderTop: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users style={{ width: '12px', height: '12px', color: cfg.color }} />
                        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: cfg.color, fontWeight: 600 }}>
                          {helperCount}
                        </span>
                        <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-dim)' }}>
                          nak bantu
                        </span>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '13px',
                        color: 'var(--text-dim)',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <Clock style={{ width: '10px', height: '10px' }} />
                        {daysAgo === 0 ? 'Hari ini' : `${daysAgo}h lepas`}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
