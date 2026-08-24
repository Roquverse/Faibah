import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthRootPage() {
  const supabase = await createClient()

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
