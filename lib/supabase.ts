import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

// No singleton — each call creates a fresh client so it always reads
// the latest cookies set by Server Actions (avoids stale session state)
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
