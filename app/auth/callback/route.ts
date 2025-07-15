import { createClient } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/client'
import { TrialManager } from '@/lib/trial/manager'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if this is a new user (first time signing up)
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id, trial_started_at')
        .eq('id', data.user.id)
        .single()

      if (!existingUser) {
        // This is a new user, create their profile and start trial
        try {
          // Create user profile
          await supabaseAdmin
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subscription_status: 'trialing'
            })

          // Start 14-day trial
          await TrialManager.startTrial(data.user.id)

          // Redirect to onboarding for new users
          return NextResponse.redirect(`${origin}/onboarding`)
        } catch (trialError) {
          console.error('Failed to start trial:', trialError)
          // Continue to dashboard even if trial setup fails
        }
      } else if (!existingUser.trial_started_at) {
        // User exists but no trial started, start trial
        try {
          await TrialManager.startTrial(data.user.id)
        } catch (trialError) {
          console.error('Failed to start trial:', trialError)
        }
      }

      // Successfully authenticated, redirect to the next page
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/auth`)
} 