export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

export function estimateMessagesTokenCount(messages: any[]): number {
  return messages.reduce((acc, msg) => {
    const formatTokens = 4
    const contentTokens = estimateTokenCount(msg.content)
    return acc + formatTokens + contentTokens
  }, 0)
} 