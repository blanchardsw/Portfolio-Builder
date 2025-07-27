import { LinkedInPhotoService } from '../../services/linkedinPhotoService';

describe('LinkedInPhotoService', () => {
  let linkedinPhotoService: LinkedInPhotoService;
  const originalEnv = process.env;

  beforeEach(() => {
    linkedinPhotoService = new LinkedInPhotoService();
    // Reset environment variables for each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getProfilePhotoUrl', () => {
    it('should return environment variable photo URL when set', async () => {
      const testPhotoUrl = 'https://example.com/test-photo.jpg';
      process.env.LINKEDIN_PHOTO_URL = testPhotoUrl;

      const result = await linkedinPhotoService.getProfilePhotoUrl('https://linkedin.com/in/testuser');

      expect(result).toBe(testPhotoUrl);
    });

    it('should return null when no environment variable is set', async () => {
      delete process.env.LINKEDIN_PHOTO_URL;

      const result = await linkedinPhotoService.getProfilePhotoUrl('https://linkedin.com/in/testuser');

      expect(result).toBeNull();
    });

    it('should handle various LinkedIn URL formats', async () => {
      const testPhotoUrl = 'https://example.com/photo.jpg';
      process.env.LINKEDIN_PHOTO_URL = testPhotoUrl;

      const urlFormats = [
        'https://www.linkedin.com/in/testuser/',
        'https://linkedin.com/in/testuser',
        'linkedin.com/in/testuser',
        'https://www.linkedin.com/in/test-user-123/',
        'https://linkedin.com/pub/testuser'
      ];

      for (const url of urlFormats) {
        const result = await linkedinPhotoService.getProfilePhotoUrl(url);
        expect(result).toBe(testPhotoUrl);
      }
    });

    it('should handle invalid LinkedIn URLs gracefully', async () => {
      const testPhotoUrl = 'https://example.com/photo.jpg';
      process.env.LINKEDIN_PHOTO_URL = testPhotoUrl;

      const invalidUrls = [
        'https://facebook.com/user',
        'not-a-url',
        '',
        'https://linkedin.com/invalid-path'
      ];

      for (const url of invalidUrls) {
        const result = await linkedinPhotoService.getProfilePhotoUrl(url);
        // Should still return env photo URL regardless of URL validity
        expect(result).toBe(testPhotoUrl);
      }
    });

    it('should return null for invalid URLs when no env variable set', async () => {
      delete process.env.LINKEDIN_PHOTO_URL;

      const result = await linkedinPhotoService.getProfilePhotoUrl('invalid-url');

      expect(result).toBeNull();
    });

    it('should handle empty environment variable', async () => {
      process.env.LINKEDIN_PHOTO_URL = '';

      const result = await linkedinPhotoService.getProfilePhotoUrl('https://linkedin.com/in/testuser');

      expect(result).toBeNull();
    });

    it('should handle whitespace-only environment variable', async () => {
      process.env.LINKEDIN_PHOTO_URL = '   ';

      const result = await linkedinPhotoService.getProfilePhotoUrl('https://linkedin.com/in/testuser');

      expect(result).toBe('   '); // Returns the actual env value, even if whitespace
    });
  });

  describe('extractLinkedInUsername', () => {
    it('should extract username from standard LinkedIn URLs', () => {
      const service = linkedinPhotoService as any; // Access private method for testing

      const testCases = [
        { url: 'https://www.linkedin.com/in/johndoe/', expected: 'johndoe' },
        { url: 'https://linkedin.com/in/jane-smith', expected: 'jane-smith' },
        { url: 'linkedin.com/in/test-user-123', expected: 'test-user-123' },
        { url: 'https://www.linkedin.com/pub/publicuser/', expected: 'publicuser' },
        { url: 'https://linkedin.com/pub/pub-user', expected: 'pub-user' }
      ];

      testCases.forEach(({ url, expected }) => {
        const result = service.extractLinkedInUsername(url);
        expect(result).toBe(expected);
      });
    });

    it('should return null for invalid LinkedIn URLs', () => {
      const service = linkedinPhotoService as any;

      const invalidUrls = [
        'https://facebook.com/user',
        'https://linkedin.com/company/test',
        'not-a-url',
        '',
        'https://linkedin.com/',
        'https://linkedin.com/in/',
        'https://other-site.com/in/user'
      ];

      invalidUrls.forEach(url => {
        const result = service.extractLinkedInUsername(url);
        expect(result).toBeNull();
      });
    });

    it('should handle URLs with query parameters', () => {
      const service = linkedinPhotoService as any;

      const urlsWithParams = [
        { url: 'https://linkedin.com/in/testuser?utm_source=share', expected: 'testuser' },
        { url: 'https://linkedin.com/in/user-name/?ref=profile', expected: 'user-name' },
        { url: 'https://linkedin.com/pub/pubuser?tab=summary', expected: 'pubuser' }
      ];

      urlsWithParams.forEach(({ url, expected }) => {
        const result = service.extractLinkedInUsername(url);
        expect(result).toBe(expected);
      });
    });

    it('should be case insensitive', () => {
      const service = linkedinPhotoService as any;

      const caseVariations = [
        'https://LINKEDIN.COM/in/testuser',
        'https://LinkedIn.com/IN/testuser',
        'https://linkedin.COM/In/testuser'
      ];

      caseVariations.forEach(url => {
        const result = service.extractLinkedInUsername(url);
        expect(result).toBe('testuser');
      });
    });
  });

  describe('error handling', () => {
    it('should handle exceptions gracefully and return null', async () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Ensure no environment variable is set to test actual error path
      delete process.env.LINKEDIN_PHOTO_URL;

      // Force an error by passing a malformed input that might cause issues
      const result = await linkedinPhotoService.getProfilePhotoUrl(null as any);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error extracting LinkedIn username:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
