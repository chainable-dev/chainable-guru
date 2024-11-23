import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'        
import { getSession } from '@/db/cached-queries'
import { VoteService } from '@/lib/services/vote-service'
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message_id, vote_type } = await request.json()
    
    if (!message_id || !vote_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const voteService = VoteService.getInstance()
    const result = await voteService.castVote({
      message_id,
      user_id: session.user.id,
      vote_type
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const message_id = searchParams.get('message_id')

    if (!message_id) {
      return NextResponse.json(
        { error: 'Message ID required' },
        { status: 400 }
      )
    }

    const voteService = VoteService.getInstance()
    const counts = await voteService.getVoteCount(message_id)

    return NextResponse.json(counts)

  } catch (error) {
    console.error('Vote count API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 