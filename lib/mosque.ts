import { createClient } from '@/lib/supabase-server'
import { PlanTier } from '@/lib/planFeatures'

export interface Mosque {
  id:                   string
  slug:                 string
  name:                 string
  category:             string
  address:              string | null
  state:                string | null
  phone:                string | null
  gmaps_url:            string | null
  logo_url:             string | null
  description:          string | null
  has_wudhu:            boolean
  has_womens_section:   boolean
  has_parking:          boolean
  has_accessibility:    boolean
  jakim_zone:           string
  is_active:            boolean
  created_at:           string
}

export interface MosqueWithPlan extends Mosque {
  plan:           PlanTier | null
  follower_count: number
}

/** Fetch a single mosque by its URL slug */
export async function getMosqueBySlug(slug: string): Promise<Mosque | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mosques')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data ?? null
}

/** Fetch a single mosque by its UUID */
export async function getMosqueById(id: string): Promise<Mosque | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mosques')
    .select('*')
    .eq('id', id)
    .single()
  return data ?? null
}

/** Get the active subscription plan for a mosque */
export async function getMosquePlan(mosqueId: string): Promise<PlanTier | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('mosque_id', mosqueId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return (data?.plan as PlanTier) ?? null
}

/** Get all mosques the current user is AJK/admin for */
export async function getUserMosques(userId: string): Promise<Mosque[]> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('mosque_ajk')
    .select('mosque_id, mosques(*)')
    .eq('user_id', userId)
  if (!data) return []
  return (data as Array<{ mosques: Mosque }>).map(row => row.mosques).filter(Boolean)
}

/** Check if a user is AJK/admin for a specific mosque */
export async function isUserAjk(mosqueId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mosque_ajk')
    .select('id')
    .eq('mosque_id', mosqueId)
    .eq('user_id', userId)
    .single()
  return !!data
}

/** Get follower count for a mosque */
export async function getMosqueFollowerCount(mosqueId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('mosque_follows')
    .select('*', { count: 'exact', head: true })
    .eq('mosque_id', mosqueId)
  return count ?? 0
}

/** Fetch paginated list of active mosques for the directory */
export async function listMosques(opts: {
  state?: string
  category?: string
  search?: string
  page?: number
  pageSize?: number
} = {}): Promise<{ mosques: Mosque[]; total: number }> {
  const { state, category, search, page = 1, pageSize = 20 } = opts
  const supabase = await createClient()

  let query = supabase
    .from('mosques')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('name')
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (state)    query = query.eq('state', state)
  if (category) query = query.eq('category', category)
  if (search)   query = query.ilike('name', `%${search}%`)

  const { data, count } = await query
  return { mosques: data ?? [], total: count ?? 0 }
}
