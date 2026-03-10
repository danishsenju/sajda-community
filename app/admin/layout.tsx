import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Building2, Megaphone, Heart, Calendar, BookOpen, HandCoins, PersonStanding, Users } from 'lucide-react'
import { AdminMobileFab } from '@/components/admin/AdminMobileFab'

const navItems = [
  { href: '/admin',               icon: LayoutDashboard,  label: 'Dashboard',  superadminOnly: false },
  { href: '/admin/mosque',        icon: Building2,        label: 'Masjid',     superadminOnly: false },
  { href: '/admin/announcements', icon: Megaphone,        label: 'Pengumuman', superadminOnly: false },
  { href: '/admin/keperluan',     icon: Heart,            label: 'Keperluan',  superadminOnly: false },
  { href: '/admin/programs',      icon: Calendar,         label: 'Program',    superadminOnly: false },
  { href: '/admin/kelas',         icon: BookOpen,         label: 'Kelas',      superadminOnly: false },
  { href: '/admin/derma',         icon: HandCoins,        label: 'Derma',      superadminOnly: false },
  { href: '/admin/imam',          icon: PersonStanding,   label: 'Imam',       superadminOnly: false },
  { href: '/admin/pengguna',      icon: Users,            label: 'Pengguna',   superadminOnly: true  },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['ajk', 'superadmin'].includes(profile.role)) {
    redirect('/')
  }

  const isSuperAdmin = profile.role === 'superadmin'
  const visibleNav = navItems.filter(item => !item.superadminOnly || isSuperAdmin)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--void)' }}>
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex flex-col w-56 border-r fixed top-16 bottom-0 left-0 z-30"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--primary)' }}>
            Panel Admin
          </p>
        </div>

        <nav className="flex flex-col gap-0.5 p-3">
          {visibleNav.map(({ href, icon: Icon, label, superadminOnly }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--primary-pale)] hover:text-[var(--primary)]"
              style={{ fontFamily: 'var(--font-jakarta)', color: superadminOnly ? '#DC2626' : 'var(--text-dim)' }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile FAB — quick admin menu */}
      <AdminMobileFab isSuperAdmin={isSuperAdmin} />

      {/* Main content */}
      <main className="flex-1 md:ml-56 px-4 md:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}
