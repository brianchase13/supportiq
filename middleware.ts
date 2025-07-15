import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not available in middleware')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

    // Refresh session if expired - required for Server Components
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/settings', '/insights', '/checkout']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Define auth routes (login/signup)
    const authRoutes = ['/auth']
    const isAuthRoute = authRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Define onboarding route
    const isOnboardingRoute = request.nextUrl.pathname === '/onboarding'

    // If accessing protected route without auth, redirect to login
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/auth', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing auth route while already authenticated, redirect to dashboard
    if (isAuthRoute && user) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    // Check if user needs onboarding (for authenticated users)
    if (user && isProtectedRoute && !isOnboardingRoute) {
      try {
        // Check if user has completed onboarding
        const { data: userProfile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()
        
        if (userProfile && !userProfile.onboarding_completed) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        // Continue without onboarding check if there's an error
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    // Return the response without authentication checks if there's an error
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
} 