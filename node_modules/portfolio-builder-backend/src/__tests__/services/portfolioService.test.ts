/**
 * Unit tests for PortfolioService
 * 
 * Tests cover:
 * - Portfolio data reading and validation
 * - Resume data integration
 * - LinkedIn photo service integration
 * - Error handling and edge cases
 * - Dependency injection functionality
 */

import { PortfolioService } from '../../services/portfolioService';
import { LinkedInPhotoService } from '../../services/linkedinPhotoService';
import { ILinkedInPhotoService } from '../../interfaces/services';
import { Portfolio, ParsedResumeData } from '../../types/portfolio';
import { promises as fsAsync } from 'fs';
import path from 'path';
import { NotFoundError, InternalServerError, FileProcessingError } from '../../errors/customErrors';

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    copyFile: jest.fn(),
  },
}));

// Mock LinkedIn photo service
const mockLinkedInPhotoService: jest.Mocked<ILinkedInPhotoService> = {
  getProfilePhotoUrl: jest.fn(),
};

describe('PortfolioService', () => {
  let portfolioService: PortfolioService;
  let mockFsAsync: jest.Mocked<typeof fsAsync>;
  const testDataPath = '/test/portfolio.json';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockFsAsync = fsAsync as jest.Mocked<typeof fsAsync>;
    
    // Create service instance with mocked dependencies
    portfolioService = new PortfolioService(testDataPath, mockLinkedInPhotoService);
  });

  describe('getPortfolio', () => {
    const validPortfolio: Portfolio = {
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        location: 'New York, NY',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        website: 'https://johndoe.com',
        profilePhoto: 'https://example.com/photo.jpg',
        summary: 'Software Engineer with 5 years experience'
      },
      workExperience: [
        {
          company: 'Tech Corp',
          position: 'Senior Developer',
          startDate: '2020-01',
          endDate: '2023-12',
          description: 'Led development team',
          location: 'New York, NY'
        }
      ],
      education: [
        {
          institution: 'University of Tech',
          degree: 'Bachelor of Computer Science',
          startDate: '2016-09',
          endDate: '2020-05',
          location: 'Boston, MA'
        }
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      projects: [
        {
          name: 'Portfolio Builder',
          description: 'A web application for building portfolios',
          technologies: ['React', 'Node.js', 'TypeScript'],
          url: 'https://github.com/johndoe/portfolio-builder'
        }
      ]
    };

    it('should return valid portfolio data when file exists', async () => {
      // Arrange
      mockFsAsync.readFile.mockResolvedValue(JSON.stringify(validPortfolio));

      // Act
      const result = await portfolioService.getPortfolio();

      // Assert
      expect(result).toEqual(validPortfolio);
      expect(mockFsAsync.readFile).toHaveBeenCalledWith(testDataPath, 'utf-8');
      expect(result).toBeValidPortfolio();
    });

    it('should return null when portfolio file does not exist', async () => {
      // Arrange
      const fileNotFoundError = new Error('File not found') as NodeJS.ErrnoException;
      fileNotFoundError.code = 'ENOENT';
      mockFsAsync.readFile.mockRejectedValue(fileNotFoundError);

      // Act
      const result = await portfolioService.getPortfolio();

      // Assert
      expect(result).toBeNull();
      expect(mockFsAsync.readFile).toHaveBeenCalledWith(testDataPath, 'utf-8');
    });

    it('should throw InternalServerError when file read fails', async () => {
      // Arrange
      const readError = new Error('Permission denied');
      mockFsAsync.readFile.mockRejectedValue(readError);

      // Act & Assert
      await expect(portfolioService.getPortfolio()).rejects.toThrow(InternalServerError);
      expect(mockFsAsync.readFile).toHaveBeenCalledWith(testDataPath, 'utf-8');
    });

    it('should throw error when JSON is invalid', async () => {
      // Arrange
      mockFsAsync.readFile.mockResolvedValue('invalid json');

      // Act & Assert
      await expect(portfolioService.getPortfolio()).rejects.toThrow();
      expect(mockFsAsync.readFile).toHaveBeenCalledWith(testDataPath, 'utf-8');
    });

    it('should validate portfolio structure', async () => {
      // Arrange - Invalid portfolio missing required fields
      const invalidPortfolio = { personalInfo: { name: 'John' } };
      mockFsAsync.readFile.mockResolvedValue(JSON.stringify(invalidPortfolio));

      // Act & Assert
      await expect(portfolioService.getPortfolio()).rejects.toThrow();
    });
  });

  describe('updatePortfolioFromResume', () => {
    const mockParsedData: ParsedResumeData = {
      personalInfo: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/janesmith',
        github: 'https://github.com/janesmith',
        summary: 'Full-stack developer'
      },
      workExperience: [
        {
          company: 'StartupCo',
          position: 'Lead Developer',
          startDate: '2021-01',
          endDate: '2024-01',
          description: 'Built scalable web applications',
          location: 'San Francisco, CA'
        }
      ],
      education: [
        {
          institution: 'State University',
          degree: 'Master of Computer Science',
          startDate: '2019-09',
          endDate: '2021-05',
          location: 'San Francisco, CA'
        }
      ],
      skills: ['Python', 'Django', 'PostgreSQL'],
      projects: []
    };

    beforeEach(() => {
      // Mock successful file operations
      mockFsAsync.mkdir.mockResolvedValue(undefined);
      mockFsAsync.copyFile.mockResolvedValue(undefined);
      mockFsAsync.writeFile.mockResolvedValue(undefined);
    });

    it('should create new portfolio when none exists', async () => {
      // Arrange
      const fileNotFoundError = new Error('File not found') as NodeJS.ErrnoException;
      fileNotFoundError.code = 'ENOENT';
      mockFsAsync.readFile.mockRejectedValue(fileNotFoundError);
      mockLinkedInPhotoService.getProfilePhotoUrl.mockResolvedValue('https://linkedin.com/photo.jpg');

      // Act
      const result = await portfolioService.updatePortfolioFromResume(mockParsedData);

      // Assert
      expect(result).toBeValidPortfolio();
      expect(result.personalInfo.name).toBe('Jane Smith');
      expect(result.personalInfo.profilePhoto).toBe('https://linkedin.com/photo.jpg');
      expect(result.workExperience).toHaveLength(1);
      expect(mockFsAsync.writeFile).toHaveBeenCalled();
    });

    it('should merge with existing portfolio data', async () => {
      // Arrange
      const existingPortfolio: Portfolio = {
        personalInfo: {
          name: 'John Doe',
          email: 'john@old.com',
          phone: '+1111111111',
          location: 'Old City',
          summary: 'Old summary'
        },
        workExperience: [
          {
            company: 'OldCorp',
            position: 'Junior Dev',
            startDate: '2018-01',
            endDate: '2020-12',
            description: 'Entry level work',
            location: 'Old City'
          }
        ],
        education: [],
        skills: ['HTML', 'CSS'],
        projects: [
          {
            name: 'Old Project',
            description: 'Legacy project',
            technologies: ['jQuery'],
            url: 'https://old-project.com'
          }
        ]
      };

      mockFsAsync.readFile.mockResolvedValue(JSON.stringify(existingPortfolio));
      mockLinkedInPhotoService.getProfilePhotoUrl.mockResolvedValue('https://new-photo.jpg');

      // Act
      const result = await portfolioService.updatePortfolioFromResume(mockParsedData);

      // Assert
      expect(result.personalInfo.name).toBe('Jane Smith'); // Updated from resume
      expect(result.personalInfo.profilePhoto).toBe('https://new-photo.jpg');
      expect(result.workExperience).toHaveLength(2); // Merged both experiences
      expect(result.projects).toHaveLength(1); // Kept existing project
      expect(result.skills).toEqual(expect.arrayContaining(['HTML', 'CSS', 'Python', 'Django', 'PostgreSQL']));
    });

    it('should handle LinkedIn photo service failure gracefully', async () => {
      // Arrange
      const fileNotFoundError = new Error('File not found') as NodeJS.ErrnoException;
      fileNotFoundError.code = 'ENOENT';
      mockFsAsync.readFile.mockRejectedValue(fileNotFoundError);
      mockLinkedInPhotoService.getProfilePhotoUrl.mockRejectedValue(new Error('LinkedIn API error'));

      // Act
      const result = await portfolioService.updatePortfolioFromResume(mockParsedData);

      // Assert
      expect(result).toBeValidPortfolio();
      expect(result.personalInfo.profilePhoto).toBeUndefined();
      // Should still complete successfully despite LinkedIn error
    });

    it('should use environment variables for missing social links', async () => {
      // Arrange
      const parsedDataWithoutSocial: ParsedResumeData = {
        ...mockParsedData,
        personalInfo: {
          ...mockParsedData.personalInfo,
          linkedin: undefined,
          github: undefined
        }
      };

      const fileNotFoundError = new Error('File not found') as NodeJS.ErrnoException;
      fileNotFoundError.code = 'ENOENT';
      mockFsAsync.readFile.mockRejectedValue(fileNotFoundError);

      // Act
      const result = await portfolioService.updatePortfolioFromResume(parsedDataWithoutSocial);

      // Assert
      expect(result.personalInfo.linkedin).toBe(process.env.LINKEDIN_URL);
      expect(result.personalInfo.github).toBe(process.env.GITHUB_URL);
    });

    it('should create backup before updating', async () => {
      // Arrange
      const existingPortfolio: Portfolio = {
        personalInfo: { name: 'Test User', email: 'test@example.com' },
        workExperience: [],
        education: [],
        skills: [],
        projects: []
      };
      mockFsAsync.readFile.mockResolvedValue(JSON.stringify(existingPortfolio));

      // Act
      await portfolioService.updatePortfolioFromResume(mockParsedData);

      // Assert
      expect(mockFsAsync.copyFile).toHaveBeenCalled();
      const copyCall = mockFsAsync.copyFile.mock.calls[0];
      expect(copyCall[0]).toBe(testDataPath); // Source file
      expect(copyCall[1]).toContain('backup'); // Backup file path
    });

    it('should throw error when file write fails', async () => {
      // Arrange
      const fileNotFoundError = new Error('File not found') as NodeJS.ErrnoException;
      fileNotFoundError.code = 'ENOENT';
      mockFsAsync.readFile.mockRejectedValue(fileNotFoundError);
      mockFsAsync.writeFile.mockRejectedValue(new Error('Write permission denied'));

      // Act & Assert
      await expect(portfolioService.updatePortfolioFromResume(mockParsedData))
        .rejects.toThrow(InternalServerError);
    });
  });

  describe('dependency injection', () => {
    it('should use injected LinkedIn photo service', async () => {
      // Arrange
      const customLinkedInService: jest.Mocked<ILinkedInPhotoService> = {
        getProfilePhotoUrl: jest.fn().mockResolvedValue('https://custom-photo.jpg'),
      };

      const serviceWithCustomDependency = new PortfolioService(testDataPath, customLinkedInService);
      
      const fileNotFoundError = new Error('File not found') as NodeJS.ErrnoException;
      fileNotFoundError.code = 'ENOENT';
      mockFsAsync.readFile.mockRejectedValue(fileNotFoundError);

      const parsedDataWithLinkedIn: ParsedResumeData = {
        ...mockParsedData,
        personalInfo: {
          ...mockParsedData.personalInfo,
          linkedin: 'https://linkedin.com/in/testuser'
        }
      };

      // Act
      const result = await serviceWithCustomDependency.updatePortfolioFromResume(parsedDataWithLinkedIn);

      // Assert
      expect(customLinkedInService.getProfilePhotoUrl).toHaveBeenCalledWith('https://linkedin.com/in/testuser');
      expect(result.personalInfo.profilePhoto).toBe('https://custom-photo.jpg');
    });
  });
});
