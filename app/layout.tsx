import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Nunito, Oswald, Amiri } from 'next/font/google'
import './globals.css'

// UX RATIONALE: Plus Jakarta Sans — geometric humanist, premium editorial feel.
// Highest legibility in display sizes. Used for headings, hero text, nav brand.
const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

// UX RATIONALE: Nunito — rounded humanist, extremely legible at small body sizes.
// Critical for elderly Pak Cik/Mak Cik archetype — more open apertures than DM Sans.
const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// UX RATIONALE: Oswald — condensed display for numbers. Tight metrics let us
// show large countdowns (prayer times, tasbih) without reflow on small screens.
const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

// Arabic — Amiri for Quran / Arabic text sections
const amiri = Amiri({
  variable: '--font-amiri',
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SAJDA — Platform Komuniti Masjid',
  description:
    'Platform komuniti masjid Malaysia. Waktu solat, program, keperluan komuniti, kelas agama dan lebih lagi.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SAJDA',
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
  themeColor: '#050C09',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover', // Required for safe-area-inset on notched phones
}

// Root layout — fonts and base HTML only.
// Navigation and app chrome live in app/(app)/layout.tsx.
// Landing page chrome lives in app/(marketing)/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ms"
      suppressHydrationWarning
      className={`${jakarta.variable} ${nunito.variable} ${oswald.variable} ${amiri.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
