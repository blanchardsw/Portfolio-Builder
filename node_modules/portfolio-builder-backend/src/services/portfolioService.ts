import * as fs from 'fs';
import { promises as fsAsync } from 'fs';
import * as path from 'path';
import { Portfolio, ParsedResumeData } from '../types/portfolio';
import { IPortfolioService } from '../interfaces/services';
import { FileProcessingError, NotFoundError, InternalServerError } from '../errors/customErrors';

/**
 * Portfolio service implementing the IPortfolioService interface.
 * 
 * This service is the core business logic layer for portfolio data management.
 * It implements several important patterns and practices:
 * 
 * **Dependency Injection**: Constructor accepts dependencies for better testability
 * **Interface Implementation**: Follows IPortfolioService contract for consistency
 * **Error Handling**: Uses custom error classes for structured error management
 * **Data Validation**: Runtime validation of portfolio structure integrity
 * **Backup System**: Creates backups before data modifications
 * **Async Operations**: Non-blocking file I/O for better performance
 * **Environment Integration**: Fallbacks to environment variables for missing data
 * 
 * Key responsibilities:
 * - Reading and writing portfolio JSON data
 * - Parsing and integrating resume data
 * - Validating data structure and content
 * - Managing LinkedIn profile photo integration
 * - Creating data backups for safety
 * - Handling errors gracefully with proper logging
 * 
 * @implements {IPortfolioService}
 */
export class PortfolioService implements IPortfolioService {
  /** Absolute path to the portfolio JSON data file */
  private readonly dataPath: string;

  /**
   * Creates a new PortfolioService instance with dependency injection.
   * 
   * The constructor uses dependency injection to allow for:
   * - Easy unit testing with mock dependencies
   * - Flexible configuration of data storage location
   * - Swappable LinkedIn photo service implementations
   * 
   * @param {string} [dataPath] - Path to portfolio JSON file (defaults to ../../data/portfolio.json)
   * 
   * @example
   * ```typescript
   * // Default configuration
   * const service = new PortfolioService();
   * 
   * // Custom data path for testing
   * const testService = new PortfolioService('/tmp/test-portfolio.json');
   * 
   * // Custom data path for testing
   * const testService = new PortfolioService('/tmp/test-portfolio.json');
   * ```
   */
  constructor(
    dataPath: string = path.join(__dirname, '../../data/portfolio.json')
  ) {
    this.dataPath = dataPath;
    this.ensureDataDirectory();
  }



  private ensureDataDirectory(): void {
    try {
      const dataDir = path.dirname(this.dataPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch (error) {
      throw new InternalServerError('Failed to create data directory', {
        dataPath: this.dataPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Retrieves the complete portfolio data from the JSON file with validation.
   * 
   * This method implements several safety measures:
   * 1. Uses async file I/O to prevent blocking the event loop
   * 2. Handles file not found gracefully (returns null for new portfolios)
   * 3. Validates the JSON structure to ensure data integrity
   * 4. Throws structured errors for debugging and error handling
   * 
   * The validation ensures the portfolio has all required fields and proper structure,
   * preventing runtime errors when the data is used by other parts of the application.
   * 
   * @returns {Promise<Portfolio | null>} Complete portfolio data, or null if file doesn't exist
   * @throws {InternalServerError} When file exists but cannot be read or parsed
   * @throws {ValidationError} When portfolio structure is invalid (thrown by validatePortfolioStructure)
   * 
   * @example
   * ```typescript
   * const portfolio = await portfolioService.getPortfolio();
   * if (portfolio) {
   *   console.log(`Portfolio for ${portfolio.personalInfo.name}`);
   *   console.log(`${portfolio.workExperience.length} jobs listed`);
   * } else {
   *   console.log('No portfolio found - this is a new user');
   * }
   * ```
   */
  async getPortfolio(): Promise<Portfolio | null> {
    try {
      // Use async file reading to avoid blocking the Node.js event loop
      // This is crucial for server performance under load
      const data = await fsAsync.readFile(this.dataPath, 'utf-8');
      
      // Parse JSON and cast to Portfolio type for TypeScript safety
      const portfolio = JSON.parse(data) as Portfolio;
      
      // Validate structure to catch data corruption or schema changes early
      this.validatePortfolioStructure(portfolio);
      
      return portfolio;
    } catch (error: any) {
      // Handle file not found gracefully - this is expected for new users
      if (error.code === 'ENOENT') {
        return null;
      }
      
      if (error instanceof FileProcessingError) {
        throw error; // Re-throw our custom errors
      }
      
      throw new InternalServerError('Failed to read portfolio data', {
        dataPath: this.dataPath,
        error: error.message || 'Unknown error'
      });
    }
  }

  private validatePortfolioStructure(portfolio: any): asserts portfolio is Portfolio {
    if (!portfolio || typeof portfolio !== 'object') {
      throw new Error('Portfolio must be an object');
    }
    
    if (!portfolio.personalInfo || typeof portfolio.personalInfo !== 'object') {
      throw new Error('Portfolio must have personalInfo object');
    }
    
    if (!Array.isArray(portfolio.workExperience)) {
      throw new Error('Portfolio must have workExperience array');
    }
    
    if (!Array.isArray(portfolio.education)) {
      throw new Error('Portfolio must have education array');
    }
    
    if (!Array.isArray(portfolio.skills)) {
      throw new Error('Portfolio must have skills array');
    }
    
    if (!Array.isArray(portfolio.projects)) {
      throw new Error('Portfolio must have projects array');
    }
  }

  async updatePortfolioFromResume(parsedData: ParsedResumeData): Promise<Portfolio> {
    const existingPortfolio = await this.getPortfolio();
    
    // Get LinkedIn URL and fetch profile photo
    const linkedinUrl = parsedData.personalInfo.linkedin || existingPortfolio?.personalInfo.linkedin || process.env.LINKEDIN_URL;
    // Use profile photo from environment variable or existing portfolio
    let profilePhoto = process.env.LINKEDIN_PHOTO_URL || existingPortfolio?.personalInfo.profilePhoto;
    
    const portfolio: Portfolio = {
      personalInfo: {
        name: parsedData.personalInfo.name || existingPortfolio?.personalInfo.name || '',
        email: parsedData.personalInfo.email || existingPortfolio?.personalInfo.email || '',
        phone: parsedData.personalInfo.phone || existingPortfolio?.personalInfo.phone,
        location: parsedData.personalInfo.location || existingPortfolio?.personalInfo.location,
        linkedin: linkedinUrl,
        github: parsedData.personalInfo.github || existingPortfolio?.personalInfo.github || process.env.GITHUB_URL,
        website: parsedData.personalInfo.website || existingPortfolio?.personalInfo.website,
        summary: parsedData.personalInfo.summary || existingPortfolio?.personalInfo.summary,
        profilePhoto: profilePhoto
      },
      workExperience: parsedData.workExperience.map((exp, index) => ({
        id: exp.id || `exp_${index + 1}`,
        company: exp.company || '',
        position: exp.position || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate,
        current: exp.current || false,
        description: exp.description || [],
        technologies: exp.technologies || [],
        location: exp.location,
        website: exp.website
      })),
      education: parsedData.education.map((edu, index) => ({
        id: edu.id || `edu_${index + 1}`,
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate,
        gpa: edu.gpa,
        honors: edu.honors || [],
        coursework: edu.coursework || [],
        website: edu.website
      })),
      skills: parsedData.skills.map(skill => ({
        name: skill.name || '',
        category: skill.category || 'technical',
        level: skill.level
      })),
      projects: parsedData.projects.map((proj, index) => ({
        id: proj.id || `proj_${index + 1}`,
        name: proj.name || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        url: proj.url,
        github: proj.github,
        startDate: proj.startDate,
        endDate: proj.endDate
      })),
      lastUpdated: new Date().toISOString()
    };

    await this.savePortfolio(portfolio);
    return portfolio;
  }

  async savePortfolio(portfolio: Portfolio): Promise<void> {
    try {
      // Validate portfolio structure before saving
      this.validatePortfolioStructure(portfolio);
      
      // Ensure data directory exists
      this.ensureDataDirectory();
      
      // Create backup of existing file if it exists
      await this.createBackupIfExists();
      
      // Save the portfolio with proper formatting
      const portfolioData = JSON.stringify(portfolio, null, 2);
      await fsAsync.writeFile(this.dataPath, portfolioData, 'utf-8');
      
      console.log(`✅ Portfolio saved successfully to ${this.dataPath}`);
    } catch (error) {
      if (error instanceof FileProcessingError || error instanceof InternalServerError) {
        throw error; // Re-throw our custom errors
      }
      
      throw new InternalServerError('Failed to save portfolio data', {
        dataPath: this.dataPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async createBackupIfExists(): Promise<void> {
    try {
      await fsAsync.access(this.dataPath);
      // File exists, create backup
      const backupPath = `${this.dataPath}.backup`;
      await fsAsync.copyFile(this.dataPath, backupPath);
      console.log(`📄 Created backup at ${backupPath}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        // File exists but we couldn't create backup - log warning but continue
        console.warn('⚠️ Could not create backup file:', error.message);
      }
      // If file doesn't exist (ENOENT), that's fine - no backup needed
    }
  }

  async updatePortfolio(updates: Partial<Portfolio>): Promise<Portfolio> {
    const existingPortfolio = await this.getPortfolio();
    
    const updatedPortfolio: Portfolio = {
      ...existingPortfolio,
      ...updates,
      lastUpdated: new Date().toISOString()
    } as Portfolio;

    await this.savePortfolio(updatedPortfolio);
    return updatedPortfolio;
  }
}
