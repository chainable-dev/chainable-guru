import { createParser } from 'eventsource-parser';
import { OpenAIStreamConfig } from './types';
import { getOpenAIConfig } from './openai-config';

export async function OpenAIStream(body: any, config: OpenAIStreamConfig) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Use the OpenAI config from environment variables by default
  const openaiConfig = getOpenAIConfig();
  
  // Allow override of API key if provided in config
  const apiKey = config.apiKey || openaiConfig.apiKey;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
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
      const reader = res.body?.getReader();
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

// Helper function to stream an existing response
export async function streamExistingResponse(response: Response) {
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