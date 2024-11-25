import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";

export const createClerkSupabaseMiddleware = () => {
  return authMiddleware({
    publicRoutes: [
      "/",
      "/login",
      "/register",
      "/api/webhook",
      "/api/auth/callback",
    ],
    async afterAuth(auth, req) {
      const res = NextResponse.next();
      const supabase = createMiddlewareClient({ req, res });

      try {
        if (auth.userId) {
          const clerkToken = await auth.getToken({
            template: "supabase", // Use Supabase JWT template
          });

          if (clerkToken) {
            await supabase.auth.setSession({
              access_token: clerkToken,
              refresh_token: "",
            });
          }
        }

        return res;
      } catch (error) {
        console.error("Auth middleware error:", error);
        return res;
      }
    },
  });
}; 