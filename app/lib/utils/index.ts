export function sanitizeResponseMessages(messages: any[]) {
  return messages.map(msg => ({
    ...msg,
    timestamp: Date.now()
  }));
} 