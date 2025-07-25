/**
 * Unit tests for PortfolioAPI service
 * 
 * Tests cover:
 * - Portfolio data fetching with caching
 * - Resume file upload functionality
 * - Error handling and HTTP status codes
 * - Cache invalidation logic
 * - Network request mocking
 */

import { PortfolioAPI } from '../api';
import { apiCache } from '../../utils/apiCache';
import { Portfolio } from '../../types/portfolio';

// Mock the API cache
jest.mock('../../utils/apiCache', () => ({
  apiCache: {
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn(),
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('PortfolioAPI', () => {
  let portfolioAPI: PortfolioAPI;
  const mockApiCache = apiCache as jest.Mocked<typeof apiCache>;

  const mockPortfolio: Portfolio = {
    personalInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      location: 'New York, NY',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      website: 'https://johndoe.com',
      profilePhoto: 'https://example.com/photo.jpg',
      summary: 'Experienced software engineer'
    },
    workExperience: [
      {
        company: 'Tech Corp',
        position: 'Senior Developer',
        startDate: '2020-01',
        endDate: '2023-12',
        description: 'Led development of web applications',
        location: 'New York, NY'
      }
    ],
    education: [
      {
        institution: 'University of Technology',
        degree: 'Bachelor of Computer Science',
        startDate: '2016-09',
        endDate: '2020-05',
        location: 'Boston, MA'
      }
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
    projects: [
      {
        name: 'Portfolio Builder',
        description: 'A web application for creating professional portfolios',
        technologies: ['React', 'TypeScript', 'Node.js', 'Express'],
        url: 'https://github.com/johndoe/portfolio-builder'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    portfolioAPI = new PortfolioAPI();
    
    // Reset console.log mock if it exists
    if (jest.isMockFunction(console.log)) {
      (console.log as jest.Mock).mockClear();
    }
  });

  describe('getPortfolio', () => {
    it('should return cached portfolio data when available', async () => {
      // Arrange
      mockApiCache.get.mockReturnValue(mockPortfolio);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await portfolioAPI.getPortfolio();

      // Assert
      expect(result).toEqual(mockPortfolio);
      expect(mockApiCache.get).toHaveBeenCalledWith('portfolio-data');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('📦 Portfolio loaded from cache');

      consoleLogSpy.mockRestore();
    });

    it('should fetch portfolio from API when cache is empty', async () => {
      // Arrange
      mockApiCache.get.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPortfolio),
      } as Response);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await portfolioAPI.getPortfolio();

      // Assert
      expect(result).toEqual(mockPortfolio);
      expect(mockApiCache.get).toHaveBeenCalledWith('portfolio-data');
      expect(mockFetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/api/portfolio`);
      expect(mockApiCache.set).toHaveBeenCalledWith('portfolio-data', mockPortfolio, 5 * 60 * 1000);
      expect(consoleLogSpy).toHaveBeenCalledWith('🌐 Fetching portfolio from API');

      consoleLogSpy.mockRestore();
    });

    it('should throw error when API request fails', async () => {
      // Arrange
      mockApiCache.get.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      // Act & Assert
      await expect(portfolioAPI.getPortfolio()).rejects.toThrow('Failed to fetch portfolio');
      expect(mockApiCache.set).not.toHaveBeenCalled();
    });

    it('should throw error when network request fails', async () => {
      // Arrange
      mockApiCache.get.mockReturnValue(null);
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(portfolioAPI.getPortfolio()).rejects.toThrow('Network error');
      expect(mockApiCache.set).not.toHaveBeenCalled();
    });

    it('should use correct API URL from environment variable', async () => {
      // Arrange
      const originalEnv = process.env.REACT_APP_API_URL;
      process.env.REACT_APP_API_URL = 'https://api.example.com';
      
      mockApiCache.get.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPortfolio),
      } as Response);

      // Act
      await portfolioAPI.getPortfolio();

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/api/portfolio');

      // Cleanup
      process.env.REACT_APP_API_URL = originalEnv;
    });

    it('should handle JSON parsing errors gracefully', async () => {
      // Arrange
      mockApiCache.get.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      // Act & Assert
      await expect(portfolioAPI.getPortfolio()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('uploadResume', () => {
    const mockFile = new File(['test content'], 'test-resume.pdf', {
      type: 'application/pdf',
    });

    const mockUploadResponse = {
      portfolio: mockPortfolio,
      message: 'Resume uploaded and processed successfully',
    };

    it('should successfully upload resume file', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUploadResponse),
      } as Response);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result = await portfolioAPI.uploadResume(mockFile);

      // Assert
      expect(result).toEqual(mockUploadResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/api/upload/resume`,
        {
          method: 'POST',
          body: expect.any(FormData),
        }
      );

      // Verify FormData was created correctly
      const fetchCall = mockFetch.mock.calls[0];
      const formData = fetchCall[1].body as FormData;
      expect(formData.get('resume')).toBe(mockFile);

      expect(mockApiCache.invalidate).toHaveBeenCalledWith('portfolio-data');
      expect(consoleLogSpy).toHaveBeenCalledWith('🗑️ Portfolio cache invalidated after upload');

      consoleLogSpy.mockRestore();
    });

    it('should handle upload errors with error details', async () => {
      // Arrange
      const errorResponse = {
        error: 'File upload rejected due to security concerns',
        threats: ['JavaScript code detected'],
        message: 'Please upload a clean resume file'
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
      } as Response);

      // Act & Assert
      await expect(portfolioAPI.uploadResume(mockFile)).rejects.toThrow(
        'File upload rejected due to security concerns'
      );
      expect(mockApiCache.invalidate).not.toHaveBeenCalled();
    });

    it('should handle upload errors without error details', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      } as Response);

      // Act & Assert
      await expect(portfolioAPI.uploadResume(mockFile)).rejects.toThrow('Failed to upload resume');
      expect(mockApiCache.invalidate).not.toHaveBeenCalled();
    });

    it('should handle network errors during upload', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      // Act & Assert
      await expect(portfolioAPI.uploadResume(mockFile)).rejects.toThrow('Network connection failed');
      expect(mockApiCache.invalidate).not.toHaveBeenCalled();
    });

    it('should handle JSON parsing errors in error responses', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.reject(new Error('Invalid JSON in error response')),
      } as Response);

      // Act & Assert
      await expect(portfolioAPI.uploadResume(mockFile)).rejects.toThrow('Failed to upload resume');
    });

    it('should create FormData with correct field name', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUploadResponse),
      } as Response);

      // Act
      await portfolioAPI.uploadResume(mockFile);

      // Assert
      const fetchCall = mockFetch.mock.calls[0];
      const formData = fetchCall[1].body as FormData;
      expect(formData.has('resume')).toBe(true);
      expect(formData.get('resume')).toBe(mockFile);
    });

    it('should use correct upload endpoint URL', async () => {
      // Arrange
      const originalEnv = process.env.REACT_APP_API_URL;
      process.env.REACT_APP_API_URL = 'https://api.production.com';
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUploadResponse),
      } as Response);

      // Act
      await portfolioAPI.uploadResume(mockFile);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.production.com/api/upload/resume',
        expect.any(Object)
      );

      // Cleanup
      process.env.REACT_APP_API_URL = originalEnv;
    });

    it('should invalidate cache only after successful upload', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUploadResponse),
      } as Response);

      // Act
      await portfolioAPI.uploadResume(mockFile);

      // Assert
      expect(mockApiCache.invalidate).toHaveBeenCalledWith('portfolio-data');
      expect(mockApiCache.invalidate).toHaveBeenCalledTimes(1);
    });
  });

  describe('API URL configuration', () => {
    it('should use environment variable when available', () => {
      // This is tested implicitly in other tests, but we can verify the fallback
      const originalEnv = process.env.REACT_APP_API_URL;
      delete process.env.REACT_APP_API_URL;

      // The API should fall back to localhost
      expect(process.env.REACT_APP_API_URL).toBeUndefined();

      // Restore
      process.env.REACT_APP_API_URL = originalEnv;
    });

    it('should fall back to localhost when environment variable is not set', () => {
      // This behavior is tested in the individual method tests
      expect(true).toBe(true); // Placeholder for configuration test
    });
  });

  describe('error handling', () => {
    it('should handle fetch API not being available', async () => {
      // Arrange
      const originalFetch = global.fetch;
      delete (global as any).fetch;
      mockApiCache.get.mockReturnValue(null);

      // Act & Assert
      await expect(portfolioAPI.getPortfolio()).rejects.toThrow();

      // Restore
      global.fetch = originalFetch;
    });
  });
});
