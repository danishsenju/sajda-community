'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Megaphone, Calendar, BookOpen,
  Heart, Building2, Users, X, ShieldCheck, PersonStanding, Mic,
} from 'lucide-react'

const quickLinks = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Dashboard'      },
  { href: '/admin/announcements', icon: Megaphone,       label: 'Pengumuman'     },
  { href: '/admin/programs',      icon: Calendar,        label: 'Program'        },
  { href: '/admin/kelas',         icon: BookOpen,        label: 'Kelas'          },
  { href: '/admin/keperluan',     icon: Heart,           label: 'Keperluan'      },
  { href: '/admin/mosque',        icon: Building2,       label: 'Info Masjid'    },
  { href: '/admin/imam',          icon: PersonStanding,  label: 'Imam'           },
  { href: '/admin/bilal',         icon: Mic,             label: 'Bilal'          },
  { href: '/admin/pengguna',      icon: Users,           label: 'Pengguna',      superadminOnly: true },
]

export function AdminMobileFab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const visible = quickLinks.filter(l => !l.superadminOnly || isSuperAdmin)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB container */}
      <div className="md:hidden fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

        {/* Quick links — revealed when open */}
        {open && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '6px',
            animation: 'fabReveal 0.2s ease forwards',
          }}>
            {visible.map((link, i) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 16px 10px 12px', borderRadius: '100px',
                    background: isActive ? 'var(--primary)' : 'var(--surface)',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    textDecoration: 'none',
                    animationDelay: `${i * 0.03}s`,
                    animation: 'fabItem 0.18s ease forwards',
                    opacity: 0,
                    transform: 'translateY(6px)',
                  }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '13px', height: '13px', color: isActive ? '#fff' : 'var(--primary)' }} />
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600,
                    color: isActive ? '#fff' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                  }}>
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setOpen(p => !p)}
          style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: open ? '#EF4444' : 'var(--primary)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: open
              ? '0 4px 20px rgba(239,68,68,0.4)'
              : '0 4px 20px rgba(34,197,94,0.35)',
            transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
          aria-label="Menu admin"
        >
          {open
            ? <X style={{ width: '20px', height: '20px', color: '#fff' }} />
            : <ShieldCheck style={{ width: '20px', height: '20px', color: '#04080A' }} />
          }
        </button>
      </div>

      <style>{`
        @keyframes fabReveal {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fabItem {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
