import { createParser } from 'eventsource-parser';

export async function OpenAIStream(response: Response) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(JSON.stringify(error));
  }

  return new ReadableStream({
    async start(controller) {
      const parser = createParser((event) => {
        if (event.type === 'event') {
          try {
            const data = JSON.parse(event.data);
            const text = data.choices[0]?.delta?.content || '';
            
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      });

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          parser.feed(decoder.decode(value));
        }
      } catch (e) {
        console.error('Stream error:', e);
        controller.error(e);
      }
    },
  });
} 