export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { LoginForm } from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string; mode?: string }>
}) {
  // Next.js 15+ — searchParams is a Promise, must be awaited
  const { error, message, next, mode } = await searchParams

  // Redirect already-authenticated users
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(next ?? '/')

  return (
    <Suspense>
      <LoginForm
        error={error}
        message={message}
        redirectTo={next ?? '/'}
        initialMode={mode === 'signup' ? 'signup' : 'login'}
      />
    </Suspense>
  )
}
