import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  try {
    // Create a response object to modify
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Create a Supabase client using the server component helper
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            // If the cookie is updated, update the request headers
            request.cookies.set({
              name,
              value,
              ...options,
            })
            
            // Update the response headers
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            // If the cookie is removed, update the request headers
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            
            // Update the response headers
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh the session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Check authentication status
    const isLoggedIn = !!session
    const { pathname } = request.nextUrl

    // Redirect authenticated users from public pages to dashboard
    if (isLoggedIn && (pathname === '/' || pathname === '/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Redirect unauthenticated users from protected pages to login
    if (!isLoggedIn && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (e) {
    // If there's an error, we'll just pass the request through
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

// Apply middleware only to relevant paths
export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard',
    '/dashboard/(.*)',
  ],
}
