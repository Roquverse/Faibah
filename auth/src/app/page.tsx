import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AuthRootPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userType = user.user_metadata?.userType
  const hasCompletedOnboarding = user.user_metadata?.onboarding_completed

  if (!hasCompletedOnboarding) {
    redirect('/onboarding')
  }

  if (userType === 'client') {
    redirect(process.env.NEXT_PUBLIC_CLIENT_APP_URL || 'http://localhost:3002')
  } else {
    redirect(process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000')
  }
}
