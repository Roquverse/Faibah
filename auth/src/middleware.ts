import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 
    (process.env.NODE_ENV === 'production' ? '.faibah.com' : undefined);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, domain: cookieDomain })
          )
        },
      },
      cookieOptions: {
        domain: cookieDomain,
      },
    }
  )

  // refreshing the auth token
  let user = null;
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (err) {
    console.error('Error fetching user in middleware:', err);
  }

  // Protect /portal and /(dashboard) routes
  // The /(dashboard) routes are mounted at the root except for /onboarding, /api, /login
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup') || request.nextUrl.pathname.startsWith('/verify')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/auth')
  const isPublicRoute = isAuthRoute || isApiRoute || request.nextUrl.pathname.startsWith('/onboarding')
  const isProtectedRoute = !isPublicRoute && !request.nextUrl.pathname.match(/\.(.*)$/) // ignore static files

  const authUrl = process.env.NEXT_PUBLIC_AUTH_APP_URL || 'https://auth.faibah.com'

  if (isProtectedRoute && !user) {
    // Redirect unauthenticated users to the centralized Auth app
    return NextResponse.redirect(`${authUrl}/login`)
  }
  
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && !user) {
    // Redirect them to the centralized auth app's login page
    return NextResponse.redirect(`${authUrl}${request.nextUrl.pathname}`)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
