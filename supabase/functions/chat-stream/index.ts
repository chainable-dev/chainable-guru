// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatOpenAI } from "npm:@langchain/openai";
import { PromptTemplate } from "npm:@langchain/core/prompts";
import { RunnableSequence } from "npm:@langchain/core/runnables";
import { StringOutputParser } from "npm:@langchain/core/output_parser";

console.log('Edge Function Starting...');

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      });
    }

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization header' }),
        { 
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Parse request body
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing chat request with LangChain...');

    // Initialize LangChain
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0.7,
      streaming: true,
      openAIApiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Create prompt template
    const prompt = PromptTemplate.fromTemplate(`
      You are Elron, an AI assistant specializing in blockchain and cryptocurrency information.
      Current conversation:
      {history}
      Human: {input}
      Assistant: Let me help you with that.
    `);

    // Create chain
    const chain = RunnableSequence.from([
      {
        input: (input: { messages: any[] }) => {
          const history = input.messages
            .slice(0, -1)
            .map((m: any) => `${m.role}: ${m.content}`)
            .join("\n");
          
          const lastMessage = input.messages[input.messages.length - 1];
          
          return {
            history,
            input: lastMessage.content,
          };
        },
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    // Create stream
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    try {
      // Execute chain with streaming
      const streamingResponse = await chain.stream({
        messages,
      });

      // Forward the stream
      const reader = streamingResponse.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writer.write(new TextEncoder().encode(value));
      }
      await writer.close();
    } catch (error) {
      console.error('Streaming error:', error);
      await writer.write(new TextEncoder().encode(`Error: ${error.message}`));
      await writer.close();
    }

    // Return streaming response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        details: error.cause?.toString()
      }),
      { 
        status: error.status || 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-stream' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
