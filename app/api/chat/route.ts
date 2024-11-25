import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import createRateLimit from '../../utils/rate-limiter'

const limiter = createRateLimit({
  interval: 60000,
  tokensPerInterval: 40000
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    const body = await req.json()
    const { messages, maxTokens = 1000 } = body
    
    await limiter.check(ip, messages, maxTokens)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: maxTokens,
    })

    return NextResponse.json(completion)

  } catch (error: any) {
    console.error('Chat API Error:', error)
    
    if (error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 