'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(targetUserId: string, newRole: string) {
  // Verify caller is superadmin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak dibenarkan' }

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (caller?.role !== 'superadmin') return { error: 'Akses ditolak — hanya superadmin' }

  // Prevent self-demotion
  if (targetUserId === user.id && newRole !== 'superadmin') {
    return { error: 'Anda tidak boleh turunkan peranan diri sendiri' }
  }

  // Use admin client to bypass RLS
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ role: newRole as 'jemaah' | 'ajk' | 'superadmin' })
    .eq('id', targetUserId)

  if (error) return { error: error.message }

  revalidatePath('/admin/pengguna')
  return { success: true }
}
