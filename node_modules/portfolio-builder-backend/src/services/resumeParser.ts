import { ParsedResumeData, PersonalInfo, WorkExperience, Education, Skill, SkillCategory } from '../types/portfolio';
import { CompanyLookupService } from './companyLookup';
import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export class ResumeParser {
  private companyLookup: CompanyLookupService;
  
  constructor() {
    this.companyLookup = new CompanyLookupService();
  }
  
  async parseFile(filePath: string, mimeType: string): Promise<ParsedResumeData> {
    let text: string;
    
    try {
      if (mimeType === 'application/pdf') {
        text = await this.parsePDF(filePath);
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await this.parseDocx(filePath);
      } else if (mimeType === 'text/plain') {
        text = await this.parseText(filePath);
      } else {
        throw new Error('Unsupported file type');
      }
      
      return await this.extractDataFromText(text);
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw new Error('Failed to parse resume file');
    }
  }

  async parseBuffer(buffer: Buffer, mimeType: string): Promise<ParsedResumeData> {
    let text: string;
    
    try {
      if (mimeType === 'application/pdf') {
        text = await this.parsePDFBuffer(buffer);
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await this.parseDocxBuffer(buffer);
      } else if (mimeType === 'text/plain') {
        text = buffer.toString('utf-8');
      } else {
        throw new Error('Unsupported file type');
      }
      
      return await this.extractDataFromText(text);
    } catch (error) {
      console.error('Error parsing resume buffer:', error);
      throw new Error('Failed to parse resume buffer');
    }
  }

  private async parsePDF(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    return await this.parsePDFBuffer(buffer);
  }

  private async parsePDFBuffer(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }

  private async parseDocx(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    return await this.parseDocxBuffer(buffer);
  }

  private async parseDocxBuffer(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  private async parseText(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }

  private async extractDataFromText(text: string): Promise<ParsedResumeData> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log('\n=== RESUME PARSING DEBUG ===');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Total text length: ${text.length} characters`);
    console.log(`First 500 characters of text:\n${text.substring(0, 500)}`);
    
    // Write debug info to file
    const debugInfo = `=== RESUME PARSING DEBUG ===
Timestamp: ${new Date().toISOString()}
Total text length: ${text.length} characters
First 500 characters of text:

${text.substring(0, 500)}

Total lines after filtering: ${lines.length}

--- All lines ---
${lines.map((line, i) => `${i}: "${line}"`).join('\n')}

--- Calling extractWorkExperience ---`;
    
    fs.writeFileSync(path.join(__dirname, '../../debug-resume-parsing.log'), debugInfo);
    
    const personalInfo = this.extractPersonalInfo(text, lines);
    const workExperience = await this.extractWorkExperience(text, lines);
    const education = await this.extractEducation(text, lines);
    const skills = this.extractSkills(text, lines);
    
    // Add final debug info
    fs.appendFileSync(path.join(__dirname, '../../debug-resume-parsing.log'), 
      `--- extractWorkExperience returned ${workExperience.length} entries ---\n`);
    
    return {
      personalInfo,
      workExperience,
      education,
      skills,
      projects: []
    };
  }

  private extractPersonalInfo(text: string, lines: string[]): PersonalInfo {
    const personalInfo: PersonalInfo = {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: ''
    };

    // Extract name (usually first line or first non-empty line)
    if (lines.length > 0) {
      personalInfo.name = lines[0];
    }

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      personalInfo.email = emailMatch[0];
    }

    // Extract phone
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      personalInfo.phone = phoneMatch[0];
    }

    // Extract location (look for patterns like "City, State" or "City, ST zipcode")
    const locationRegex = /([A-Za-z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/;
    const locationMatch = text.match(locationRegex);
    if (locationMatch) {
      personalInfo.location = locationMatch[1];
    }

    // Extract LinkedIn
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+/;
    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch) {
      personalInfo.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
    }

    // Extract GitHub
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9-]+/;
    const githubMatch = text.match(githubRegex);
    if (githubMatch) {
      personalInfo.github = `https://${githubMatch[0]}`;
    }

    return personalInfo;
  }

  private async extractWorkExperience(text: string, lines: string[]): Promise<Partial<WorkExperience>[]> {
    console.log('\n=== WORK EXPERIENCE EXTRACTION DEBUG ===');
    console.log(`Text length: ${text.length} characters`);
    console.log(`Lines count: ${lines.length}`);
    
    const experiences: Partial<WorkExperience>[] = [];
    
    // Pattern: "Company — Job Title | Date Range"
    const jobLinePattern = /^(.+?)\s*[—–-]\s*(.+?)\s*\|\s*(.+)$/;
    
    let inExperienceSection = false;
    let currentExperience: Partial<WorkExperience> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(`[DEBUG] Line ${i}: "${line}"`);
      
      // Check if we're entering the experience section
      if (line.toUpperCase() === 'EXPERIENCE') {
        inExperienceSection = true;
        console.log('[DEBUG] ✅ Found EXPERIENCE section');
        continue;
      }
      
      // Check if we're leaving the experience section
      if (inExperienceSection && (line.toUpperCase().includes('EDUCATION') || line.toUpperCase().includes('SKILLS') || line.toUpperCase().includes('PROJECTS'))) {
        console.log('[DEBUG] 🚪 Leaving experience section');
        break;
      }
      
      if (inExperienceSection && line.length > 0) {
        // Check if this is a job line (company — title | dates)
        const jobMatch = line.match(jobLinePattern);
        if (jobMatch) {
          // Save previous experience if exists
          if (currentExperience && this.isValidWorkExperience(currentExperience)) {
            experiences.push(currentExperience);
            console.log(`[DEBUG] ✅ Added experience: ${currentExperience.position} at ${currentExperience.company}`);
          }
          
          const company = jobMatch[1].trim();
          const position = jobMatch[2].trim();
          const dateRange = jobMatch[3].trim();
          
          // Look up company website
          const companyInfo = await this.companyLookup.findCompanyWebsite(company);
          
          currentExperience = {
            id: `exp_${experiences.length + 1}`,
            company: company,
            position: position,
            description: [],
            current: dateRange.toLowerCase().includes('present') || dateRange.toLowerCase().includes('current'),
            startDate: this.parseStartDate(dateRange),
            endDate: this.parseEndDate(dateRange),
            website: companyInfo.website
          };
          
          console.log(`[DEBUG] 🎯 Parsed job: "${position}" at "${company}" (${dateRange})`);
        } else if (line.startsWith('●') || line.startsWith('•') || line.startsWith('*')) {
          // This is a bullet point description
          if (currentExperience) {
            if (!currentExperience.description) currentExperience.description = [];
            currentExperience.description.push(line.replace(/^[●•*]\s*/, '').trim());
            console.log(`[DEBUG] 📝 Added description: "${line.substring(0, 50)}..."`);
          }
        }
      }
    }
    
    // Add the last experience if valid
    if (currentExperience && this.isValidWorkExperience(currentExperience)) {
      experiences.push(currentExperience);
      console.log(`[DEBUG] ✅ Added final experience: ${currentExperience.position} at ${currentExperience.company}`);
    }
    
    console.log(`[DEBUG] 🎉 Extracted ${experiences.length} work experiences`);
    return experiences;
  }
  
  private isValidWorkExperience(exp: Partial<WorkExperience>): boolean {
    return !!(exp.company && exp.position);
  }
  
  private parseStartDate(dateRange: string): string {
    const match = dateRange.match(/(\w+\s+\d{4})/);
    return match ? match[1] : '';
  }
  
  private parseEndDate(dateRange: string): string {
    if (dateRange.toLowerCase().includes('present') || dateRange.toLowerCase().includes('current')) {
      return '';
    }
    const match = dateRange.match(/–\s*(\w+\s+\d{4})/);
    return match ? match[1] : '';
  }

  private async extractEducation(text: string, lines: string[]): Promise<Partial<Education>[]> {
    const education: Partial<Education>[] = [];
    let inEducationSection = false;
    let currentEducation: Partial<Education> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.toUpperCase() === 'EDUCATION') {
        inEducationSection = true;
        continue;
      }

      if (inEducationSection && (line.toUpperCase().includes('EXPERIENCE') || line.toUpperCase().includes('SKILLS'))) {
        break;
      }

      if (inEducationSection && line.length > 0) {
        // Look for institution and degree patterns
        const degreePattern = /(bachelor|master|phd|doctorate|associate|b\.s\.|m\.s\.|b\.a\.|m\.a\.|ph\.d\.)/i;
        // Look for date patterns like "December 2015" or just "2015"
        const monthYearPattern = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(19|20)\d{2}/i;
        const yearOnlyPattern = /\b(19|20)\d{2}\b/;

        if ((monthYearPattern.test(line) || yearOnlyPattern.test(line)) && !line.startsWith('●')) {
          // This looks like an institution line with graduation date
          if (currentEducation) {
            education.push(currentEducation);
          }

          // Extract the date as-is from the resume
          const monthYearMatch = line.match(monthYearPattern);
          const yearOnlyMatch = line.match(yearOnlyPattern);
          const dateStr = monthYearMatch ? monthYearMatch[0] : (yearOnlyMatch ? yearOnlyMatch[0] : '');
          const institutionName = line.replace(monthYearPattern, '').replace(yearOnlyPattern, '').trim();
          
          // Look up institution website
          const institutionInfo = await this.companyLookup.findCompanyWebsite(institutionName);
          
          currentEducation = {
            institution: institutionName,
            degree: '',
            field: '',
            endDate: dateStr, // Use the actual date from resume, don't invent ranges
            startDate: '', // Don't invent start dates
            gpa: '',
            website: institutionInfo.website
          };
        } else if (degreePattern.test(line) && currentEducation) {
          currentEducation.degree = line;
        } else if (line.startsWith('●') && currentEducation) {
          const bulletContent = line.replace(/^●\s*/, '').trim();
          if (degreePattern.test(bulletContent)) {
            currentEducation.degree = bulletContent;
          }
        }
      }
    }

    if (currentEducation) {
      education.push(currentEducation);
    }

    return education;
  }

  private extractSkills(text: string, lines: string[]): Partial<Skill>[] {
    const skills: Partial<Skill>[] = [];
    let inSkillsSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.toUpperCase().includes('SKILLS')) {
        inSkillsSection = true;
        continue;
      }

      if (inSkillsSection && (line.toUpperCase().includes('EXPERIENCE') || line.toUpperCase().includes('EDUCATION'))) {
        break;
      }

      if (inSkillsSection && line.length > 0) {
        // Look for skill categories with colons (these are typically bold in the original resume)
        if (line.includes(':')) {
          const [category, skillsText] = line.split(':');
          const categoryName = category.trim();
          const skillsList = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);

          skillsList.forEach((skillName, index) => {
            skills.push({
              name: skillName,
              category: categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'), // Use actual category as slug
              displayCategory: categoryName // Keep the original category name from resume
            });
          });
        }
      }
    }

    return skills;
  }

  private mapSkillCategory(categoryName: string): SkillCategory {
    const category = categoryName.toLowerCase();
    
    if (category.includes('language')) return 'programming-languages';
    if (category.includes('framework')) return 'frameworks';
    if (category.includes('database')) return 'databases';
    if (category.includes('cloud') || category.includes('devops')) return 'cloud';
    if (category.includes('test')) return 'testing';
    if (category.includes('tool')) return 'tools';
    if (category.includes('web')) return 'web-technologies';
    if (category.includes('backend')) return 'backend';
    if (category.includes('mobile')) return 'mobile';
    
    return 'tools'; // default
  }
}
