import { OpenAIStream, StreamingTextResponse } from 'ai'
import { chatService } from '@/lib/services/chat.service'
import { cookies } from 'next/headers'
import { modelsService } from '@/lib/services/models.service'

export const runtime = 'edge'

export async function POST(req: Request) {
	try {
		const json = await req.json()
		const { messages } = json
		
		const cookieStore = await cookies()
		const modelIdFromCookie = await cookieStore.get('model-id')
		const selectedModelId = modelIdFromCookie?.value && modelsService.isValidModelId(modelIdFromCookie.value)
			? modelIdFromCookie.value
			: 'gpt-4'

		const response = await chatService.streamChat({
			messages,
			modelId: selectedModelId,
		})

		// Create a stream from the OpenAI response
		const stream = OpenAIStream(response)

		// Return a StreamingTextResponse, which can be consumed by the client
		return new StreamingTextResponse(stream)
	} catch (error) {
		console.error('Chat API Error:', error)
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'An error occurred during chat',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		)
	}
}

export async function DELETE(request: Request) {
	const { searchParams } = new URL(request.url)
	const id = searchParams.get("id")

	if (!id) {
		return new Response("Not Found", { status: 404 })
	}

	try {
		const chat = await getChatById(id)

		if (!chat) {
			return new Response("Chat not found", { status: 404 })
		}

		await deleteChatById(id)
		return new Response("Chat deleted", { status: 200 })
	} catch (error) {
		console.error("Error deleting chat:", error)
		return new Response("An error occurred while processing your request", {
			status: 500,
		})
	}
}
