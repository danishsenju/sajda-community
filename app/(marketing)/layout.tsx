import { Syne } from 'next/font/google'

// Syne loaded only for marketing pages — keeps app bundle lean
const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={syne.variable} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}
