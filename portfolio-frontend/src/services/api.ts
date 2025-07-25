import { Portfolio } from '../types/portfolio';

// Hardcoded to fix Netlify deployment issue - change back to env var later if needed
const API_BASE_URL = 'https://portfolio-builder-production-3a0c.up.railway.app/api';

class PortfolioAPI {
  async getPortfolio(): Promise<Portfolio> {
    const response = await fetch(`${API_BASE_URL}/portfolio`);
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    return response.json();
  }

  async uploadResume(file: File): Promise<{ portfolio: Portfolio; message: string }> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/upload/resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload resume');
    }

    return response.json();
  }

  async getPersonalInfo() {
    const response = await fetch(`${API_BASE_URL}/portfolio/personal`);
    if (!response.ok) {
      throw new Error('Failed to fetch personal info');
    }
    return response.json();
  }

  async getWorkExperience() {
    const response = await fetch(`${API_BASE_URL}/portfolio/experience`);
    if (!response.ok) {
      throw new Error('Failed to fetch work experience');
    }
    return response.json();
  }

  async getEducation() {
    const response = await fetch(`${API_BASE_URL}/portfolio/education`);
    if (!response.ok) {
      throw new Error('Failed to fetch education');
    }
    return response.json();
  }

  async getSkills() {
    const response = await fetch(`${API_BASE_URL}/portfolio/skills`);
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }
    return response.json();
  }

  async updatePersonalInfo(personalInfo: any) {
    const response = await fetch(`${API_BASE_URL}/portfolio/personal`, {
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

export const portfolioApi = new PortfolioAPI();
