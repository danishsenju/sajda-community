import { notFound } from 'next/navigation'
import { getMosqueBySlug, getMosquePlan } from '@/lib/mosque'
import { Navbar } from '@/components/layout/Navbar'

export const revalidate = 60

interface Props {
  children:  React.ReactNode
  params:    Promise<{ mosqueSlug: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ mosqueSlug: string }> }) {
  const { mosqueSlug } = await params
  const mosque = await getMosqueBySlug(mosqueSlug)
  if (!mosque) return {}
  return {
    title: `${mosque.name} — Sajda`,
    description: mosque.description ?? `Komuniti ${mosque.name} di Sajda.`,
  }
}

export default async function MosqueLayout({ children, params }: Props) {
  const { mosqueSlug } = await params
  const mosque = await getMosqueBySlug(mosqueSlug)

  if (!mosque) notFound()

  return (
    <>
      {/* The global Navbar still renders via root layout —
          we just pass mosque context down via children */}
      {children}
    </>
  )
}
