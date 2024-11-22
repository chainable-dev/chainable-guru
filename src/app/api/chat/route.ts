import { NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/openai-functions';
import { webSearch } from '@/lib/search-functions';

export async function POST(req: Request) {
  try {
    const { messages, enableSearch } = await req.json();
    
    const completion = await getChatCompletion(messages, enableSearch);
    
    if (completion.choices[0].function_call) {
      const functionCall = completion.choices[0].function_call;
      
      if (functionCall.name === 'web_search') {
        const { query } = JSON.parse(functionCall.arguments);
        const searchResults = await webSearch(query);
        
        // Send search results back to GPT for processing
        const finalResponse = await getChatCompletion([
          ...messages,
          {
            role: 'function',
            name: 'web_search',
            content: JSON.stringify(searchResults)
          }
        ]);
        
        return NextResponse.json({ message: finalResponse.choices[0].message });
      }
    }
    
    return NextResponse.json({ message: completion.choices[0].message });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 