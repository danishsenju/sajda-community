export const revalidate = 30

import { createClient } from '@/lib/supabase-server'
import { KeperluanClient } from './KeperluanClient'

export default async function KeperluanPage() {
  const supabase = await createClient()

  // Get current user + followed mosques in parallel
  const [{ data: { user } }, { data: followRows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('mosque_follows')
      .select('mosque_id, mosques(id, name, slug)')
      .order('created_at', { ascending: true }),
  ])

  const followedMosques = (followRows ?? [])
    .map((r: any) => r.mosques)
    .filter(Boolean) as { id: string; name: string; slug: string }[]

  const mosqueIds = followedMosques.map(m => m.id)

  // Build keperluan query
  let q = supabase.from('keperluan')
    .select('id, title, description, category, urgency, status, created_at, mosque_id, mosques(name), keperluan_helpers(count)')
    .in('status', ['open', 'in_progress'])
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: false })

  // Filter by followed mosques if any
  if (mosqueIds.length > 0) {
    q = q.in('mosque_id', mosqueIds)
  }

  // Pending items for this user only
  let pendingItems: any[] = []
  if (user) {
    const { data: pData } = await supabase.from('keperluan')
      .select('id, title, description, category, urgency, status, created_at, mosque_id, mosques(name)')
      .eq('status', 'pending')
      .eq('posted_by', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    pendingItems = (pData ?? []).map((p: any) => ({
      ...p,
      mosque_name: p.mosques?.name ?? null,
    }))
  }

  const { data: items } = await q

  const flatItems = (items ?? []).map((p: any) => ({
    ...p,
    mosque_name: p.mosques?.name ?? null,
  }))

  return (
    <KeperluanClient
      items={flatItems}
      pendingItems={pendingItems}
      followedMosques={followedMosques}
      isLoggedIn={!!user}
    />
  )
}
