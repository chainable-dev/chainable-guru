import { StreamingTextResponse, Message } from 'ai';
import { experimental_StreamData } from 'ai';
import { ChatHandler } from '@/lib/agents/chat-handler';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // Create a new StreamData instance for sending intermediate updates
  const data = new experimental_StreamData();
  
  // Initialize stream encoder
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Get chat handler instance
  const chatHandler = await ChatHandler.getInstance();

  // Process the message and handle streaming
  try {
    const responsePromise = chatHandler.processMessage(
      lastMessage.content,
      (token: string) => {
        // Write each token to the stream
        writer.write(encoder.encode(token));
      }
    );

    // Handle the final response
    responsePromise.then(async (response) => {
      // Close the stream after the final response
      writer.close();
    }).catch((error) => {
      console.error('Error processing message:', error);
      writer.write(encoder.encode('An error occurred while processing your message.'));
      writer.close();
    });

    // Return the streaming response
    return new StreamingTextResponse(stream.readable, { headers: data.headers });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('An error occurred', { status: 500 });
  }
} 