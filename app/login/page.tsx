import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { LoginForm } from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string; next?: string; mode?: string }
}) {
  // Redirect already-authenticated users
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(searchParams.next ?? '/')

  return (
    <Suspense>
      <LoginForm
        error={searchParams.error}
        message={searchParams.message}
        redirectTo={searchParams.next ?? '/'}
        initialMode={(searchParams.mode === 'signup') ? 'signup' : 'login'}
      />
    </Suspense>
  )
}
