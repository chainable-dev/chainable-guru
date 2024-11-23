import { Suspense } from 'react'
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Messages } from "@/components/chat/messages"
import { ChatInput } from "@/components/chat/chat-input"

export default async function ChatPage({
  params
}: {
  params: { id: string }
}) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className={cn(
        "container flex flex-1 flex-col",
        "px-2 md:px-4"
      )}>
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto py-2 md:py-4">
          <div className="space-y-4 mx-2 md:mx-4">
            <Suspense fallback={<Card className="p-4">Loading messages...</Card>}>
              <Messages chatId={params.id} />
            </Suspense>
          </div>
        </div>

        {/* Input area */}
        <div className={cn(
          "border-t bg-background",
          "py-2 md:py-4",
          "px-2 md:px-4",
          "sticky bottom-0"
        )}>
          <ChatInput chatId={params.id} />
        </div>
      </div>
    </div>
  )
}
