import { Suspense } from 'react'
import { DaftarWizard } from './DaftarWizard'

export const metadata = {
  title: 'Daftar Masjid — Sajda',
  description: 'Daftarkan masjid atau surau anda di platform komuniti Sajda.',
}

export default function DaftarPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--void)' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    }>
      <DaftarWizard />
    </Suspense>
  )
}
