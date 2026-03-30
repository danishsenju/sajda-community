import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Plus_Jakarta_Sans, Amiri, JetBrains_Mono, Poppins } from 'next/font/google'
import './globals.css'

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
  title: 'Sajda — Masjid Saujana Utama',
  description:
    'Platform komuniti Masjid Saujana Utama. Waktu solat, program, keperluan komuniti, kelas agama dan hadis harian.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sajda',
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

// Root layout — fonts and base HTML only.
// Navigation and app chrome live in app/(app)/layout.tsx.
// Landing page chrome lives in app/(marketing)/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ms"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable} ${amiri.variable} ${jetbrains.variable} ${poppins.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
