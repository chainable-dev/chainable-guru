import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  
  // Create supabase middleware client with proper typing
  const supabase = createMiddlewareClient<Database>({ req: request, res });

  // Special handling for auth callback
  if (pathname.startsWith('/auth/callback')) {
    return res;
  }

  // Define public routes
  const publicRoutes = ['/login', '/register', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Handle public routes
  if (isPublicRoute) {
    if (session) {
      // Redirect to home if already logged in
      return NextResponse.redirect(new URL('/', request.url));
    }
    return res;
  }

  // Handle protected routes
  if (!session) {
    let redirectUrl = new URL('/login', request.url);
    // Store the original path for redirect after login
    if (pathname !== '/') {
      redirectUrl.searchParams.set('redirectTo', pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
