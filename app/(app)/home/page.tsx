// UX RATIONALE: Home = daily dashboard, not a landing page.
// Users open this app 3-5x per day: primarily for prayer times, then quick tools.
// Above-the-fold target (375px, accounting for top bar 56px + bottom nav 64px):
//   Available ≈ 255px. Must show: prayer hero card. Everything else scrolls.
// Progressive disclosure: summary first, detail on tap.
// Server component for announcements + programs — fast initial paint.
// PrayerHeroClient handles the live countdown independently (client-side).

export const revalidate = 30

import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import {
  Heart, Calendar, BookOpen, BookMarked,
  Compass, Clock, CheckSquare, Sun, RotateCcw, Moon,
  Sparkles, ChevronRight, MapPin, Pin,
} from 'lucide-react'
import { PrayerHeroSection } from './PrayerHeroSection'
import { CategoryBadge } from '@/components/ui/Badge'

/* ── MALAYSIA DATE HELPERS ── */
function getMalaysiaDate() {
  const now = new Date()
  const mNow = new Date(now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60000)
  return {
    dateLabel: mNow.toLocaleDateString('ms-MY', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }),
    today: mNow.toISOString().split('T')[0],
  }
}

/* ── TIME FORMATTING ── */
function formatTime12h(timeStr: string | null): string {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PTG' : 'PG'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/* ── PROGRAM DATE FORMAT ── */
function formatProgDate(dateStr: string): { day: string; month: string } {
  const d = new Date(dateStr + 'T00:00:00+08:00')
  return {
    day: d.toLocaleDateString('ms-MY', { day: 'numeric' }),
    month: d.toLocaleDateString('ms-MY', { month: 'short' }).toUpperCase(),
  }
}

/* ── RELATIVE TIME ── */
function timeAgo(dateStr: string): string {
  const now = Date.now()
  const past = new Date(dateStr).getTime()
  const diff = Math.floor((now - past) / 1000)
  if (diff < 60) return 'Baru sahaja'
  if (diff < 3600) return `${Math.floor(diff / 60)}m lepas`
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lepas`
  if (diff < 604800) return `${Math.floor(diff / 86400)}h lepas`
  return new Date(dateStr).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })
}

/* ── QUICK ACTIONS GRID ── */
// UX RATIONALE: 6 cells = covers 80% of daily use cases.
// 3 columns on mobile = enough space for icon + label without crowding.
// Most-used tools first: Jejak Solat (every Muslim), Tasbih (daily), then others.
// Min 80px height ensures elderly users can tap accurately.
const quickActions = [
  { href: '/solat',      Icon: CheckSquare, label: 'Jejak Solat',    color: '#2DD771' },
  { href: '/tasbih',     Icon: RotateCcw,   label: 'Tasbih',         color: '#10B981' },
  { href: '/program',    Icon: Calendar,    label: 'Program',         color: '#FBBF24' },
  { href: '/keperluan',  Icon: Heart,       label: 'Keperluan',       color: '#F87171' },
  { href: '/derma',      Icon: BookOpen,    label: 'Derma',           color: '#C9A84C' },
  { href: '/qiblat',     Icon: Compass,     label: 'Kiblat',          color: '#A78BFA' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { today, dateLabel } = getMalaysiaDate()

  const [
    { data: todayPrayer },
    { data: announcements },
    { data: programs },
  ] = await Promise.all([
    supabase
      .from('prayer_times')
      .select('fajr, syuruk, dhuhr, asr, maghrib, isha')
      .eq('date', today)
      .maybeSingle(),
    supabase
      .from('announcements')
      .select('id, title, content, category, is_pinned, created_at')
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('programs')
      .select('id, title, category, program_date, start_time, location, needs_volunteers, volunteer_slots')
      .eq('is_published', true)
      .gte('program_date', today)
      .order('program_date')
      .limit(3),
  ])

  const safeAnns  = announcements ?? []
  const safeProgs = programs ?? []

  // Build prayer cards for the hero
  const prayerData = {
    fajr:    formatTime12h(todayPrayer?.fajr    ?? null),
    syuruk:  formatTime12h(todayPrayer?.syuruk  ?? null),
    dhuhr:   formatTime12h(todayPrayer?.dhuhr   ?? null),
    asr:     formatTime12h(todayPrayer?.asr     ?? null),
    maghrib: formatTime12h(todayPrayer?.maghrib ?? null),
    isha:    formatTime12h(todayPrayer?.isha    ?? null),
    // raw times for countdown calc
    fajrRaw:    todayPrayer?.fajr    ?? null,
    dhuhrRaw:   todayPrayer?.dhuhr   ?? null,
    asrRaw:     todayPrayer?.asr     ?? null,
    maghribRaw: todayPrayer?.maghrib ?? null,
    ishaRaw:    todayPrayer?.isha    ?? null,
    dateLabel,
    today,
  }

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ════════════════════════════════════════
          PRAYER TIME HERO
          UX RATIONALE: Full-width glassmorphism card. Prayer time is #1 reason
          users open this app. Countdown is unmissable — Oswald 600 at 4rem.
          Gold color for Islamic temporal markers (dates, hijri).
          Client component handles live countdown with setInterval.
      ════════════════════════════════════════ */}
      <div style={{ padding: '12px 16px 0' }}>
        <PrayerHeroSection prayerData={prayerData} />
      </div>

      {/* ════════════════════════════════════════
          QUICK ACTIONS — 3x2 grid
          UX RATIONALE: Grid of 6 tools covers 80% of daily use cases.
          Active first: Jejak Solat + Tasbih are the two tools opened every day.
          Min 80px height = passes WCAG 2.1 for elderly users.
          Icon + label: never icon-only for Pak Cik/Mak Cik archetype.
      ════════════════════════════════════════ */}
      <section style={{ padding: '20px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)',
            fontSize: '17px', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
          }}>
            Akses Pantas
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {quickActions.map(({ href, Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              style={{
                textDecoration: 'none',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '8px',
                // UX RATIONALE: 80px minimum height — elderly thumb can comfortably tap
                minHeight: '84px',
                padding: '16px 8px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(45,215,113,0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 0.15s ease',
              }}
              className="active:scale-[0.94] active:bg-[rgba(255,255,255,0.07)]"
            >
              {/* Icon container — colored background ring */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: `${color}14`,
                border: `1px solid ${color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon
                  style={{ width: '20px', height: '20px', color }}
                  strokeWidth={1.8}
                />
              </div>

              {/* UX RATIONALE: Label always visible — icon-only fails elderly users */}
              <span style={{
                fontFamily: 'var(--font-nunito, "Nunito", sans-serif)',
                fontSize: '12px', fontWeight: 700,
                color: 'var(--text-primary)',
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          PENGUMUMAN — latest 4 announcements
          UX RATIONALE: Show 4 items max — beyond this users feel overwhelmed.
          Featured first item = taller card with excerpt.
          Compact 2nd-4th items = title + timestamp only.
          Gold badge on pinned items — culturally resonant signal.
      ════════════════════════════════════════ */}
      <section style={{ padding: '24px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)',
            fontSize: '17px', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
          }}>
            Pengumuman
          </h2>
          <Link
            href="/keperluan"
            style={{
              display: 'flex', alignItems: 'center', gap: '2px',
              fontFamily: 'var(--font-nunito, "Nunito", sans-serif)',
              fontSize: '13px', fontWeight: 600,
              color: 'var(--accent, #2DD771)',
              textDecoration: 'none',
            }}
          >
            Semua <ChevronRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </div>

        {safeAnns.length === 0 ? (
          /* UX RATIONALE: Designed empty state — never a blank screen */
          <div style={{
            padding: '32px 20px', textAlign: 'center',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(45,215,113,0.10)',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📢</div>
            <p style={{
              fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
              fontSize: '16px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '6px',
            }}>
              Tiada pengumuman baru
            </p>
            <p style={{
              fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
              fontSize: '14px', color: 'var(--text-muted)', margin: 0,
            }}>
              Semak semula nanti
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {safeAnns.map((ann, i) => (
              <Link
                key={ann.id}
                href={`/keperluan`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    padding: i === 0 ? '16px' : '12px 16px',
                    borderRadius: '16px',
                    background: ann.is_pinned ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.04)',
                    border: ann.is_pinned
                      ? '1px solid rgba(201,168,76,0.22)'
                      : '1px solid rgba(45,215,113,0.10)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    transition: 'all 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  className="active:scale-[0.99]"
                >
                  {/* Badges row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: i === 0 ? '8px' : '4px' }}>
                    {ann.is_pinned && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        height: '20px', padding: '0 7px', borderRadius: '100px',
                        background: 'rgba(201,168,76,0.12)',
                        border: '1px solid rgba(201,168,76,0.25)',
                        fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                        fontSize: '10px', fontWeight: 700,
                        color: 'var(--gold,#C9A84C)',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>
                        <Pin style={{ width: '8px', height: '8px' }} /> Dicantum
                      </span>
                    )}
                    <CategoryBadge category={ann.category ?? 'umum'} />
                    <span style={{
                      fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                      fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto',
                    }}>
                      {timeAgo(ann.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <p style={{
                    fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
                    fontSize: i === 0 ? '15px' : '14px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    // 2-line clamp
                    display: '-webkit-box',
                    WebkitLineClamp: i === 0 ? 2 : 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.35,
                    marginBottom: i === 0 ? '6px' : 0,
                  } as React.CSSProperties}>
                    {ann.title}
                  </p>

                  {/* Excerpt — featured item only */}
                  {i === 0 && ann.content && (
                    <p style={{
                      fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                      fontSize: '13px', color: 'var(--text-muted)',
                      margin: 0, lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    } as React.CSSProperties}>
                      {ann.content}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════
          PROGRAM AKAN DATANG — 3 items max
          UX RATIONALE: Date chip is the most scannable element.
          Users browse programs by "when" first, "what" second.
          Oswald for date numbers — consistent with prayer times widget.
          Volunteer badge only shown if slots are open — reduces noise.
      ════════════════════════════════════════ */}
      <section style={{ padding: '24px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
            fontSize: '17px', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
          }}>
            Program Akan Datang
          </h2>
          <Link
            href="/program"
            style={{
              display: 'flex', alignItems: 'center', gap: '2px',
              fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
              fontSize: '13px', fontWeight: 600,
              color: 'var(--accent,#2DD771)',
              textDecoration: 'none',
            }}
          >
            Semua <ChevronRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </div>

        {safeProgs.length === 0 ? (
          <div style={{
            padding: '32px 20px', textAlign: 'center',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(45,215,113,0.10)',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📅</div>
            <p style={{
              fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
              fontSize: '16px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '6px',
            }}>
              Tiada program akan datang
            </p>
            <p style={{
              fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
              fontSize: '14px', color: 'var(--text-muted)', margin: 0,
            }}>
              Semak semula nanti
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {safeProgs.map((prog) => {
              const { day, month } = formatProgDate(prog.program_date)
              const hasVolunteerSlots = prog.needs_volunteers &&
                (prog.volunteer_slots === 0 || prog.volunteer_slots > 0)

              return (
                <Link
                  key={prog.id}
                  href={`/program/${prog.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(45,215,113,0.10)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      transition: 'all 0.15s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    className="active:scale-[0.99]"
                  >
                    {/* UX RATIONALE: Date chip left — users scan vertically for dates */}
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      width: '48px', height: '52px',
                      borderRadius: '12px',
                      background: 'rgba(45,215,113,0.10)',
                      border: '1px solid rgba(45,215,113,0.18)',
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-oswald,"Oswald",sans-serif)',
                        fontSize: '22px', fontWeight: 600, lineHeight: 1,
                        color: 'var(--accent,#2DD771)',
                      }}>
                        {day}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                        fontSize: '9px', fontWeight: 700,
                        color: 'var(--accent,#2DD771)', letterSpacing: '0.06em',
                      }}>
                        {month}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <CategoryBadge category={prog.category ?? 'umum'} />
                        {hasVolunteerSlots && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            height: '20px', padding: '0 7px', borderRadius: '100px',
                            background: 'rgba(251,191,36,0.10)',
                            border: '1px solid rgba(251,191,36,0.22)',
                            fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                            fontSize: '10px', fontWeight: 600,
                            color: '#FBBF24', letterSpacing: '0.04em',
                          }}>
                            Sukarelawan
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
                        fontSize: '14px', fontWeight: 700,
                        color: 'var(--text-primary)', margin: '0 0 3px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {prog.title}
                      </p>
                      {prog.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin style={{ width: '11px', height: '11px', color: 'var(--text-dim)', flexShrink: 0 }} />
                          <span style={{
                            fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                            fontSize: '12px', color: 'var(--text-muted)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {prog.location}
                          </span>
                        </div>
                      )}
                    </div>

                    <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-dim)', flexShrink: 0 }} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════
          DESKTOP: QUICK ACCESS PILL STRIP
          UX RATIONALE: Desktop users have more horizontal space.
          Pill strip gives faster access without needing to scroll down.
          Horizontal scroll handles overflow gracefully.
      ════════════════════════════════════════ */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-10" style={{ marginTop: '40px' }}>
        <p style={{
          fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '16px',
        }}>
          Akses Pantas
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { href: '/solat',       label: 'Jejak Solat',    Icon: CheckSquare },
            { href: '/tasbih',      label: 'Tasbih & Zikir', Icon: RotateCcw },
            { href: '/wirid',       label: 'Wirid Harian',   Icon: Sun },
            { href: '/hadis',       label: 'Hadis Harian',   Icon: BookMarked },
            { href: '/program',     label: 'Program',         Icon: Calendar },
            { href: '/keperluan',   label: 'Keperluan',       Icon: Heart },
            { href: '/kelas',       label: 'Kelas',           Icon: BookOpen },
            { href: '/qiblat',      label: 'Kiblat',          Icon: Compass },
            { href: '/buka-puasa',  label: 'Waktu Berbuka',   Icon: Clock },
            { href: '/hijri',       label: 'Kalendar Hijri',  Icon: Moon },
            { href: '/tazkirah',    label: 'Tazkirah',        Icon: Sparkles },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '100px', textDecoration: 'none',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(45,215,113,0.14)',
                fontFamily: 'var(--font-nunito,"Nunito",sans-serif)',
                fontSize: '14px', fontWeight: 600,
                color: 'var(--text-secondary)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              className="hover:bg-[rgba(45,215,113,0.06)] hover:text-[var(--accent,#2DD771)] hover:border-[rgba(45,215,113,0.25)]"
            >
              <Icon style={{ width: '14px', height: '14px' }} strokeWidth={1.8} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom breathing room */}
      <div style={{ height: '32px' }} />
    </div>
  )
}
