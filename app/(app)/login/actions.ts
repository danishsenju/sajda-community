'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function signInWithGoogle(formData: FormData) {
  const next   = (formData.get('next')   as string) || '/'
  const origin = (formData.get('origin') as string) || 'http://localhost:3000'

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )
}

export async function signIn(formData: FormData) {
  const email    = (formData.get('email')    as string).trim()
  const password = formData.get('password')  as string
  const next     = (formData.get('next')     as string) || '/'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message === 'Invalid login credentials'
      ? 'Emel atau kata laluan tidak betul.'
      : error.message
    redirect(`/login?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}`)
  }

  redirect(next)
}

export async function signUp(formData: FormData) {
  const email    = (formData.get('email')    as string).trim()
  const password = formData.get('password')  as string
  const fullName = (formData.get('fullName') as string).trim()
  const next     = (formData.get('next')     as string) || '/'
  const origin   = (formData.get('origin')   as string) || 'http://localhost:3000'

  if (password.length < 6) {
    redirect(`/login?mode=signup&error=${encodeURIComponent('Kata laluan minimum 6 aksara.')}&next=${encodeURIComponent(next)}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    redirect(`/login?mode=signup&error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`)
  }

  redirect(
    `/login?message=${encodeURIComponent('Akaun dibuat. Semak emel anda untuk mengesahkan sebelum log masuk.')}&next=${encodeURIComponent(next)}`
  )
}
