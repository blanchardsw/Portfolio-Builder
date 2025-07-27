import { Portfolio } from '../types/portfolio';
import { apiCache } from '../utils/apiCache';

/**
 * Get the base URL for API requests. Falls back to localhost if environment variable is not set.
 * This allows for different API endpoints in development, staging, and production.
 * Reading from process.env at call time makes it testable when environment variables change.
 */
const getApiBaseUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Portfolio API service class that handles all HTTP requests to the backend.
 * Implements caching to improve performance and reduce unnecessary network requests.
 * 
 * @class PortfolioAPI
 * @description Provides methods for fetching portfolio data and uploading resume files
 */
class PortfolioAPI {
  /**
   * Fetches portfolio data from the backend API with intelligent caching.
   * 
   * This method implements a cache-first strategy:
   * 1. First checks if valid cached data exists (within 5-minute TTL)
   * 2. If cached data is found, returns it immediately (much faster)
   * 3. If no cached data, makes HTTP request to backend
   * 4. Caches the fresh data for subsequent requests
   * 
   * @returns {Promise<Portfolio>} Complete portfolio data including personal info, 
   *                               work experience, education, skills, and projects
   * @throws {Error} When the API request fails or returns non-200 status
   * 
   * @example
   * ```typescript
   * const portfolio = await portfolioApi.getPortfolio();
   * console.log(portfolio.personalInfo.name);
   * ```
   */
  async getPortfolio(): Promise<Portfolio> {
    const cacheKey = 'portfolio-data';
    
    // Try to get from cache first - this avoids unnecessary network requests
    // and provides much faster response times for repeated calls
    const cachedData = apiCache.get<Portfolio>(cacheKey);
    if (cachedData) {
      console.log('📦 Portfolio loaded from cache');
      return cachedData;
    }
    
    // Cache miss - fetch fresh data from the backend API
    console.log('🌐 Fetching portfolio from API');
    const response = await fetch(`${getApiBaseUrl()}/api/portfolio`);
    
    // Handle HTTP errors (4xx, 5xx status codes)
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    
    const data = await response.json();
    
    // Cache the result for 5 minutes to improve performance for subsequent requests
    // This TTL balances performance with data freshness
    apiCache.set(cacheKey, data, 5 * 60 * 1000);
    
    return data;
  }

  /**
   * Uploads a resume file to the backend for parsing and portfolio generation.
   * 
   * This method handles the complete upload workflow:
   * 1. Creates FormData with the resume file
   * 2. Sends multipart/form-data POST request to backend
   * 3. Backend performs security scanning and parsing
   * 4. Returns updated portfolio data
   * 5. Invalidates cached portfolio data to ensure freshness
   * 
   * The backend will:
   * - Validate file type and size
   * - Scan for security threats
   * - Parse resume content (PDF, DOCX, DOC, TXT)
   * - Extract personal info, work experience, education, skills
   * - Generate updated portfolio JSON
   * 
   * @param {File} file - Resume file to upload (PDF, DOCX, DOC, or TXT)
   * @returns {Promise<{portfolio: Portfolio, message: string}>} Updated portfolio data and success message
   * @throws {Error} When upload fails due to file validation, security issues, or parsing errors
   * 
   * @example
   * ```typescript
   * const fileInput = document.getElementById('resume') as HTMLInputElement;
   * const file = fileInput.files[0];
   * try {
   *   const result = await portfolioApi.uploadResume(file);
   *   console.log('Upload successful:', result.message);
   *   // result.portfolio contains the updated portfolio data
   * } catch (error) {
   *   console.error('Upload failed:', error.message);
   * }
   * ```
   */
  async uploadResume(file: File): Promise<{ portfolio: Portfolio; message: string }> {
    // Create FormData for multipart file upload
    // This is required for file uploads in web browsers
    const formData = new FormData();
    formData.append('resume', file);

    // Send POST request with file data to backend upload endpoint
    const response = await fetch(`${getApiBaseUrl()}/api/upload/resume`, {
      method: 'POST',
      body: formData, // Browser automatically sets Content-Type: multipart/form-data
    });

    // Handle HTTP errors and extract error details from response
    if (!response.ok) {
      let errorMessage = 'Failed to upload resume';
      
      try {
        const errorData = await response.json();
        // Extract the specific error message from the response
        errorMessage = errorData.error || errorData.message || 'Failed to upload resume';
      } catch (jsonError) {
        // If JSON parsing fails, use generic error message
        errorMessage = 'Failed to upload resume';
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // IMPORTANT: Invalidate cached portfolio data since it's now outdated
    // This ensures the next getPortfolio() call fetches fresh data
    apiCache.invalidate('portfolio-data');
    console.log('🗑️ Portfolio cache invalidated after upload');
    
    return result;
  }

  async getPersonalInfo() {
    const response = await fetch(`${getApiBaseUrl()}/portfolio/personal`);
    if (!response.ok) {
      throw new Error('Failed to fetch personal info');
    }
    return response.json();
  }

  async getWorkExperience() {
    const response = await fetch(`${getApiBaseUrl()}/portfolio/experience`);
    if (!response.ok) {
      throw new Error('Failed to fetch work experience');
    }
    return response.json();
  }

  async getEducation() {
    const response = await fetch(`${getApiBaseUrl()}/portfolio/education`);
    if (!response.ok) {
      throw new Error('Failed to fetch education');
    }
    return response.json();
  }

  async getSkills() {
    const response = await fetch(`${getApiBaseUrl()}/portfolio/skills`);
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }
    return response.json();
  }

  async updatePersonalInfo(personalInfo: any) {
    const response = await fetch(`${getApiBaseUrl()}/api/personal-info`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personalInfo),
    });

    if (!response.ok) {
      throw new Error('Failed to update personal info');
    }

    return response.json();
  }
}

// Export both the class (for testing) and the singleton instance (for application use)
export { PortfolioAPI };
export const portfolioApi = new PortfolioAPI();
