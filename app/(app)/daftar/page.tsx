import { DaftarWizard } from './DaftarWizard'

export const metadata = {
  title: 'Daftar Masjid — Sajda',
  description: 'Daftarkan masjid atau surau anda di platform komuniti Sajda.',
}

export default function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  return <DaftarWizard />
}
