import { describe, it, expect } from 'vitest';
import { validateMessage, validateApiKey } from '@/utils/validation';

describe('Validation Utils', () => {
  describe('validateMessage', () => {
    it('should validate correct message format', () => {
      const message = {
        role: 'user',
        content: 'Hello',
        id: '123',
      };

      expect(validateMessage(message)).toBe(true);
    });

    it('should reject invalid message format', () => {
      const message = {
        role: 'invalid',
        content: '',
      };

      expect(() => validateMessage(message)).toThrow();
    });
  });

  describe('validateApiKey', () => {
    it('should validate correct API key format', () => {
      expect(validateApiKey('sk-1234567890abcdef')).toBe(true);
    });

    it('should reject invalid API key format', () => {
      expect(validateApiKey('invalid-key')).toBe(false);
    });
  });
}); 