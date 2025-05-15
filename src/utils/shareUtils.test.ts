import { 
  encodeMixToString, 
  decodeStringToMix, 
  generateShareableUrl, 
  shareMix 
} from './shareUtils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ShareUtils', () => {
  const mockMix = {
    id: 'mix_123456789',
    name: 'Test Mix',
    sounds: [
      { soundId: 'sound1', volume: 0.5, enabled: true },
      { soundId: 'sound2', volume: 0.7, enabled: false },
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  describe('encodeMixToString', () => {
    it('should encode a mix into a base64 string', () => {
      const encoded = encodeMixToString(mockMix);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
      // Check that it's URL-safe base64 (no +, /, or = characters)
      expect(encoded).not.toMatch(/[+/=]/);
    });
  });

  describe('decodeStringToMix', () => {
    it('should decode a string back into a mix', () => {
      const encoded = encodeMixToString(mockMix);
      const decoded = decodeStringToMix(encoded);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.name).toBe(mockMix.name);
      expect(decoded?.sounds).toHaveLength(mockMix.sounds.length);
      expect(decoded?.sounds[0].soundId).toBe(mockMix.sounds[0].soundId);
      expect(decoded?.sounds[0].volume).toBe(mockMix.sounds[0].volume);
      expect(decoded?.sounds[0].enabled).toBe(mockMix.sounds[0].enabled);
    });

    it('should return null for invalid encoded string', () => {
      // Mock console.error to prevent output in test
      const originalConsoleError = console.error;
      console.error = vi.fn();
      
      // Instead of testing with invalid JSON, we'll create a valid Base64 string with
      // a proper JSON object, but with invalid structure (sounds is string not array)
      const validJson = '{"name":"test","sounds":"not-an-array"}';
      const invalidStructure = btoa(validJson);
      
      // When we decode this, it should return null due to validation
      const decoded = decodeStringToMix(invalidStructure);
      
      // Verify null was returned
      expect(decoded).toBeNull();
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('generateShareableUrl', () => {
    beforeEach(() => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://example.com',
        },
        writable: true,
      });
    });

    it('should generate a proper URL with the encoded mix', () => {
      const url = generateShareableUrl(mockMix);
      const encoded = encodeMixToString(mockMix);
      
      expect(url).toBe(`https://example.com?mix=${encoded}`);
      expect(url).toContain(encoded);
    });
  });

  describe('shareMix', () => {
    beforeEach(() => {
      vi.spyOn(navigator, 'share').mockImplementation(() => Promise.resolve());
      vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());
    });

    it('should use Web Share API when available', async () => {
      const result = await shareMix(mockMix);
      
      expect(navigator.share).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should fall back to clipboard when Web Share API fails', async () => {
      // Mock share to reject
      vi.spyOn(navigator, 'share').mockImplementationOnce(() => 
        Promise.reject(new Error('Share failed'))
      );
      
      // Mock clipboard.writeText to resolve immediately
      vi.spyOn(navigator.clipboard, 'writeText').mockImplementationOnce(() => 
        Promise.resolve()
      );
      
      const result = await shareMix(mockMix);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toContain('clipboard');
    });
  });
});