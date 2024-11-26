import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { Message, MessageRole } from "@/types/message";
import { Logger } from './logger';

export function convertAIMessageToCustom(message: AIMessage): Message {
  Logger.debug('Converting AI message to custom format:', 'MessageUtils', message);

  try {
    const customMessage = {
      id: message.id || crypto.randomUUID(),
      role: "assistant" as const,
      content: typeof message.content === 'string' 
        ? message.content 
        : JSON.stringify(message.content),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: message.additional_kwargs?.attachments || []
    };

    Logger.debug('Successfully converted to custom message:', 'MessageUtils', customMessage);
    return customMessage;
  } catch (error) {
    Logger.error('Error converting AI message:', 'MessageUtils', { error, originalMessage: message });
    throw new Error(`Failed to convert AI message: ${error.message}`);
  }
}

export function convertCustomMessageToAI(message: Message): AIMessage | HumanMessage | SystemMessage {
  Logger.debug('Converting custom message to AI format:', 'MessageUtils', message);

  try {
    const baseProps = {
      content: message.content,
      additional_kwargs: {
        attachments: message.attachments || [],
        messageId: message.id,
        timestamp: message.createdAt
      }
    };

    let convertedMessage;
    switch (message.role) {
      case "assistant":
        convertedMessage = new AIMessage(baseProps);
        Logger.debug('Converted to AIMessage:', 'MessageUtils', convertedMessage);
        break;
      case "system":
        convertedMessage = new SystemMessage(baseProps);
        Logger.debug('Converted to SystemMessage:', 'MessageUtils', convertedMessage);
        break;
      case "user":
        convertedMessage = new HumanMessage(baseProps);
        Logger.debug('Converted to HumanMessage:', 'MessageUtils', convertedMessage);
        break;
      default:
        throw new Error(`Invalid message role: ${message.role}`);
    }

    return convertedMessage;
  } catch (error) {
    Logger.error('Error converting custom message:', 'MessageUtils', { error, originalMessage: message });
    throw new Error(`Failed to convert custom message: ${error.message}`);
  }
}

export function isValidMessageRole(role: string): role is MessageRole {
  const isValid = ["user", "assistant", "system"].includes(role);
  Logger.debug(`Validating message role: ${role}`, 'MessageUtils', { isValid });
  return isValid;
}

// Utility function to validate message structure
export function validateMessage(message: any): message is Message {
  Logger.debug('Validating message structure:', 'MessageUtils', message);

  try {
    const isValid = (
      typeof message === 'object' &&
      typeof message.id === 'string' &&
      isValidMessageRole(message.role) &&
      typeof message.content === 'string' &&
      typeof message.createdAt === 'string' &&
      typeof message.updatedAt === 'string' &&
      (!message.attachments || Array.isArray(message.attachments))
    );

    Logger.debug('Message validation result:', 'MessageUtils', { isValid });
    return isValid;
  } catch (error) {
    Logger.error('Error validating message:', 'MessageUtils', error);
    return false;
  }
}

// Helper function to format error messages
export function formatMessageError(error: Error, context: string): string {
  const errorMessage = `[Message Utils Error] ${context}: ${error.message}`;
  Logger.error(errorMessage, 'MessageUtils');
  Logger.error('Stack trace:', 'MessageUtils', error.stack);
  return errorMessage;
} 