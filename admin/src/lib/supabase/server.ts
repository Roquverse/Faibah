import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 
    (process.env.NODE_ENV === 'production' ? '.faibah.com' : undefined);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, domain: cookieDomain })
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
      cookieOptions: {
        domain: cookieDomain,
      },
    }
  )
}
