import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 
      (process.env.NODE_ENV === 'production' ? '.faibah.com' : undefined);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, { ...options, domain: cookieDomain })
              );
            } catch {}
          },
        },
        cookieOptions: {
          domain: cookieDomain,
        }
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const hasCompletedOnboarding = data.user.user_metadata?.onboarding_completed;
      const userType = data.user.user_metadata?.userType;

      if (hasCompletedOnboarding) {
        if (userType === 'client') {
          return NextResponse.redirect(process.env.NEXT_PUBLIC_CLIENT_APP_URL || 'https://client.faibah.com');
        }
        return NextResponse.redirect(process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://app.faibah.com');
      }

      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate%20user`);
}
