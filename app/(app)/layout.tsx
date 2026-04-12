// App layout — all community pages (home, keperluan, program, etc.)
// Contains the full navigation, splash screen, and PWA components.
import { Navbar }               from '@/components/layout/Navbar'
import { SplashScreen }         from '@/components/ui/SplashScreen'
import { LiveRefresh }          from '@/components/ui/LiveRefresh'
import { NotifPrompt }          from '@/components/ui/NotifPrompt'
import { InstallPWA }           from '@/components/ui/InstallPWA'
import { ServiceWorkerRegister} from '@/components/ui/ServiceWorkerRegister'
import { ThemeProvider }        from '@/components/providers/ThemeProvider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SplashScreen />
      <Navbar />
      {/*
        UX RATIONALE: pt-14 (56px) = mobile top bar height.
        pb-[80px] = 64px nav + 16px breathing room above nav.
        pb-[calc(80px+env(safe-area-inset-bottom,0px))] handles iPhone home indicator.
        Desktop (md+): pt-16 (60px) desktop nav, no bottom padding (no bottom nav).
      */}
      <main
        className="min-h-screen pt-14 md:pt-16 md:pb-0"
        style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
      >
        {children}
      </main>
      <LiveRefresh />
      <NotifPrompt />
      <InstallPWA />
      <ServiceWorkerRegister />
    </ThemeProvider>
  )
}
