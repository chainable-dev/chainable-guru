import { getChatCompletion, searchFunctions } from '@/lib/openai-functions';
import { OpenAI } from 'openai';

jest.mock('openai');

describe('OpenAI Functions', () => {
  const mockMessages = [{ role: 'user', content: 'test message' }];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create chat completion without search functions when disabled', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'test response' } }]
    };

    (OpenAI as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(mockResponse)
        }
      }
    }));

    const result = await getChatCompletion(mockMessages, false);

    expect(result).toEqual(mockResponse);
    expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4-turbo-preview',
      messages: mockMessages,
      functions: undefined,
      function_call: undefined
    });
  });

  it('should include search functions when enabled', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'test response' } }]
    };

    (OpenAI as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(mockResponse)
        }
      }
    }));

    const result = await getChatCompletion(mockMessages, true);

    expect(result).toEqual(mockResponse);
    expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4-turbo-preview',
      messages: mockMessages,
      functions: searchFunctions,
      function_call: 'auto'
    });
  });
}); 