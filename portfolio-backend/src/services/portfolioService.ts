import * as fs from 'fs';
import * as path from 'path';
import { Portfolio, ParsedResumeData } from '../types/portfolio';
import { LinkedInPhotoService } from './linkedinPhotoService';

export class PortfolioService {
  private dataPath = path.join(__dirname, '../../data/portfolio.json');
  private linkedinPhotoService: LinkedInPhotoService;

  constructor() {
    this.ensureDataDirectory();
    this.linkedinPhotoService = new LinkedInPhotoService();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  async getPortfolio(): Promise<Portfolio | null> {
    try {
      if (!fs.existsSync(this.dataPath)) {
        return null;
      }
      
      const data = fs.readFileSync(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading portfolio data:', error);
      return null;
    }
  }

  async updatePortfolioFromResume(parsedData: ParsedResumeData): Promise<Portfolio> {
    const existingPortfolio = await this.getPortfolio();
    
    // Get LinkedIn URL and fetch profile photo
    const linkedinUrl = parsedData.personalInfo.linkedin || existingPortfolio?.personalInfo.linkedin || process.env.LINKEDIN_URL;
    let profilePhoto = existingPortfolio?.personalInfo.profilePhoto;
    
    if (linkedinUrl) {
      try {
        const photoUrl = await this.linkedinPhotoService.getProfilePhotoUrl(linkedinUrl);
        if (photoUrl) {
          profilePhoto = photoUrl;
        }
      } catch (error) {
        console.warn('Failed to fetch LinkedIn profile photo:', error);
      }
    }
    
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
      fs.writeFileSync(this.dataPath, JSON.stringify(portfolio, null, 2));
    } catch (error) {
      console.error('Error saving portfolio data:', error);
      throw new Error('Failed to save portfolio data');
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
