import { createRouteHandler } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";

// Helper functions
export function getMostRecentUserMessage(messages: any[]) {
	const userMessages = messages.filter(m => m.role === 'user');
	return userMessages[userMessages.length - 1]?.content || '';
}

export function sanitizeResponseMessages(messages: any[]) {
	return messages.map(message => ({
		role: message.role,
		content: message.content,
		id: message.id
	}));
}

export async function POST(req: Request) {
	try {
		const supabase = await createRouteHandler();
		
		// Get authenticated user
		const { data: { user }, error } = await supabase.auth.getUser();

		if (error || !user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const json = await req.json();
		const { messages, previewToken } = json;

		// Process messages
		const sanitizedMessages = sanitizeResponseMessages(messages);
		const latestMessage = getMostRecentUserMessage(messages);

		// Your AI processing logic here...
		
		// Return streaming response
		const stream = new ReadableStream({
			async start(controller) {
				// Your streaming logic here...
				controller.close();
			},
		});

		return new StreamingTextResponse(stream);

	} catch (error) {
		console.error("[Chat API] Error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
