'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database.types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  // Stable client instance — never recreated across renders
  const supabase = useRef(createClient()).current

  useEffect(() => {
    async function fetchProfile(uid: string): Promise<Profile | null> {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, phone, unit_blok')
        .eq('id', uid)
        .single()
      return data
    }

    async function load() {
      // getSession() reads from localStorage — instant, no network roundtrip
      const { data: { session } } = await supabase.auth.getSession()
      const profile = session?.user ? await fetchProfile(session.user.id) : null
      setUser(session?.user ?? null)
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
