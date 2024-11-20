import { ReactNode } from 'react'

interface MessageProps {
  message: {
    content: string | ReactNode
  }
}

export const Message = ({ message }: MessageProps) => (
  <div>{message.content}</div>
)

export const Chat = () => (
  <main>
    <div>Start a conversation</div>
  </main>
) 