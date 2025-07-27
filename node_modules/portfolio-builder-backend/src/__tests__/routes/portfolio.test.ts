/**
 * Integration tests for Portfolio routes
 * Tests portfolio CRUD endpoints for proper request/response handling
 */

import request from 'supertest';
import express from 'express';
import { Portfolio, SkillCategory, SkillLevel } from '../../types/portfolio';

// Mock the PortfolioService module
const mockPortfolioService = {
  getPortfolio: jest.fn(),
  updatePortfolioFromResume: jest.fn(),
  savePortfolio: jest.fn(),
  updatePortfolio: jest.fn()
};

jest.mock('../../services/portfolioService', () => {
  return {
    PortfolioService: jest.fn().mockImplementation(() => mockPortfolioService)
  };
});

// Import router after mock is set up
import { portfolioRouter } from '../../routes/portfolio';

describe('Portfolio Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create test app
    app = express();
    
    // Add JSON parsing middleware
    app.use((req, res, next) => {
      express.json()(req, res, (err) => {
        if (err instanceof SyntaxError && 'body' in err) {
          return res.status(400).json({ error: 'Invalid JSON format' });
        }
        next(err);
      });
    });
    
    // Add routes
    app.use('/portfolio', portfolioRouter);
  });

  const mockPortfolioData = {
    personalInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe'
    },
    workExperience: [
      {
        id: '1',
        company: 'Tech Corp',
        position: 'Software Engineer',
        startDate: '2022-01-01',
        endDate: '2023-12-31',
        current: false,
        description: ['Developed web applications', 'Built REST APIs'],
        technologies: ['JavaScript', 'Node.js', 'React']
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of Tech',
        degree: 'Bachelor of Computer Science',
        field: 'Computer Science',
        startDate: '2018-09-01',
        endDate: '2022-05-31',
        gpa: '3.8'
      }
    ],
    skills: [
      {
        name: 'JavaScript',
        category: 'technical' as SkillCategory,
        level: 'advanced' as SkillLevel
      },
      {
        name: 'TypeScript',
        category: 'technical' as SkillCategory,
        level: 'intermediate' as SkillLevel
      }
    ],
    projects: [
      {
        id: 'proj_1',
        name: 'Portfolio Builder',
        description: 'A web application for building portfolios',
        technologies: ['React', 'Node.js'],
        url: 'https://github.com/johndoe/portfolio-builder'
      }
    ],
    lastUpdated: '2024-01-15T10:30:00Z'
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /portfolio', () => {
    it('should return complete portfolio data', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .get('/portfolio')
        .expect(200);

      expect(response.body).toEqual(expect.objectContaining({
        personalInfo: expect.objectContaining(mockPortfolioData.personalInfo),
        workExperience: mockPortfolioData.workExperience,
        education: mockPortfolioData.education,
        skills: mockPortfolioData.skills,
        projects: mockPortfolioData.projects
      }));
    });

    it('should enhance personal info with environment variables', async () => {
      process.env.GITHUB_URL = 'https://github.com/env-user';
      process.env.LINKEDIN_URL = 'https://linkedin.com/in/env-user';
      
      const portfolioWithoutUrls = {
        ...mockPortfolioData,
        personalInfo: {
          ...mockPortfolioData.personalInfo,
          github: undefined,
          linkedin: undefined
        }
      };
      
      mockPortfolioService.getPortfolio.mockResolvedValue(portfolioWithoutUrls);
      
      const response = await request(app)
        .get('/portfolio')
        .expect(200);

      expect(response.body.personalInfo.github).toBe('https://github.com/env-user');
      expect(response.body.personalInfo.linkedin).toBe('https://linkedin.com/in/env-user');
    });

    it('should return 404 when no portfolio data exists', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/portfolio')
        .expect(404);

      expect(response.body).toEqual({
        error: 'No portfolio data found',
        message: 'Please upload a resume to populate your portfolio'
      });
    });

    it('should handle service errors', async () => {
      mockPortfolioService.getPortfolio.mockRejectedValue(new Error('Service error'));
      
      const response = await request(app)
        .get('/portfolio')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to fetch portfolio data'
      });
    });
  });

  describe('GET /portfolio/personal', () => {
    it('should return personal information only', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .get('/portfolio/personal')
        .expect(200);

      expect(response.body).toEqual(mockPortfolioData.personalInfo);
    });

    it('should return 404 when no portfolio data exists', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/portfolio/personal')
        .expect(404);

      expect(response.body).toEqual({
        error: 'No portfolio data found'
      });
    });
  });

  describe('GET /portfolio/experience', () => {
    it('should return work experience only', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .get('/portfolio/experience')
        .expect(200);

      expect(response.body).toEqual(mockPortfolioData.workExperience);
    });

    it('should return 404 when no portfolio data exists', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/portfolio/experience')
        .expect(404);

      expect(response.body).toEqual({
        error: 'No portfolio data found'
      });
    });
  });

  describe('GET /portfolio/education', () => {
    it('should return education data only', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .get('/portfolio/education')
        .expect(200);

      expect(response.body).toEqual(mockPortfolioData.education);
    });

    it('should return 404 when no portfolio data exists', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/portfolio/education')
        .expect(404);

      expect(response.body).toEqual({
        error: 'No portfolio data found'
      });
    });
  });

  describe('GET /portfolio/skills', () => {
    it('should return skills data only', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .get('/portfolio/skills')
        .expect(200);

      expect(response.body).toEqual(mockPortfolioData.skills);
    });

    it('should return 404 when no portfolio data exists', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/portfolio/skills')
        .expect(404);

      expect(response.body).toEqual({
        error: 'No portfolio data found'
      });
    });
  });

  describe('GET /portfolio/projects', () => {
    it('should return projects data only', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .get('/portfolio/projects')
        .expect(200);

      expect(response.body).toEqual(mockPortfolioData.projects);
    });

    it('should return 404 when no portfolio data exists', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/portfolio/projects')
        .expect(404);

      expect(response.body).toEqual({
        error: 'No portfolio data found'
      });
    });
  });

  describe('PUT /portfolio/personal', () => {
    it('should update personal information', async () => {
      const updatedPersonalInfo = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };
      
      const updatedPortfolio = {
        ...mockPortfolioData,
        personalInfo: { ...mockPortfolioData.personalInfo, ...updatedPersonalInfo }
      };
      
      mockPortfolioService.updatePortfolio.mockResolvedValue(updatedPortfolio);
      
      const response = await request(app)
        .put('/portfolio/personal')
        .send(updatedPersonalInfo)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Personal information updated successfully',
        personalInfo: updatedPortfolio.personalInfo
      });

      expect(mockPortfolioService.updatePortfolio).toHaveBeenCalledWith({
        personalInfo: updatedPersonalInfo
      });
    });

    it('should handle service errors during update', async () => {
      mockPortfolioService.updatePortfolio.mockRejectedValue(new Error('Update failed'));
      
      const response = await request(app)
        .put('/portfolio/personal')
        .send({ name: 'Updated Name' })
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to update personal information'
      });
    });
  });

  describe('POST /portfolio/experience', () => {
    it('should add new work experience', async () => {
      const newExperience = {
        company: 'New Corp',
        position: 'Senior Developer',
        startDate: '2023-01-01',
        description: 'Leading development team'
      };

      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolioData);
      mockPortfolioService.updatePortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .post('/portfolio/experience')
        .send(newExperience)
        .expect(200);

      expect(response.body.message).toBe('Work experience added successfully');
      expect(response.body.experience).toEqual(
        expect.objectContaining({
          ...newExperience,
          id: expect.stringMatching(/^exp_\d+$/)
        })
      );
    });

    it('should return 404 when no portfolio exists for adding experience', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/portfolio/experience')
        .send({ company: 'Test Corp' })
        .expect(404);

      expect(response.body).toEqual({
        error: 'No portfolio data found'
      });
    });
  });

  describe('PUT /portfolio/experience/:id', () => {
    it('should update existing work experience', async () => {
      const updatedData = {
        position: 'Lead Software Engineer',
        description: 'Updated description'
      };

      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolioData);
      mockPortfolioService.updatePortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .put('/portfolio/experience/1')
        .send(updatedData)
        .expect(200);

      expect(response.body.message).toBe('Work experience updated successfully');
    });

    it('should return 404 for non-existent experience ID', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .put('/portfolio/experience/non-existent-id')
        .send({ position: 'Updated Position' })
        .expect(404);

      expect(response.body).toEqual({
        error: 'Work experience not found'
      });
    });

    it('should return 404 when no portfolio exists', async () => {
      mockPortfolioService.getPortfolio.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/portfolio/experience/exp_1')
        .send({ position: 'Updated Position' })
        .expect(404);

      expect(response.body).toEqual({
        error: 'No portfolio data found'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .put('/portfolio/personal')
        .set('Content-Type', 'application/json')
        .send('{invalid-json}')
        .expect(400);
    });

    it('should handle empty request bodies gracefully', async () => {
      mockPortfolioService.updatePortfolio.mockResolvedValue(mockPortfolioData);
      
      const response = await request(app)
        .put('/portfolio/personal')
        .send({})
        .expect(200);

      expect(mockPortfolioService.updatePortfolio).toHaveBeenCalledWith({
        personalInfo: {}
      });
    });
  });
});
