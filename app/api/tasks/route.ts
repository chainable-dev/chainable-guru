import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

import { getSession } from "@/db/cached-queries";

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  streaming: true,
  modelName: "gpt-4-turbo-preview",
  maxTokens: 2000,
  temperature: 0.7,
});

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { type, input, priority } = await request.json();

    // Create a streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Create the LangChain chain
    const basePrompt = PromptTemplate.fromTemplate(`
      Task Type: {type}
      Input: {input}
      
      Please process this task and provide a detailed response.
      If this is a research task, include citations and sources.
      If this is an analysis task, provide step-by-step reasoning.
      
      Response:
    `);

    const chain = RunnableSequence.from([
      {
        type: () => type,
        input: (input: string) => input,
      },
      basePrompt,
      chatModel,
      new StringOutputParser(),
    ]);

    // Process the chain with streaming
    (async () => {
      try {
        let buffer = "";
        const stream = await chain.stream({
          input,
        });

        for await (const chunk of stream) {
          buffer += chunk;
          await writer.write(
            encoder.encode(
              JSON.stringify({
                type: "update",
                content: chunk,
                progress: Math.min(
                  90,
                  Math.floor((buffer.length / 500) * 100)
                ),
              }) + "\n"
            )
          );
        }

        // Send completion message
        await writer.write(
          encoder.encode(
            JSON.stringify({
              type: "complete",
              content: buffer,
              progress: 100,
            }) + "\n"
          )
        );
      } catch (error) {
        console.error("Error in chain processing:", error);
        await writer.write(
          encoder.encode(
            JSON.stringify({
              type: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            }) + "\n"
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in task route:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return new Response("Task ID is required", { status: 400 });
    }

    // In a real implementation, you would fetch the task status from a database
    // For now, we'll return a mock response
    return new Response(
      JSON.stringify({
        id: taskId,
        status: "completed",
        progress: 100,
        output: "Task completed successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in task route:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
} 