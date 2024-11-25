import { Chat } from "@/components/custom/chat"
import { createSystemMessage } from "@/utils/convert-to-ui-messages"

export default function Page() {
	const initialMessages = [
		createSystemMessage(
			"You are a helpful AI assistant focused on blockchain technology and Web3."
		)
	]
	
	return (
		<div className="flex-1">
			<Chat 
				id={crypto.randomUUID()}
				initialMessages={initialMessages}
				selectedModelId="gpt-3.5-turbo"
			/>
		</div>
	);
}
