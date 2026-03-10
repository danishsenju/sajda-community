import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, unit_blok')
        .eq('id', session.user.id)
        .single()

      const isIncomplete = !profile?.full_name || !profile?.phone || !profile?.unit_blok
      if (isIncomplete) {
        return NextResponse.redirect(
          new URL(`/profile/setup?next=${encodeURIComponent(next)}`, requestUrl.origin)
        )
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
