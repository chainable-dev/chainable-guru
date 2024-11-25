import { authMiddleware } from "@clerk/nextjs/server";
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from "next/server";

// Create and export the middleware
export default authMiddleware({
  publicRoutes: [
    "/",
    "/login", 
    "/register",
    "/api/webhook",
    "/api/auth/callback",
    "/api/trpc/(.*)",
    "/api/health",
  ],
  ignoredRoutes: [
    "/api/health",
    "/_next/static/(.*)",
    "/favicon.ico",
  ],
  async afterAuth(auth, req) {
    const res = NextResponse.next();

    // Sync with Supabase session if user is authenticated
    if (auth.userId) {
      const supabase = createMiddlewareClient({ req, res });
      const clerkToken = await auth.getToken();
      
      if (clerkToken) {
        // Get email from session claims
        const emailAddress = auth.sessionClaims?.email as string;
        
        // Set session cookie
        await supabase.auth.setSession({
          access_token: clerkToken,
          refresh_token: '',
        });
      }
    }

    // Handle unauthenticated users
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/login", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    return res;
  }
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", // Match all paths except static files
    "/",                           // Include root path
    "/(api|trpc)/(.*)",           // Include API routes
  ],
};
