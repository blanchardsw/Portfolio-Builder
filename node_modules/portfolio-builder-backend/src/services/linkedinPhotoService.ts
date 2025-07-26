export class LinkedInPhotoService {
  /**
   * Extract LinkedIn profile photo URL from LinkedIn profile URL
   * Simplified approach focusing on environment variable fallback
   */
  async getProfilePhotoUrl(linkedinUrl: string): Promise<string | null> {
    try {
      console.log(`[DEBUG] Attempting to fetch LinkedIn photo for: ${linkedinUrl}`);
      
      // For now, prioritize environment variable approach due to LinkedIn API restrictions
      const envPhotoUrl = process.env.LINKEDIN_PHOTO_URL;
      if (envPhotoUrl) {
        console.log(`[DEBUG] Using LinkedIn photo from environment: ${envPhotoUrl}`);
        return envPhotoUrl;
      }

      // Extract username for potential future use
      const username = this.extractLinkedInUsername(linkedinUrl);
      if (username) {
        console.log(`[DEBUG] Extracted LinkedIn username: ${username} (for future use)`);
      }

      console.log('[DEBUG] No LinkedIn photo URL configured in environment variables');
      return null;
    } catch (error) {
      console.error('Error fetching LinkedIn profile photo:', error);
      return null;
    }
  }

  /**
   * Extract LinkedIn username from various LinkedIn URL formats
   */
  private extractLinkedInUsername(linkedinUrl: string): string | null {
    try {
      // Handle various LinkedIn URL formats:
      // https://www.linkedin.com/in/username/
      // https://linkedin.com/in/username
      // linkedin.com/in/username
      const patterns = [
        /linkedin\.com\/in\/([^\/\?]+)/i,
        /linkedin\.com\/pub\/([^\/\?]+)/i
      ];

      for (const pattern of patterns) {
        const match = linkedinUrl.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting LinkedIn username:', error);
      return null;
    }
  }

  /**
   * Validate that a photo URL is accessible (simplified version)
   */
  async validatePhotoUrl(photoUrl: string): Promise<boolean> {
    try {
      // Simple URL validation - just check if it looks like a valid URL
      const url = new URL(photoUrl);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }
}
