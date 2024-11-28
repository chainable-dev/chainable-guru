import { useChat } from "@/lib/hooks/use-chat";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: {
      request: async (messages) => {
        const { sendMessage } = useChat();
        const response = await sendMessage(messages[messages.length - 1].content);
        return response;
      },
    },
  });

  // ... (keep the rest of the component code)
} 