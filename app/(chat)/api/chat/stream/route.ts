import { getSession } from "@/db/cached-queries";
import { createClient } from "@/lib/supabase/server";

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

  const stream = new ReadableStream({
    start(controller) {
      const supabase = createClient();
      
      // Subscribe to realtime changes
      const subscription = supabase
        .from('messages')
        .on('INSERT', (payload) => {
          if (payload.new && payload.new.chat_id === chatId && payload.new.type === 'intermediate') {
            const data = JSON.stringify({
              type: 'intermediate',
              content: payload.new.content,
              data: payload.new.data
            });
            controller.enqueue(`data: ${data}\n\n`);
          }
        })
        .subscribe();

      // Clean up subscription when client disconnects
      return () => {
        subscription.unsubscribe();
      };
    }
  });

  return new Response(stream, { headers });
} 