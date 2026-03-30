export const revalidate = 30

import { createClient } from '@/lib/supabase-server'
import { ProgramClient } from './ProgramClient'

export default async function ProgramPage() {
  const supabase = await createClient()
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })

  // Get current user + followed mosques in parallel
  const [{ data: { user } }, { data: followRows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('mosque_follows')
      .select('mosque_id, mosques(id, name, slug)')
      .order('created_at', { ascending: true }),
  ])

  // Build followed mosque list
  const followedMosques = (followRows ?? [])
    .map((r: any) => r.mosques)
    .filter(Boolean) as { id: string; name: string; slug: string }[]

  const mosqueIds = followedMosques.map(m => m.id)

  // Fetch upcoming + past (filtered by followed mosques if any)
  let upcomingQ = supabase
    .from('programs')
    .select('id, title, description, category, program_date, start_time, end_time, location, needs_volunteers, volunteer_slots, image_url, mosque_id, mosques(name), volunteer_signups(id)')
    .eq('is_published', true)
    .gte('program_date', today)
    .order('program_date', { ascending: true })

  let pastQ = supabase
    .from('programs')
    .select('id, title, category, program_date, mosque_id, mosques(name)')
    .eq('is_published', true)
    .lt('program_date', today)
    .order('program_date', { ascending: false })
    .limit(12)

  // Only filter by mosque if user follows at least one mosque
  if (mosqueIds.length > 0) {
    upcomingQ = upcomingQ.in('mosque_id', mosqueIds)
    pastQ     = pastQ.in('mosque_id', mosqueIds)
  }

  const [{ data: upcoming }, { data: past }] = await Promise.all([upcomingQ, pastQ])

  // Flatten mosque name into each program
  const flatUpcoming = (upcoming ?? []).map((p: any) => ({
    ...p,
    mosque_name: p.mosques?.name ?? null,
  }))
  const flatPast = (past ?? []).map((p: any) => ({
    ...p,
    mosque_name: p.mosques?.name ?? null,
  }))

  return (
    <ProgramClient
      upcoming={flatUpcoming}
      past={flatPast}
      followedMosques={followedMosques}
      isLoggedIn={!!user}
    />
  )
}
