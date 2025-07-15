import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully authenticated, redirect to the next page
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/auth`)
} 