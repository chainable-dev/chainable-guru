'use server'

import { Message } from '@/types/chat'
import { customAlphabet } from 'nanoid'
import { Logger } from '@/lib/utils/logger'

const nanoid = customAlphabet('1234567890abcdef', 10)

export async function setInput(value: string) {
  try {
    return value
  } catch (error) {
    Logger.error('Failed to set input', error)
    throw error
  }
}

export async function handleSubmit(formData: FormData) {
  try {
    const message = formData.get('message')?.toString() || ''
    const attachments = JSON.parse(formData.get('attachments')?.toString() || '[]')
    
    Logger.debug('Handling submit with message', { message, attachments })
    
    return {
      id: nanoid(),
      content: message,
      role: 'assistant',
      createdAt: new Date(),
      attachments,
      isIntermediate: true,
      status: 'thinking'
    }
  } catch (error) {
    Logger.error('Failed to handle submit', error)
    throw error
  }
}

export async function stop() {
  try {
    return true
  } catch (error) {
    Logger.error('Failed to stop', error)
    throw error
  }
}

export async function setAttachments(value: any[]) {
  try {
    Logger.debug('Setting attachments', value)
    return value
  } catch (error) {
    Logger.error('Failed to set attachments', error)
    throw error
  }
}

export async function setMessages(value: Message[]) {
  try {
    Logger.debug('Setting messages', value)
    return value.map(msg => ({
      ...msg,
      isIntermediate: false,
      status: msg.status || 'complete'
    }))
  } catch (error) {
    Logger.error('Failed to set messages', error)
    throw error
  }
}

export async function append(message: Message) {
  try {
    Logger.debug('Appending message', message)
    return {
      ...message,
      id: message.id || nanoid(),
      createdAt: message.createdAt || new Date(),
      isIntermediate: message.isIntermediate || false,
      status: message.status || 'complete'
    }
  } catch (error) {
    Logger.error('Failed to append message', error)
    throw error
  }
} 