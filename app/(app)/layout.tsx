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
      <main className="min-h-screen pt-14 md:pt-16 pb-[82px] md:pb-0">
        {children}
      </main>
      <LiveRefresh />
      <NotifPrompt />
      <InstallPWA />
      <ServiceWorkerRegister />
    </ThemeProvider>
  )
}
