export const revalidate = 60

import { createClient } from '@/lib/supabase-server'
import { redirect }     from 'next/navigation'
import { MasjidSayaClient } from './MasjidSayaClient'

export const metadata = {
  title: 'Masjid Saya — Sajda',
}

export default async function MasjidSayaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/masjid-saya')

  const db = supabase as any

  // Fetch all mosques the user follows, with mosque details
  const { data: follows } = await db
    .from('mosque_follows')
    .select(`
      mosque_id,
      mosques (
        id, name, slug, state, address, category, logo_url, jakim_zone
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const followed = (follows ?? [])
    .map((f: any) => f.mosques)
    .filter(Boolean)

  // Fetch quick stats for each followed mosque (upcoming programs + unread announcements)
  const statsMap: Record<string, { programs: number; announcements: number }> = {}

  await Promise.all(
    followed.map(async (mosque: any) => {
      const today = new Date().toISOString().split('T')[0]
      const [{ count: programs }, { count: announcements }] = await Promise.all([
        supabase
          .from('programs')
          .select('id', { count: 'exact', head: true })
          .eq('mosque_id', mosque.id)
          .eq('is_published', true)
          .gte('program_date', today),
        supabase
          .from('announcements')
          .select('id', { count: 'exact', head: true })
          .eq('mosque_id', mosque.id),
      ])
      statsMap[mosque.id] = {
        programs:      programs      ?? 0,
        announcements: announcements ?? 0,
      }
    })
  )

  return (
    <MasjidSayaClient
      followed={followed}
      statsMap={statsMap}
    />
  )
}
