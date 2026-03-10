export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import { MapPin, Phone, Droplets, Users, Car, Accessibility, ExternalLink, Clock, Globe, BookOpen, Heart } from 'lucide-react'
import { PWAInstallInline } from '@/components/ui/PWAInstallButton'

export default async function MasjidPage() {
  const supabase = await createClient()
  const { data: mosque } = await supabase.from('mosque_info').select('*').eq('id', 1).single()

  const name     = mosque?.name     ?? 'Masjid Saujana Utama'
  const address  = mosque?.address  ?? 'Jalan Kemboja 2, Saujana Utama 2, 47000 Sungai Buloh, Selangor'
  const phone    = mosque?.phone    ?? '012-3384586'
  const gmapsUrl = mosque?.gmaps_url ?? 'https://maps.google.com/?q=Masjid+Saujana+Utama+Sungai+Buloh'

  const facilities = [
    { key: 'has_wudhu',          label: 'Tempat Wudhu',        icon: Droplets,      active: mosque?.has_wudhu          ?? true,  desc: 'Bilik wudhu lelaki & wanita terpisah'  },
    { key: 'has_womens_section', label: 'Seksyen Wanita',      icon: Users,         active: mosque?.has_womens_section ?? true,  desc: 'Musolla khas untuk muslimat'           },
    { key: 'has_parking',        label: 'Tempat Letak Kereta', icon: Car,           active: mosque?.has_parking        ?? true,  desc: 'Kawasan parkir percuma'                },
    { key: 'has_accessibility',  label: 'Kemudahan OKU',       icon: Accessibility, active: mosque?.has_accessibility  ?? false, desc: 'Ramp & kemudahan khas'                 },
  ]

  const history = [
    {
      year: '1997',
      title: 'Penubuhan',
      desc: 'Masjid Saujana Utama ditubuhkan seiring dengan perkembangan pesat Bandar Saujana Utama yang mula dibina oleh Syarikat Perumahan Negara Berhad (SPNB) pada pertengahan 1990-an.',
    },
    {
      year: '2002',
      title: 'Pembinaan Rasmi',
      desc: 'Bangunan masjid utama siap dibina dan mula beroperasi secara penuh, melayan keperluan rohani lebih 10,000 penduduk awal kawasan perumahan Saujana Utama.',
    },
    {
      year: '2010',
      title: 'Naik Taraf',
      desc: 'Projek naik taraf besar dijalankan termasuk perluasan saf solat, penambahan kemudahan wanita, sistem pembesar suara baharu dan pemasangan sistem air-cond.',
    },
    {
      year: '2018',
      title: 'Pusat Komuniti',
      desc: 'Masjid diiktiraf sebagai hub komuniti utama Saujana Utama dengan lebih 50 program tahunan merangkumi kelas agama, gotong-royong dan program sosial.',
    },
    {
      year: '2024',
      title: 'Era Digital',
      desc: 'Masjid melancarkan inisiatif digitalisasi termasuk sistem pengurusan zakat dan sedekah atas talian melalui portal dana.masjidsaujanautama.com.',
    },
  ]

  const programs = [
    { icon: BookOpen, label: 'Kelas Al-Quran',       desc: 'Kelas mengaji untuk kanak-kanak dan dewasa setiap minggu',            color: '#52c97a', dot: '#10B981' },
    { icon: Users,    label: 'Kelas Fiqh & Akhlak',  desc: 'Kuliah mingguan oleh ustaz jemputan dari institusi terkemuka',         color: '#93C5FD', dot: '#3B82F6' },
    { icon: Heart,    label: 'Program Kebajikan',     desc: 'Bantuan kepada asnaf, anak yatim dan golongan memerlukan setempat',   color: '#FCD34D', dot: '#F59E0B' },
    { icon: Globe,    label: 'Program Ramadan',       desc: 'Buka puasa berjemaah, tarawih dan program khas bulan Ramadan',        color: '#C4B5FD', dot: '#8B5CF6' },
  ]

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'var(--elevated)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Islamic geometric pattern */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mosque-geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,8 47,28 67,28 52,42 58,62 40,50 22,62 28,42 13,28 33,28"
                  fill="none" stroke="rgba(82,201,122,0.12)" strokeWidth="0.7"/>
                <rect x="28" y="28" width="24" height="24" fill="none" stroke="rgba(82,201,122,0.06)"
                  strokeWidth="0.4" transform="rotate(45 40 40)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mosque-geo)"/>
          </svg>
        </div>

        {/* Glow orb */}
        <div style={{
          position: 'absolute', width: '500px', height: '400px',
          borderRadius: '50%', top: '-150px', right: '-100px',
          background: 'radial-gradient(ellipse, rgba(82,201,122,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-5xl mx-auto" style={{ padding: '48px 24px 40px', position: 'relative' }}>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: '#52c97a', fontWeight: 700, marginBottom: '14px',
          }}>
            // PROFIL MASJID
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(1.8rem, 4.5vw, 3.4rem)',
                fontWeight: 800, lineHeight: 1.05,
                color: 'var(--text-primary)', letterSpacing: '-0.025em',
                marginBottom: '20px',
              }}>
                {name}
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MapPin style={{ width: '14px', height: '14px', color: '#52c97a', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {address}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone style={{ width: '14px', height: '14px', color: '#52c97a', flexShrink: 0 }} />
                  <a href={`tel:${phone}`} style={{
                    fontFamily: 'var(--font-jetbrains)', fontSize: '14px', fontWeight: 600,
                    color: 'var(--text-secondary)', textDecoration: 'none',
                  }}>
                    {phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Stats column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }} className="hidden md:flex">
              {[
                { value: '50K+', label: 'Penduduk dilayan' },
                { value: '1997', label: 'Tahun ditubuhkan' },
                { value: '2,000', label: 'Kapasiti jemaah' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '22px', fontWeight: 700, color: '#52c97a', lineHeight: 1 }}>
                    {s.value}
                  </p>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '28px', flexWrap: 'wrap' }}>
            <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', borderRadius: '8px',
                background: '#52c97a', color: '#04080A',
                fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                textDecoration: 'none',
              }}>
              <MapPin style={{ width: '14px', height: '14px' }} />
              Buka di Google Maps
              <ExternalLink style={{ width: '12px', height: '12px' }} />
            </a>
            <a href={`tel:${phone}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', borderRadius: '8px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
            }}>
              <Phone style={{ width: '14px', height: '14px' }} />
              Hubungi Masjid
            </a>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>

          {/* ── ABOUT ── */}
          <section>
            <SectionLabel>Tentang Masjid</SectionLabel>
            <div style={{
              borderRadius: '14px', padding: '24px 28px',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '14px', lineHeight: 1.85,
                color: 'var(--text-secondary)',
              }}>
                {mosque?.description ||
                  'Masjid Saujana Utama merupakan masjid utama kawasan Bandar Saujana Utama, Sungai Buloh, Selangor — sebuah kawasan perumahan moden yang didiami oleh lebih 50,000 penduduk. Masjid ini berfungsi sebagai pusat ibadah, pendidikan agama, dan hab komuniti Muslim setempat. Di bawah pentadbiran Lembaga Zakat Selangor dan Jabatan Agama Islam Selangor (JAIS), masjid ini sentiasa aktif menganjurkan pelbagai program dakwah, kebajikan dan kemasyarakatan untuk semua peringkat usia.'}
              </p>

              {/* Mobile stats strip */}
              <div style={{ display: 'flex', gap: '24px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }} className="md:hidden">
                {[
                  { value: '50K+', label: 'Penduduk' },
                  { value: '1997', label: 'Ditubuhkan' },
                  { value: '2,000', label: 'Kapasiti' },
                ].map((s) => (
                  <div key={s.label}>
                    <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '18px', fontWeight: 700, color: '#52c97a' }}>
                      {s.value}
                    </p>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '10px', color: 'var(--text-dim)' }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SEJARAH ── */}
          <section>
            <SectionLabel>Sejarah &amp; Perkembangan</SectionLabel>
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute', left: '31px', top: '12px', bottom: '12px', width: '1px',
                background: 'linear-gradient(to bottom, rgba(82,201,122,0.4), rgba(82,201,122,0.1))',
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {history.map((item, i) => (
                  <div key={item.year} style={{ display: 'flex', gap: '20px', position: 'relative', paddingBottom: i < history.length - 1 ? '24px' : '0' }}>
                    {/* Year badge */}
                    <div style={{
                      width: '63px', flexShrink: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    }}>
                      <div style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: i === 0 ? '#52c97a' : 'rgba(82,201,122,0.4)',
                        border: '2px solid var(--void)',
                        boxShadow: i === 0 ? '0 0 12px rgba(82,201,122,0.5)' : 'none',
                        flexShrink: 0, zIndex: 1,
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-jetbrains)', fontSize: '11px', fontWeight: 700,
                        color: i === 0 ? '#52c97a' : 'var(--text-dim)',
                      }}>
                        {item.year}
                      </span>
                    </div>
                    {/* Content */}
                    <div style={{
                      flex: 1, borderRadius: '10px', padding: '14px 18px',
                      background: i === 0 ? 'rgba(82,201,122,0.06)' : 'var(--surface)',
                      border: `1px solid ${i === 0 ? 'rgba(82,201,122,0.18)' : 'var(--border)'}`,
                    }}>
                      <p style={{
                        fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 700,
                        color: 'var(--text-primary)', marginBottom: '6px',
                      }}>
                        {item.title}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-jakarta)', fontSize: '13px', lineHeight: 1.7,
                        color: 'var(--text-dim)',
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── KEMUDAHAN ── */}
          <section>
            <SectionLabel>Kemudahan Masjid</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {facilities.map(({ key, label, icon: Icon, active, desc }) => (
                <div key={key} style={{
                  padding: '18px 20px', borderRadius: '12px',
                  background: active ? 'rgba(82,201,122,0.07)' : 'var(--surface)',
                  border: `1px solid ${active ? 'rgba(82,201,122,0.22)' : 'var(--border)'}`,
                  opacity: active ? 1 : 0.5,
                }}>
                  <Icon style={{ width: '20px', height: '20px', marginBottom: '10px', color: active ? '#52c97a' : 'var(--text-dim)' }} />
                  <p style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
                    color: active ? 'var(--text-primary)' : 'var(--text-dim)',
                    marginBottom: '4px',
                  }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                    {active ? desc : 'Tiada buat masa ini'}
                  </p>
                  <span style={{
                    display: 'inline-block', marginTop: '8px',
                    fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: active ? '#52c97a' : 'var(--text-dim)',
                    padding: '2px 8px', borderRadius: '4px',
                    background: active ? 'rgba(82,201,122,0.1)' : 'var(--border)',
                  }}>
                    {active ? 'Tersedia' : 'Tiada'}
                  </span>
                </div>
              ))}
            </div>
            {mosque?.parking_notes && (
              <div style={{
                marginTop: '12px', padding: '14px 18px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                display: 'flex', gap: '10px',
              }}>
                <Car style={{ width: '14px', height: '14px', color: '#FCD34D', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  {mosque.parking_notes}
                </p>
              </div>
            )}
          </section>

          {/* ── PROGRAM ── */}
          <section>
            <SectionLabel>Program &amp; Aktiviti Utama</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {programs.map(({ icon: Icon, label, desc, color, dot }) => (
                <div key={label} style={{
                  padding: '18px 20px', borderRadius: '12px',
                  background: `${dot}08`, border: `1px solid ${dot}20`,
                  boxShadow: `0 1px 0 ${dot}30 inset`,
                }}>
                  <Icon style={{ width: '18px', height: '18px', color, marginBottom: '10px' }} />
                  <p style={{
                    fontFamily: 'var(--font-playfair)', fontSize: '14px', fontWeight: 700,
                    color: 'var(--text-primary)', marginBottom: '5px',
                  }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── WAKTU OPERASI ── */}
          <section>
            <SectionLabel>Waktu Operasi</SectionLabel>
            <div style={{
              borderRadius: '14px', padding: '20px 24px',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              {mosque?.operating_notes ? (
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                  {mosque.operating_notes}
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Subuh',   time: 'Sebelum subuh hingga 30 min selepas' },
                    { label: 'Zohor',   time: '12:00 tengahari hingga 2:30 petang' },
                    { label: 'Asar',    time: 'Waktu asar hingga 30 min selepas' },
                    { label: 'Maghrib', time: 'Waktu maghrib hingga isyak' },
                    { label: 'Isyak',   time: 'Waktu isyak hingga 10:00 malam' },
                    { label: 'Jumaat',  time: '11:30 pagi hingga 2:30 petang (Jumaat)' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#52c97a', marginTop: '6px', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                          {item.label}
                        </p>
                        <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)' }}>
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── PWA INSTALL ── */}
          <section>
            <SectionLabel>Pasang Aplikasi Sajda</SectionLabel>
            <PWAInstallInline />
          </section>

          {/* ── CONTACT + MAP ── */}
          <section>
            <SectionLabel>Hubungi Kami</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {/* Phone card */}
              <div style={{
                padding: '20px 22px', borderRadius: '12px',
                background: 'rgba(82,201,122,0.06)', border: '1px solid rgba(82,201,122,0.18)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--text-dim)', marginBottom: '8px',
                }}>
                  Telefon
                </p>
                <a href={`tel:${phone}`} style={{
                  fontFamily: 'var(--font-jetbrains)', fontSize: '22px', fontWeight: 700,
                  color: '#52c97a', textDecoration: 'none',
                }}>
                  {phone}
                </a>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Pejabat pengurusan masjid
                </p>
              </div>

              {/* Maps card */}
              <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '20px 22px', borderRadius: '12px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  textDecoration: 'none', transition: 'background 0.2s',
                }}
                className="hover:bg-white/5"
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(82,201,122,0.1)', border: '1px solid rgba(82,201,122,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MapPin style={{ width: '20px', height: '20px', color: '#52c97a' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 700,
                    color: 'var(--text-primary)', marginBottom: '3px',
                  }}>
                    Lihat di Google Maps
                  </p>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--text-dim)' }}>
                    Dapatkan arah perjalanan
                  </p>
                </div>
                <ExternalLink style={{ width: '14px', height: '14px', color: 'var(--text-dim)', flexShrink: 0 }} />
              </a>
            </div>
          </section>

          {/* ── DONATION PORTAL ── */}
          <section>
            <SectionLabel>Portal Sumbangan</SectionLabel>
            <a href="https://dana.masjidsaujanautama.com/" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', borderRadius: '12px',
                background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.18)',
                boxShadow: '0 1.5px 0 rgba(252,211,77,0.3) inset',
                textDecoration: 'none',
              }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: '3px',
                }}>
                  dana.masjidsaujanautama.com
                </p>
                <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'rgba(252,211,77,0.6)' }}>
                  Portal derma dan zakat rasmi Masjid Saujana Utama
                </p>
              </div>
              <ExternalLink style={{ width: '16px', height: '16px', color: '#FCD34D', flexShrink: 0 }} />
            </a>
          </section>

        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
      <span style={{
        fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
        letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)',
        flexShrink: 0,
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}
