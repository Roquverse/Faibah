import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Tier-restricted routes ────────────────────────────────────────────────
// These are enforced at the network edge — browser-level guards are a UX
// layer on top, not the security boundary.
//
// We cannot read plan_tier at middleware level without a DB call, so we
// gate only on *authentication* at the edge. The client-side TierContext +
// useTierAccess hook enforces feature visibility within the authenticated
// session. For true server-side tier enforcement, a future API route can
// proxy the check.
//
// Routes that need auth (all dashboard routes) ↓
const CONTRACTOR_ROUTES = ['/proposals'];
const AGENCY_ROUTES = ['/quotations', '/tasks', '/team', '/channels', '/schedule'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN ||
    (process.env.NODE_ENV === 'production' ? '.faibah.com' : undefined);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, domain: cookieDomain })
          )
        },
      },
      cookieOptions: { domain: cookieDomain },
    }
  )

  let user = null;
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (err) {
    console.error('Error fetching user in middleware:', err);
  }

  const { pathname } = request.nextUrl;

  const isAuthRoute    = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/verify');
  const isApiRoute     = pathname.startsWith('/api') || pathname.startsWith('/auth');
  const isPublicRoute  = isAuthRoute || isApiRoute || pathname.startsWith('/onboarding');
  const isProtectedRoute = !isPublicRoute && !pathname.match(/\.(.*)$/);

  const authUrl = process.env.NEXT_PUBLIC_AUTH_APP_URL || 'https://auth.faibah.com';

  // ── Auth guards ────────────────────────────────────────────────────────
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(`${authUrl}/login`);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && !user) {
    return NextResponse.redirect(`${authUrl}${pathname}`);
  }

  // ── Tier route guards (redirect locked routes → home with upgrade param) ─
  // Note: plan_tier is read client-side via TierContext. Middleware guards
  // are a safety net — they redirect if the plan_tier cookie is set and
  // mismatches. Tier cookie is set by the backend on login.
  if (user) {
    const planTier = request.cookies.get('faibah_plan_tier')?.value ?? 'agency';

    const isContractorRoute = CONTRACTOR_ROUTES.some(r => pathname.startsWith(r));
    const isAgencyRoute = AGENCY_ROUTES.some(r => pathname.startsWith(r));

    if (isAgencyRoute && planTier === 'solo') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('upgrade', 'agency');
      return NextResponse.redirect(url);
    }

    if (isContractorRoute && planTier === 'solo') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('upgrade', 'contractor');
      return NextResponse.redirect(url);
    }

    if (isAgencyRoute && planTier === 'contractor') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('upgrade', 'agency');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
