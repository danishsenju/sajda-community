export const revalidate = 30

import { HandCoins, Info, Landmark, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { CopyButton } from './CopyButton'

const DANA_URL = 'https://dana.masjidsaujanautama.com/'

const donationCategories = [
  {
    label: 'Tabung Am',
    desc: 'Operasi harian masjid',
    accent: '#22C55E',
    bg: 'rgba(34,197,94,0.06)',
    border: 'rgba(34,197,94,0.18)',
  },
  {
    label: 'Tabung Pembinaan',
    desc: 'Naik taraf kemudahan masjid',
    accent: '#60A5FA',
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.18)',
  },
  {
    label: 'Tabung Fakir Miskin',
    desc: 'Bantuan kepada asnaf setempat',
    accent: '#A78BFA',
    bg: 'rgba(167,139,250,0.06)',
    border: 'rgba(167,139,250,0.18)',
  },
  {
    label: 'Sadaqah Jariah',
    desc: 'Pelaburan pahala berterusan',
    accent: '#34D399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.18)',
  },
]

export default async function DermaPage() {
  const supabase = await createClient()
  const { data: bankAccounts } = await supabase
    .from('derma_accounts')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const accounts = bankAccounts ?? []

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '56px 24px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '300px',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#22C55E',
            marginBottom: '20px',
          }}>
            Derma & Sumbangan
          </p>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}>
            Sokong Masjid<br />
            <span style={{ color: '#22C55E' }}>Saujana Utama</span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '15px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '480px',
          }}>
            Setiap ringgit yang disumbangkan membantu operasi harian, program komuniti, dan
            pembangunan masjid kita bersama.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>

        {/* ── PRIMARY CTA ── */}
        <a
          href={DANA_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 28px',
            borderRadius: '16px',
            marginBottom: '12px',
            background: '#22C55E',
            textDecoration: 'none',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          className="hover:opacity-90 hover:-translate-y-0.5"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <HandCoins style={{ width: '22px', height: '22px', color: '#08090E' }} />
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '16px',
                fontWeight: 700,
                color: '#08090E',
                marginBottom: '2px',
              }}>
                Portal Derma Rasmi
              </p>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '12px',
                color: 'rgba(8,9,14,0.65)',
              }}>
                dana.masjidsaujanautama.com
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '13px',
              fontWeight: 700,
              color: '#08090E',
            }} className="hidden sm:block">
              Derma Sekarang
            </span>
            <ArrowUpRight style={{ width: '18px', height: '18px', color: '#08090E' }} />
          </div>
        </a>

        {/* Info note */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '14px 18px',
          borderRadius: '10px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          marginBottom: '44px',
        }}>
          <Info style={{ width: '14px', height: '14px', color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            Klik butang di atas untuk derma melalui portal rasmi yang selamat. Anda juga boleh pindah wang terus ke akaun bank masjid di bawah.
          </p>
        </div>

        {/* ── DONATION CATEGORIES ── */}
        <div style={{ marginBottom: '44px' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
          }}>
            Kategori Tabung
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '10px',
          }}>
            {donationCategories.map((cat) => (
              <div
                key={cat.label}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  background: cat.bg,
                  border: `1px solid ${cat.border}`,
                }}
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: cat.accent,
                  marginBottom: '12px',
                }} />
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}>
                  {cat.label}
                </p>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BANK ACCOUNTS ── */}
        {accounts.length > 0 && (
          <div style={{ marginBottom: '44px' }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
            }}>
              Akaun Bank Masjid
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {accounts.map((acc: any) => (
                <div
                  key={acc.id}
                  style={{
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Landmark style={{ width: '16px', height: '16px', color: '#22C55E' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                        <p style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}>
                          {acc.bank}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          flexShrink: 0,
                        }}>
                          {acc.account_name}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <p style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          letterSpacing: '0.04em',
                        }}>
                          {acc.account_no}
                        </p>
                        <CopyButton value={acc.account_no.replace(/\s/g, '')} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLOSING VERSE ── */}
        <div style={{
          padding: '28px 24px',
          borderRadius: '14px',
          borderLeft: '3px solid #22C55E',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeftWidth: '3px',
          borderLeftColor: '#22C55E',
        }}>
          <p style={{
            fontFamily: 'var(--font-amiri)',
            fontSize: '22px',
            color: 'var(--text-primary)',
            direction: 'rtl',
            lineHeight: 2.2,
            marginBottom: '10px',
            textAlign: 'right',
          }}>
            مَن جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            marginBottom: '4px',
          }}>
            &quot;Barangsiapa yang membawa satu kebaikan, maka baginya pahala sepuluh kali ganda.&quot;
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '13px',
            color: '#22C55E',
            fontWeight: 600,
          }}>
            — Al-An&apos;am: 160
          </p>
        </div>

      </div>
    </div>
  )
}
