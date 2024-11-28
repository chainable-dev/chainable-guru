import { useChat } from "@/lib/hooks/use-chat";

function useRequest() {
  const { sendMessage } = useChat();
  
  return async (messages: any[]) => {
    const response = await sendMessage(messages[messages.length - 1].content);
    return response;
  };
}

export function Chat() {
  const request = useRequest();
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: { request },
  });

  // ... (keep the rest of the component code)
} 