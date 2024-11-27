import { NextResponse } from "next/server";
import { generateUUID } from "@/lib/utils";
import { StreamingTextResponse } from 'ai';
import { createClient } from "@/lib/supabase/client";
import { useModelSettings } from "@/lib/store/model-settings";

export const maxDuration = 300; // Longer timeout for local testing

function logError(context: string, error: any) {
  console.error('\x1b[31m%s\x1b[0m', `🚨 Error in ${context}:`);
  console.error('\x1b[31m%s\x1b[0m', error?.message || error);
  if (error?.stack) {
    console.error('\x1b[33m%s\x1b[0m', 'Stack trace:');
    console.error(error.stack);
  }
  if (error?.cause) {
    console.error('\x1b[33m%s\x1b[0m', 'Caused by:');
    console.error(error.cause);
  }
}

export async function POST(req: Request) {
  const json = await req.json();
  const { messages, modelId } = json;
  const chatId = json.id || generateUUID();

  console.log('\x1b[36m%s\x1b[0m', `📝 Processing chat request for model: ${modelId || 'llama2'}`);

  try {
    // Get model settings from store
    const modelSettings = useModelSettings.getState().settings;
    console.log('\x1b[36m%s\x1b[0m', '⚙️ Current model settings:', {
      temperature: modelSettings.temperature,
      topK: modelSettings.topK,
      topP: modelSettings.topP,
      repeatPenalty: modelSettings.repeatPenalty,
    });

    // Add system message to the beginning of the messages array
    const systemMessage = {
      role: 'system',
      content: modelSettings.systemPrompt
    };

    // Make request to local Ollama instance
    console.log('\x1b[36m%s\x1b[0m', '🔄 Making request to Ollama...');
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId || 'llama2',
        messages: [systemMessage, ...messages].map((message: any) => ({
          role: message.role === 'user' ? 'user' : 'assistant',
          content: message.content,
        })),
        stream: true,
        options: {
          temperature: modelSettings.temperature,
          num_predict: modelSettings.numPredict,
          top_k: modelSettings.topK,
          top_p: modelSettings.topP,
          repeat_penalty: modelSettings.repeatPenalty,
          stop: modelSettings.stop,
        },
      }),
    }).catch(error => {
      logError('Ollama API request', error);
      throw new Error('Failed to connect to Ollama. Is it running?', { cause: error });
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      logError('Ollama API response', new Error(`HTTP ${response.status}: ${errorText}`));
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    // Create a TransformStream to handle the response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Process the stream
    const processStream = async () => {
      const reader = response.body?.getReader();
      if (!reader) {
        logError('Stream processing', new Error('No response body available'));
        throw new Error('No response body');
      }

      try {
        let buffer = '';
        let currentMessage = '';
        let messageCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;
          
          // Process complete JSON objects
          const lines = buffer.split('\n').filter(Boolean);
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            try {
              const { message, done: responseDone, error } = JSON.parse(line);
              
              if (error) {
                logError('Ollama response', new Error(error));
                continue;
              }

              if (message?.content) {
                currentMessage += message.content;
                messageCount++;
                // Forward the model's response
                writer.write(encoder.encode(message.content));
              }

              if (responseDone) {
                console.log('\x1b[32m%s\x1b[0m', `✅ Response complete - Processed ${messageCount} chunks`);
              }
            } catch (e) {
              logError('JSON parsing', e);
            }
          }
        }
      } catch (error) {
        logError('Stream processing', error);
        throw error;
      } finally {
        writer.close();
      }
    };

    // Start processing the stream
    processStream();

    // Return the transformed stream
    return new StreamingTextResponse(readable);
  } catch (error: any) {
    logError('Main process', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during the Ollama API request',
        details: error.cause?.message || error.cause,
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 