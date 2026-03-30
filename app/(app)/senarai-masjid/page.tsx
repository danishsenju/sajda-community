export const revalidate = 120

import { createClient } from '@/lib/supabase-server'
import { MosqueDirectoryClient } from './MosqueDirectoryClient'

export const metadata = {
  title: 'Senarai Masjid — Sajda',
  description: 'Cari dan ikut masjid berhampiran anda di platform komuniti Sajda.',
}

export default async function SenaraiMasjidPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all active mosques with follower count
  const { data: mosques } = await (supabase as any)
    .from('mosques')
    .select(`
      *,
      follower_count:mosque_follows(count),
      subscription:subscriptions(plan, status)
    `)
    .eq('is_active', true)
    .order('name')

  // Get the current user's follows
  let followedIds: string[] = []
  if (user) {
    const { data: follows } = await (supabase as any)
      .from('mosque_follows')
      .select('mosque_id')
      .eq('user_id', user.id)
    followedIds = ((follows ?? []) as Array<{ mosque_id: string }>).map(f => f.mosque_id)
  }

  // Normalise data
  const mosqueList = ((mosques ?? []) as any[]).map((m) => {
    const followArr = m.follower_count as Array<{ count: number }> | null
    const subArr    = m.subscription  as Array<{ plan: string; status: string }> | null
    return {
      ...m,
      follower_count:  followArr?.[0]?.count ?? 0,
      plan: subArr?.find((s: { status: string }) => s.status === 'active')?.plan ?? null,
    }
  })

  return (
    <MosqueDirectoryClient
      mosques={mosqueList}
      followedIds={followedIds}
      isLoggedIn={!!user}
    />
  )
}
