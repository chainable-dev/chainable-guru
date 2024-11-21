import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const hash = requestUrl.hash

  // Create Supabase client
  const supabase = createClient()

  // Handle hash-based authentication (OAuth providers)
  if (hash && hash.includes('access_token')) {
    try {
      // Parse the hash fragment
      const hashParams = new URLSearchParams(hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const expiresIn = hashParams.get('expires_in')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: parseInt(expiresIn || '3600')
        })

        if (error) {
          console.error('Error setting session:', error)
          return NextResponse.redirect(
            `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
          )
        }

        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error('Error processing hash params:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed')}`
      )
    }
  }

  // Handle code-based authentication (email/password)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
      )
    }

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }

  // If no code or hash params found, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
