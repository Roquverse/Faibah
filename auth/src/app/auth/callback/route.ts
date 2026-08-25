import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function getAuthBaseUrl(request: Request) {
  if (process.env.NEXT_PUBLIC_AUTH_APP_URL) {
    return process.env.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, '');
  }
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://auth.faibah.com';
  }
  const { origin } = new URL(request.url);
  return origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const authBaseUrl = getAuthBaseUrl(request);

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

      return NextResponse.redirect(`${authBaseUrl}/onboarding`);
    }
  }

  return NextResponse.redirect(`${authBaseUrl}/login?error=Could%20not%20authenticate%20user`);
}
