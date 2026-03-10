'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database.types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile(uid: string): Promise<Profile | null> {
      const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
      return data
    }

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const profile = user ? await fetchProfile(user.id) : null
      // Batch: prevent brief render where user != null but profile = null
      setUser(user)
      setProfile(profile)
      setLoading(false)
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(session.user)
        setProfile(profile)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAJK = profile?.role === 'ajk' || profile?.role === 'superadmin'
  const isSuperAdmin = profile?.role === 'superadmin'

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return { user, profile, loading, isAJK, isSuperAdmin, signOut }
}
