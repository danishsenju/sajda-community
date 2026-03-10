import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Clock, User, BookOpen } from 'lucide-react'
import { formatTime } from '@/lib/utils'

const CATEGORY_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  quran:       { label: 'Al-Quran',    color: '#6EE7B7', dot: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  fiqh:        { label: 'Fiqh',        color: '#FCD34D', dot: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  akhlak:      { label: 'Akhlak',      color: '#93C5FD', dot: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  bahasa_arab: { label: 'Bahasa Arab', color: '#C4B5FD', dot: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  lain:        { label: 'Lain-lain',   color: '#9CA3AF', dot: '#6B7280', bg: 'rgba(107,114,128,0.06)' },
}

export default async function KelasPage() {
  const supabase = await createClient()

  const { data: kelasList } = await supabase
    .from('kelas')
    .select('*, kelas_bookings(id)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const items = kelasList ?? []
  const totalOpen = items.filter((k: any) => {
    const bookings = Array.isArray(k.kelas_bookings) ? k.kelas_bookings.length : 0
    return k.capacity === null || bookings < k.capacity
  }).length

  const byCategory = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
    key, cfg,
    items: items.filter((k: any) => k.category === key),
  })).filter(g => g.items.length > 0)

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'var(--elevated)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(82,201,122,0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px', opacity: 0.5,
        }} />

        <div className="max-w-5xl mx-auto" style={{ padding: '40px 24px 28px', position: 'relative' }}>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--primary)', fontWeight: 700, marginBottom: '14px',
          }}>
            // ILMU & PEMBELAJARAN
          </p>

          {/* Title + stats row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 800, lineHeight: 1.05,
              color: 'var(--text-primary)', letterSpacing: '-0.025em',
            }}>
              Kelas &amp;<br />
              <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Ilmu</em>
            </h1>

            {/* Stats block */}
            <div style={{ display: 'flex', gap: '20px', paddingBottom: '6px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontFamily: 'var(--font-jetbrains)', fontSize: '36px', fontWeight: 700,
                  color: 'var(--primary)', lineHeight: 1,
                }}>
                  {items.length}
                </p>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px',
                  color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  Kelas Aktif
                </p>
              </div>
              <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontFamily: 'var(--font-jetbrains)', fontSize: '36px', fontWeight: 700,
                  color: '#FCD34D', lineHeight: 1,
                }}>
                  {totalOpen}
                </p>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px',
                  color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  Terbuka
                </p>
              </div>
            </div>
          </div>

          {/* Category legend strip */}
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }} className="scrollbar-none">
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot }} />
                <span style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '11px',
                  color: 'var(--text-dim)', fontWeight: 500,
                }}>
                  {cfg.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-5xl mx-auto" style={{ padding: '32px 24px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '12px', margin: '0 auto 20px',
              background: 'var(--primary-pale)', border: '1px solid var(--border-lit)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen style={{ width: '26px', height: '26px', color: 'var(--primary)' }} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-playfair)', fontSize: '22px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '10px',
            }}>
              Tiada Kelas Aktif
            </h2>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', color: 'var(--text-dim)' }}>
              Semak semula kemudian untuk kelas terbaru.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            {byCategory.map(({ key, cfg, items: catItems }) => (
              <section key={key}>
                {/* Category heading */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '3px', height: '22px', borderRadius: '2px', background: cfg.dot, flexShrink: 0 }} />
                  <h2 style={{
                    fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}>
                    {cfg.label}
                  </h2>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  <span style={{
                    fontFamily: 'var(--font-jetbrains)', fontSize: '11px', fontWeight: 600,
                    color: cfg.color, background: cfg.bg,
                    padding: '3px 10px', borderRadius: '4px',
                  }}>
                    {catItems.length}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {catItems.map((kelas: any) => {
                    const bookings = Array.isArray(kelas.kelas_bookings) ? kelas.kelas_bookings.length : 0
                    const cap = kelas.capacity
                    const full = cap !== null && bookings >= cap
                    const remaining = cap !== null ? cap - bookings : null
                    const nearFull = remaining !== null && remaining <= 3 && !full
                    const fillPct = cap ? Math.min((bookings / cap) * 100, 100) : 0

                    const dotCount = cap !== null ? Math.min(cap, 20) : null
                    const filledDots = dotCount !== null ? Math.min(bookings, dotCount) : null

                    return (
                      <Link key={kelas.id} href={`/kelas/${kelas.id}`}
                        style={{
                          display: 'block', textDecoration: 'none',
                          background: 'var(--surface)',
                          border: `1px solid var(--border)`,
                          borderLeft: `3px solid ${cfg.dot}`,
                          borderRadius: '12px', overflow: 'hidden',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          position: 'relative',
                        }}
                        className="hover:-translate-y-1"
                      >
                        {/* Day watermark */}
                        {kelas.schedule_day && (
                          <div style={{
                            position: 'absolute', top: '8px', right: '12px',
                            fontFamily: 'var(--font-jetbrains)', fontSize: '40px', fontWeight: 700,
                            color: 'var(--border)', lineHeight: 1, opacity: 0.5,
                            pointerEvents: 'none', userSelect: 'none', zIndex: 0,
                          }}>
                            {kelas.schedule_day.slice(0, 3).toUpperCase()}
                          </div>
                        )}

                        <div style={{ padding: '18px 20px', position: 'relative', zIndex: 1 }}>
                          {/* Title row */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                            <h3 style={{
                              fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 700,
                              color: 'var(--text-primary)', lineHeight: 1.3, flex: 1,
                            }}>
                              {kelas.title}
                            </h3>
                            {kelas.schedule_day && (
                              <span style={{
                                fontFamily: 'var(--font-jetbrains)', fontSize: '10px', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.08em',
                                color: cfg.color, padding: '3px 8px',
                                background: cfg.bg, borderRadius: '4px', flexShrink: 0,
                              }}>
                                {kelas.schedule_day}
                              </span>
                            )}
                          </div>

                          {/* Meta */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                            {kelas.ustaz_name && (
                              <span style={{
                                fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                                color: 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center', gap: '6px',
                              }}>
                                <User style={{ width: '11px', height: '11px', color: cfg.dot, flexShrink: 0 }} />
                                {kelas.ustaz_name}
                              </span>
                            )}
                            {kelas.time_start && (
                              <span style={{
                                fontFamily: 'var(--font-jakarta)', fontSize: '12px',
                                color: 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center', gap: '6px',
                              }}>
                                <Clock style={{ width: '11px', height: '11px', color: cfg.dot, flexShrink: 0 }} />
                                <span style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--text-secondary)' }}>
                                  {formatTime(kelas.time_start)}
                                  {kelas.time_end && ` – ${formatTime(kelas.time_end)}`}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Capacity section */}
                          {cap !== null ? (
                            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                              {dotCount !== null && filledDots !== null && dotCount <= 20 && (
                                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                  {Array.from({ length: dotCount }).map((_, idx) => (
                                    <div key={idx} style={{
                                      width: '7px', height: '7px', borderRadius: '1px',
                                      background: idx < filledDots
                                        ? full ? 'var(--text-dim)' : cfg.dot
                                        : 'var(--border)',
                                      transition: 'background 0.2s',
                                    }} />
                                  ))}
                                </div>
                              )}
                              {dotCount !== null && dotCount > 20 && (
                                <div style={{ height: '3px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden', marginBottom: '6px' }}>
                                  <div style={{
                                    height: '100%', borderRadius: '2px',
                                    width: `${fillPct}%`,
                                    background: full ? 'var(--text-dim)' : cfg.dot,
                                  }} />
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{
                                  fontFamily: 'var(--font-jetbrains)', fontSize: '11px',
                                  color: 'var(--text-dim)',
                                }}>
                                  {bookings}/{cap} tempat
                                </span>
                                <span style={{
                                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                                  padding: '2px 8px', borderRadius: '4px',
                                  color: full ? 'var(--text-dim)' : nearFull ? '#F59E0B' : cfg.color,
                                  background: full ? 'var(--border)' : nearFull ? 'rgba(245,158,11,0.12)' : cfg.bg,
                                }}>
                                  {full ? 'Penuh' : nearFull ? `${remaining} lagi` : 'Tersedia'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                              <span style={{
                                fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 600,
                                color: 'var(--primary)',
                              }}>
                                Terbuka untuk semua →
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
