import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './src/lib/supabase/middleware' // Use relative path for Edge compatibility

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const isLoggedIn = !!session

  // Define protected routes and public routes
  const protectedRoutes = ['/dashboard'] // Add any other routes that require login
  const publicRoutes = ['/', '/login'] // Add any other public routes

  // Redirect logged-in users away from home page to dashboard
  if (isLoggedIn && pathname === '/') {
    console.log('[Middleware] User logged in, redirecting from / to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect logged-in users away from login page to dashboard
  if (isLoggedIn && pathname === '/login') {
    console.log('[Middleware] User logged in, redirecting from /login to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect logged-out users trying to access protected routes to login
  if (!isLoggedIn && protectedRoutes.includes(pathname)) {
     console.log(`[Middleware] User not logged in, redirecting from ${pathname} to /login`);
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow request to continue for all other cases
  return response
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
    // Apply middleware specifically to root, login and dashboard
     '/',
     '/login',
     '/dashboard',
  ],
}
