import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from './src/lib/supabase/edge'

// Edge Runtime middleware
export async function middleware(request: NextRequest) {
  // Create supabase server client
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const isLoggedIn = !!session

  // Define protected routes and public routes
  const protectedRoutes = ['/dashboard'] // Add any other routes that require login
  const publicRoutes = ['/', '/login'] // Add any other public routes

  // Redirect logged-in users away from home page to dashboard
  if (isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect logged-in users away from login page to dashboard
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect logged-out users trying to access protected routes to login
  if (!isLoggedIn && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow request to continue for all other cases
  return response
}

export const config = {
  // Simplified matcher that covers the essential paths
  matcher: ['/', '/login', '/dashboard/:path*']
}
