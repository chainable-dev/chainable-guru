import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  try {
    // Exchange the code from the query params for a session
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error.message);
      return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 500 });
    }

    console.log('Session data:', data);

    // Redirect to a dashboard or home after successful login
    return NextResponse.redirect('/dashboard');
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}