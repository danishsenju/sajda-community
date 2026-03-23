import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Plus_Jakarta_Sans, Amiri, JetBrains_Mono, Poppins } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { InstallPWA } from '@/components/ui/InstallPWA'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ServiceWorkerRegister } from '@/components/ui/ServiceWorkerRegister'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { LiveRefresh } from '@/components/ui/LiveRefresh'

// Cormorant Garamond — ultra-luxury high-contrast serif (Hermès, editorial)
const playfair = Cormorant_Garamond({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

// Plus Jakarta Sans — premium modern sans, SE Asian designed
const dmSans = Plus_Jakarta_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const amiri = Amiri({
  variable: '--font-amiri',
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Komuniti MSU — Masjid Saujana Utama',
  description:
    'Platform komuniti Masjid Saujana Utama. Waktu solat, program, keperluan komuniti, kelas agama dan hadis harian.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Komuniti MSU',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png',   sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#08090E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ms"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable} ${amiri.variable} ${jetbrains.variable} ${poppins.variable}`}
    >
      <body>
        <ThemeProvider>
          <SplashScreen />
          <Navbar />
          <main className="min-h-screen pt-16 md:pt-16 pb-[82px] md:pb-0">
            {children}
          </main>
          <LiveRefresh />
          <InstallPWA />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  )
}
