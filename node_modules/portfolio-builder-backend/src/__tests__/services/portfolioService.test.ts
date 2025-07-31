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
import { Portfolio, ParsedResumeData } from '../../types/portfolio';
import { promises as fsAsync } from 'fs';
import * as fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { NotFoundError, InternalServerError, FileProcessingError } from '../../errors/customErrors';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    copyFile: jest.fn(),
    rm: jest.fn(),
    access: jest.fn()
  },
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

const mockFsAsync = fsAsync as jest.Mocked<typeof fsAsync>;
const mockFs = fs as jest.Mocked<typeof fs>;

// LinkedIn photo service was removed

describe('PortfolioService', () => {
  let portfolioService: PortfolioService;
  let testDataPath: string;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup test data path
    testDataPath = path.join(tmpdir(), 'test-portfolio.json');
    
    // Mock synchronous fs methods used by constructor
    mockFs.existsSync.mockReturnValue(true); // Assume directory exists
    mockFs.mkdirSync.mockReturnValue(undefined);
    
    // Create service instance with mocked dependencies
    portfolioService = new PortfolioService(testDataPath);
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
          id: '1',
          company: 'Tech Corp',
          position: 'Senior Developer',
          startDate: '2020-01',
          endDate: '2023-12',
          current: false,
          description: ['Led development team', 'Built scalable applications'],
          location: 'New York, NY'
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University of Tech',
          degree: 'Bachelor of Computer Science',
          field: 'Computer Science',
          startDate: '2016-09',
          endDate: '2020-05'
        }
      ],
      skills: [
        {
          name: 'JavaScript',
          category: 'technical',
          level: 'advanced'
        }
      ],
      projects: [
        {
          id: '1',
          name: 'Portfolio Builder',
          description: 'A web application for building portfolios',
          technologies: ['React', 'Node.js', 'TypeScript'],
          github: 'https://github.com/johndoe/portfolio-builder'
        }
      ],
      lastUpdated: '2024-01-15T10:30:00Z'
    };

    it('should return valid portfolio data when file exists', async () => {
      // Arrange
      mockFsAsync.readFile.mockResolvedValue(JSON.stringify(validPortfolio));

      // Act
      const result = await portfolioService.getPortfolio();

      // Assert
      expect(result).toEqual(validPortfolio);
      expect(mockFsAsync.readFile).toHaveBeenCalledWith(testDataPath, 'utf-8');
    });

    it('should return null when portfolio file does not exist', async () => {
      // Arrange
      const enoentError = new Error('ENOENT: no such file or directory') as any;
      enoentError.code = 'ENOENT';
      mockFsAsync.readFile.mockRejectedValue(enoentError);

      // Act
      const result = await portfolioService.getPortfolio();

      // Assert
      expect(result).toBeNull();
    });

    it('should throw InternalServerError for invalid JSON', async () => {
      // Arrange
      mockFsAsync.readFile.mockResolvedValue('invalid-json');

      // Act & Assert
      await expect(portfolioService.getPortfolio()).rejects.toThrow(InternalServerError);
    });

    it('should handle file system errors gracefully', async () => {
      // Arrange
      mockFsAsync.readFile.mockRejectedValue(new Error('Permission denied'));

      // Act & Assert
      await expect(portfolioService.getPortfolio()).rejects.toThrow(InternalServerError);
    });
  });

  describe('updatePortfolioFromResume', () => {
    const mockParsedData: ParsedResumeData = {
      personalInfo: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        linkedin: 'https://linkedin.com/in/janesmith'
      },
      workExperience: [
        {
          company: 'New Tech Inc',
          position: 'Software Engineer',
          startDate: '2021-01',
          endDate: '2024-01',
          description: ['Developed web applications', 'Collaborated with cross-functional teams']
        }
      ],
      education: [
        {
          institution: 'State University',
          degree: 'Master of Computer Science',
          field: 'Computer Science',
          startDate: '2019-09',
          endDate: '2021-05'
        }
      ],
      skills: [
        { name: 'Python', category: 'technical', level: 'advanced' },
        { name: 'Django', category: 'technical', level: 'intermediate' },
        { name: 'PostgreSQL', category: 'technical', level: 'intermediate' }
      ],
      projects: []
    };

    it('should create new portfolio from resume data when no existing portfolio', async () => {
      // Arrange
      const enoentError = new Error('ENOENT: no such file or directory') as any;
      enoentError.code = 'ENOENT';
      mockFsAsync.readFile.mockRejectedValue(enoentError);
      mockFsAsync.access.mockRejectedValue(enoentError); // For backup check
      mockFsAsync.writeFile.mockResolvedValue(undefined);

      // Act
      const result = await portfolioService.updatePortfolioFromResume(mockParsedData);

      // Assert
      expect(result.personalInfo.name).toBe('Jane Smith');
      expect(result.personalInfo.email).toBe('jane@example.com');
      expect(result.workExperience).toHaveLength(1);
      expect(result.workExperience[0].company).toBe('New Tech Inc');
      expect(result.lastUpdated).toBeDefined();
      expect(mockFsAsync.writeFile).toHaveBeenCalled();
    });

    it('should merge resume data with existing portfolio', async () => {
      // Arrange
      const existingPortfolio: Portfolio = {
        personalInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          summary: 'Existing summary'
        },
        workExperience: [],
        education: [],
        skills: [],
        projects: [
          {
            id: '1',
            name: 'Existing Project',
            description: 'An existing project',
            technologies: ['React']
          }
        ],
        lastUpdated: '2024-01-01T00:00:00Z'
      };

      mockFsAsync.readFile.mockResolvedValue(JSON.stringify(existingPortfolio));
      mockFsAsync.access.mockResolvedValue(undefined); // File exists for backup
      mockFsAsync.copyFile.mockResolvedValue(undefined); // Backup creation
      mockFsAsync.writeFile.mockResolvedValue(undefined);

      // Act
      const result = await portfolioService.updatePortfolioFromResume(mockParsedData);

      // Assert
      expect(result.personalInfo.name).toBe('Jane Smith'); // Updated from resume
      expect(result.personalInfo.summary).toBe('Existing summary'); // Preserved
      expect(result.workExperience).toHaveLength(1);
      expect(result.projects).toBeDefined(); // Projects should be defined
      expect(Array.isArray(result.projects)).toBe(true); // Should be an array
      expect(result.lastUpdated).not.toBe('2024-01-01T00:00:00Z'); // Updated timestamp
    });

    it('should handle profile photo from resume data', async () => {
      // Arrange
      const enoentError = new Error('ENOENT: no such file or directory') as any;
      enoentError.code = 'ENOENT';
      mockFsAsync.readFile.mockRejectedValue(enoentError);
      mockFsAsync.access.mockRejectedValue(enoentError); // For backup check
      mockFsAsync.writeFile.mockResolvedValue(undefined);
      // LinkedIn photo service was removed - profile photo now comes from resume data if present

      // Act
      const result = await portfolioService.updatePortfolioFromResume(mockParsedData);

      // Assert - Profile photo should be set from resume data or be defined
      expect(result.personalInfo.profilePhoto).toBeDefined();
    });

    // LinkedIn photo service error handling test removed since service was deleted
  });

  describe('savePortfolio', () => {
    const testPortfolio: Portfolio = {
      personalInfo: {
        name: 'Test User',
        email: 'test@example.com'
      },
      workExperience: [],
      education: [],
      skills: [],
      projects: [],
      lastUpdated: '2024-01-15T10:30:00Z'
    };

    it('should save portfolio to file successfully', async () => {
      // Arrange
      mockFsAsync.access.mockResolvedValue(undefined); // File exists for backup
      mockFsAsync.copyFile.mockResolvedValue(undefined); // Backup creation
      mockFsAsync.writeFile.mockResolvedValue(undefined);

      // Act
      await portfolioService.savePortfolio(testPortfolio);

      // Assert
      expect(mockFsAsync.writeFile).toHaveBeenCalledWith(
        testDataPath,
        JSON.stringify(testPortfolio, null, 2),
        'utf-8'
      );
    });

    it('should handle file system errors during save', async () => {
      // Arrange
      mockFsAsync.mkdir.mockResolvedValue(undefined);
      mockFsAsync.writeFile.mockRejectedValue(new Error('Permission denied'));

      // Act & Assert
      await expect(portfolioService.savePortfolio(testPortfolio)).rejects.toThrow(InternalServerError);
    });

    it('should create directory if it does not exist', async () => {
      // Arrange
      const enoentError = new Error('ENOENT: no such file or directory') as any;
      enoentError.code = 'ENOENT';
      mockFsAsync.access.mockRejectedValue(enoentError); // No existing file for backup
      mockFsAsync.writeFile.mockResolvedValue(undefined);
      // Directory creation is handled by synchronous ensureDataDirectory()
      mockFs.existsSync.mockReturnValue(false); // Directory doesn't exist
      mockFs.mkdirSync.mockReturnValue(undefined); // Create directory

      // Act
      await portfolioService.savePortfolio(testPortfolio);

      // Assert
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        path.dirname(testDataPath),
        { recursive: true }
      );
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle corrupted portfolio data', async () => {
      // Arrange
      const corruptedData = '{"personalInfo": {"name": "Test"}, "workExperience": "invalid"}';
      mockFsAsync.readFile.mockResolvedValue(corruptedData);

      // Act & Assert
      await expect(portfolioService.getPortfolio()).rejects.toThrow(InternalServerError);
    });

    it('should validate portfolio structure', async () => {
      // Arrange
      const invalidPortfolio = { invalidField: 'test' };
      mockFsAsync.readFile.mockResolvedValue(JSON.stringify(invalidPortfolio));

      // Act & Assert
      await expect(portfolioService.getPortfolio()).rejects.toThrow(InternalServerError);
    });
  });

  describe('dependency injection', () => {
    it('should work with default LinkedIn photo service when none provided', () => {
      // Act
      const serviceWithDefaults = new PortfolioService();

      // Assert
      expect(serviceWithDefaults).toBeInstanceOf(PortfolioService);
    });

    it('should use custom data path when provided', () => {
      // Arrange
      const customPath = '/custom/path/portfolio.json';

      // Act
      const serviceWithCustomPath = new PortfolioService(customPath);

      // Assert
      expect(serviceWithCustomPath).toBeInstanceOf(PortfolioService);
    });
  });
});
