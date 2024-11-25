import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/login", "/register", "/api/webhook"],
  async afterAuth(auth, req) {
    const res = NextResponse.next();
    
    try {
      // Create Supabase client
      const supabase = createMiddlewareClient({ req, res });

      if (auth.userId) {
        // Get session from Clerk
        const session = await auth.session;
        if (session) {
          // Set Supabase session using session ID
          await supabase.auth.setSession({
            access_token: session.id,
            refresh_token: ""
          });
        }
      }

      return res;
    } catch (error) {
      console.error("Middleware error:", error);
      return res;
    }
  }
});

// Ensure matcher includes all paths that need auth
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", // Match all paths except static files
    "/",                           // Include root path
    "/(api|trpc)/(.*)",           // Include API routes
  ]
};
