import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /portal and /(dashboard) routes
  // The /(dashboard) routes are mounted at the root except for /onboarding, /api, /login
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isPublicRoute = isAuthRoute || isApiRoute || request.nextUrl.pathname.startsWith('/onboarding')
  const isProtectedRoute = !isPublicRoute && !request.nextUrl.pathname.match(/\.(.*)$/) // ignore static files

  if (isProtectedRoute && !user) {
    const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3000'
    return NextResponse.redirect(new URL('/login', landingUrl))
  }
  
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // If user hits the dashboard login route but we want to force them to landing auth
  if (isAuthRoute && !user) {
    const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3000'
    return NextResponse.redirect(new URL('/login', landingUrl))
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
