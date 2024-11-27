import { getSession } from "@/db/cached-queries";
import { createClient } from "@/lib/supabase/server";

const encoder = new TextEncoder();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');
  const user = await getSession();

  if (!user || !chatId) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  let isStreamActive = true;

  const stream = new ReadableStream({
    start: async (controller) => {
      try {
        const supabase = await createClient();
        
        // Subscribe to realtime changes using channel
        const channel = supabase.channel(`messages:${chatId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `chat_id=eq.${chatId}`,
            },
            (payload) => {
              if (!isStreamActive) return;
              
              if (payload.new) {
                const data = JSON.stringify({
                  type: payload.new.type || 'message',
                  content: payload.new.content,
                  data: payload.new.data
                });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
          );

        // Subscribe to the channel
        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && isStreamActive) {
            const data = JSON.stringify({
              type: 'connection',
              status: 'connected'
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        });

        // Handle cleanup
        return () => {
          isStreamActive = false;
          channel.unsubscribe();
          controller.close();
        };
      } catch (error) {
        console.error('Streaming error:', error);
        if (isStreamActive) {
          const errorData = JSON.stringify({
            type: 'error',
            error: error.message || 'Stream error occurred'
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    },
    cancel() {
      isStreamActive = false;
    }
  });

  return new Response(stream, { headers });
} 