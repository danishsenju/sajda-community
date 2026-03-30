export const revalidate = 60

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getMosqueBySlug, getMosquePlan } from '@/lib/mosque'
import { hasFeature } from '@/lib/planFeatures'
import {
  MapPin, Phone, Bell, Heart, Calendar, BookOpen, Building2,
  Users, ChevronRight, Pin, Clock,
} from 'lucide-react'
import { MosqueFollowButton } from '@/components/ui/MosqueFollowButton'
import { NextPrayerMini } from '@/components/ui/NextPrayerMini'

interface Props {
  params: Promise<{ mosqueSlug: string }>
}

export default async function MosqueHomePage({ params }: Props) {
  const { mosqueSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const mosque = await getMosqueBySlug(mosqueSlug)
  if (!mosque) notFound()

  const plan = await getMosquePlan(mosque.id)

  // Fetch latest announcements for this mosque
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, content, category, is_pinned, created_at')
    .eq('mosque_id', mosque.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch upcoming programs (if plan allows)
  const { data: programs } = hasFeature(plan, 'programs')
    ? await supabase
        .from('programs')
        .select('id, title, program_date, start_time, location, needs_volunteers')
        .eq('mosque_id', mosque.id)
        .eq('is_published', true)
        .gte('program_date', new Date().toISOString().split('T')[0])
        .order('program_date')
        .limit(3)
    : { data: null }

  // Check if current user follows this mosque
  let isFollowing = false
  let followerCount = 0
  const db = supabase as any
  if (user) {
    const { data: follow } = await db
      .from('mosque_follows')
      .select('id')
      .eq('mosque_id', mosque.id)
      .eq('user_id', user.id)
      .single()
    isFollowing = !!follow
  }
  const { count } = await db
    .from('mosque_follows')
    .select('*', { count: 'exact', head: true })
    .eq('mosque_id', mosque.id)
  followerCount = count ?? 0

  const CATEGORY_BG: Record<string, string> = {
    umum:      'rgba(34,197,94,0.1)',
    kecemasan: 'rgba(239,68,68,0.1)',
    kewangan:  'rgba(234,179,8,0.1)',
    ramadan:   'rgba(168,85,247,0.1)',
  }
  const CATEGORY_TEXT: Record<string, string> = {
    umum:      '#22C55E',
    kecemasan: '#EF4444',
    kewangan:  '#EAB308',
    ramadan:   '#A855F7',
  }
  const CATEGORY_LABEL: Record<string, string> = {
    umum: 'Umum', kecemasan: 'Kecemasan', kewangan: 'Kewangan', ramadan: 'Ramadan',
  }

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* ── MOSQUE HEADER ── */}
      <section style={{
        padding: '24px 20px 20px',
        maxWidth: '720px',
        margin: '0 auto',
        paddingTop: '80px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(34,197,94,0.7)',
              marginBottom: '6px',
            }}>
              {mosque.category === 'masjid' ? 'Masjid' : mosque.category === 'surau' ? 'Surau' : 'Musolla'}
              {mosque.state ? ` · ${mosque.state}` : ''}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(22px, 5vw, 32px)',
              fontWeight: 700,
              color: '#F0FDF4',
              lineHeight: 1.2,
              marginBottom: '10px',
            }}>
              {mosque.name}
            </h1>

            {mosque.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                <MapPin style={{ width: '13px', height: '13px', color: 'rgba(186,230,200,0.4)', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: 'rgba(186,230,200,0.5)' }}>
                  {mosque.address}
                </span>
              </div>
            )}

            {mosque.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Phone style={{ width: '13px', height: '13px', color: 'rgba(186,230,200,0.4)', flexShrink: 0 }} />
                <a href={`tel:${mosque.phone}`} style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '13px',
                  color: 'rgba(186,230,200,0.5)',
                  textDecoration: 'none',
                }}>{mosque.phone}</a>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Users style={{ width: '12px', height: '12px', color: 'rgba(186,230,200,0.35)' }} />
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(186,230,200,0.4)' }}>
                {followerCount.toLocaleString()} pengikut
              </span>
            </div>
          </div>

          {/* Follow button */}
          <MosqueFollowButton
            mosqueId={mosque.id}
            isFollowing={isFollowing}
            isLoggedIn={!!user}
            mosqueSlug={mosqueSlug}
          />
        </div>
      </section>

      {/* ── PRAYER TIMES MINI ── */}
      <section style={{ padding: '0 20px 20px', maxWidth: '720px', margin: '0 auto' }}>
        <NextPrayerMini />
      </section>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px' }}>

        {/* ── ANNOUNCEMENTS ── */}
        {announcements && announcements.length > 0 && (
          <section style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(186,230,200,0.5)',
              }}>// Pengumuman</h2>
              <Link href={`/${mosqueSlug}/pengumuman`} style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '12px',
                color: '#22C55E',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}>
                Semua <ChevronRight style={{ width: '12px', height: '12px' }} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {announcements.map((a) => (
                <div key={a.id} style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(15,16,22,0.85)',
                  border: `1px solid ${a.is_pinned ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {a.is_pinned && (
                      <Pin style={{ width: '11px', height: '11px', color: '#EAB308', flexShrink: 0 }} />
                    )}
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: CATEGORY_BG[a.category] ?? 'rgba(34,197,94,0.1)',
                      fontSize: '10px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-dm-sans)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: CATEGORY_TEXT[a.category] ?? '#22C55E',
                    }}>
                      {CATEGORY_LABEL[a.category] ?? a.category}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#F0FDF4',
                    lineHeight: 1.4,
                  }}>{a.title}</p>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '12px',
                    color: 'rgba(186,230,200,0.5)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  } as React.CSSProperties}>{a.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── UPCOMING PROGRAMS ── */}
        {hasFeature(plan, 'programs') && programs && programs.length > 0 && (
          <section style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(186,230,200,0.5)',
              }}>// Program Akan Datang</h2>
              <Link href={`/${mosqueSlug}/program`} style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '12px',
                color: '#22C55E',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}>
                Semua <ChevronRight style={{ width: '12px', height: '12px' }} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {programs.map((p) => (
                <div key={p.id} style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(15,16,22,0.85)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    flexShrink: 0,
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#22C55E',
                      lineHeight: 1,
                    }}>
                      {new Date(p.program_date).getDate()}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'rgba(34,197,94,0.6)',
                    }}>
                      {new Date(p.program_date).toLocaleString('ms-MY', { month: 'short' })}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#F0FDF4',
                      marginBottom: '4px',
                    }}>{p.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {p.start_time && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock style={{ width: '11px', height: '11px', color: 'rgba(186,230,200,0.35)' }} />
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(186,230,200,0.45)' }}>
                            {p.start_time.slice(0, 5)}
                          </span>
                        </div>
                      )}
                      {p.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin style={{ width: '11px', height: '11px', color: 'rgba(186,230,200,0.35)' }} />
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: 'rgba(186,230,200,0.45)' }}>
                            {p.location}
                          </span>
                        </div>
                      )}
                      {p.needs_volunteers && (
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'rgba(34,197,94,0.1)',
                          fontSize: '10px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-dm-sans)',
                          color: '#22C55E',
                        }}>Perlu Sukarelawan</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── QUICK LINKS ── */}
        <section>
          <h2 style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(186,230,200,0.5)',
            marginBottom: '14px',
          }}>// Akses Pantas</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
          }}>
            {[
              { href: `/${mosqueSlug}/pengumuman`, icon: Bell,     label: 'Pengumuman',  feature: 'announcements' },
              { href: `/${mosqueSlug}/program`,    icon: Calendar, label: 'Program',     feature: 'programs' },
              { href: `/${mosqueSlug}/keperluan`,  icon: Heart,    label: 'Keperluan',   feature: 'keperluan' },
              { href: `/${mosqueSlug}/kelas`,      icon: BookOpen, label: 'Kelas',       feature: 'kelas' },
              { href: `/${mosqueSlug}/masjid`,     icon: Building2,label: 'Info Masjid', feature: 'mosque_profile' },
            ]
              .filter(item => hasFeature(plan, item.feature))
              .map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(15,16,22,0.85)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}>
                  <Icon style={{ width: '18px', height: '18px', color: '#22C55E' }} />
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#F0FDF4',
                  }}>{label}</span>
                </Link>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  )
}
