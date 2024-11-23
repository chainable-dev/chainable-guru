import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { getSession } from '@/db/cached-queries'
import { voteMessage } from '@/db/mutations'

export async function POST(request: Request) {
  try {
    const { chatId, messageId, type } = await request.json()

    if (!chatId || !messageId || !type) {
      return new Response('Missing required fields', { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    await voteMessage({ chatId, messageId, type })

    return new Response('Vote recorded', { status: 200 })
  } catch (error) {
    console.error('Error recording vote:', error)
    return new Response('An error occurred', { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get('chatId')

  if (!chatId) {
    return new Response('Missing chatId', { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data: votes } = await supabase
      .from('votes')
      .select()
      .eq('chat_id', chatId)

    return Response.json(votes || [], { status: 200 })
  } catch (error) {
    console.error('Error fetching votes:', error)
    return new Response('An error occurred', { status: 500 })
  }
}
