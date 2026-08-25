import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 
    (typeof window !== 'undefined' && window.location.hostname.includes('faibah.com') ? '.faibah.com' : undefined);

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    {
      cookieOptions: {
        domain: cookieDomain,
      },
    }
  )
}
