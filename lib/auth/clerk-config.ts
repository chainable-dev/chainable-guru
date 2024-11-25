import { clerkClient } from "@clerk/nextjs";

// Configure Clerk to use Supabase JWT template
await clerkClient.jwksList.createJwkList({
  applicationId: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!.split('_')[0],
  template: "supabase",
  jwks: {
    keys: [
      {
        use: "sig",
        kty: "RSA",
        // Add your Supabase JWT configuration here
      }
    ]
  }
}); 