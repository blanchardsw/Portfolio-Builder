import { ParsedResumeData, PersonalInfo, WorkExperience, Education, Skill } from '../types/portfolio';
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

  private async parsePDF(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  private async parseDocx(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  private async parseText(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }

  private async extractDataFromText(text: string): Promise<ParsedResumeData> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract basic data first (fast)
    const workExperience = this.extractWorkExperience(text, lines);
    
    // Enrich work experience with company websites using fast lookup with internet fallback
    const enrichedWorkExperience = await this.enrichWithCompanyWebsitesFast(workExperience);
    
    // Extract and enrich education with institution websites
    const education = this.extractEducation(text, lines);
    const enrichedEducation = await this.enrichWithEducationWebsites(education);
    
    // Extract personal info and generate professional summary
    const personalInfo = this.extractPersonalInfo(text, lines);
    const enhancedPersonalInfo = this.generateProfessionalSummary(personalInfo, enrichedWorkExperience, enrichedEducation);
    
    return {
      personalInfo: enhancedPersonalInfo,
      workExperience: enrichedWorkExperience,
      education: enrichedEducation,
      skills: this.extractSkills(text, lines),
      projects: this.extractProjects(text, lines)
    };
  }

  private extractPersonalInfo(text: string, lines: string[]): Partial<PersonalInfo> {
    const personalInfo: Partial<PersonalInfo> = {};
    
    // Extract name (usually first line or prominent)
    const nameMatch = lines[0];
    if (nameMatch && !nameMatch.includes('@') && !nameMatch.includes('http')) {
      personalInfo.name = nameMatch;
    }
    
    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      personalInfo.email = emailMatch[0];
    }
    
    // Extract phone
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      personalInfo.phone = phoneMatch[0];
    }
    
    // Extract LinkedIn
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/g;
    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch) {
      personalInfo.linkedin = `https://${linkedinMatch[0]}`;
    }
    
    // Extract GitHub
    const githubRegex = /github\.com\/[a-zA-Z0-9-]+/g;
    const githubMatch = text.match(githubRegex);
    if (githubMatch) {
      personalInfo.github = `https://${githubMatch[0]}`;
    }
    
    return personalInfo;
  }

  private extractWorkExperience(text: string, lines: string[]): Partial<WorkExperience>[] {
    // Try multiple parsing strategies and return the best result
    const strategies = [
      () => this.parseWithStructuredFormat(lines),
      () => this.parseWithFlexibleFormat(lines),
      () => this.parseWithKeywordExtraction(lines)
    ];
    
    let bestResult: Partial<WorkExperience>[] = [];
    let bestScore = 0;
    
    for (const strategy of strategies) {
      try {
        const result = strategy();
        const score = this.scoreParsingResult(result);
        
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
        }
      } catch (error) {
        console.warn('Parsing strategy failed:', error);
      }
    }
    
    return bestResult;
  }
  
  private parseWithStructuredFormat(lines: string[]): Partial<WorkExperience>[] {
    // Original structured parsing (your current format)
    const experiences: Partial<WorkExperience>[] = [];
    const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience', 'work', 'career'];
    
    let inExperienceSection = false;
    let currentExperience: Partial<WorkExperience> | null = null;
    let expectingDateLine = false;
    let expectingCompanyLine = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      if (this.isExperienceSection(line)) {
        inExperienceSection = true;
        continue;
      }
      
      if (inExperienceSection && this.isEndOfExperienceSection(line)) {
        if (currentExperience && this.isValidExperience(currentExperience)) {
          experiences.push(currentExperience);
        }
        break;
      }
      
      if (inExperienceSection && line.length > 0) {
        const lineAnalysis = this.analyzeLine(line);
        
        if (expectingDateLine && lineAnalysis.isDate > 0.7) {
          if (currentExperience) {
            this.extractDates(line, currentExperience);
            expectingDateLine = false;
            expectingCompanyLine = true;
          }
        } else if (expectingCompanyLine && lineAnalysis.isCompany > 0.5) {
          if (currentExperience) {
            currentExperience.company = line;
            expectingCompanyLine = false;
          }
        } else if (!expectingDateLine && !expectingCompanyLine && lineAnalysis.isJobTitle > 0.7) {
          if (currentExperience && this.isValidExperience(currentExperience)) {
            experiences.push(currentExperience);
          }
          
          currentExperience = {
            id: `exp_${experiences.length + 1}`,
            company: '',
            position: '',
            description: [],
            current: false
          };
          
          // Extract dates from the job title line and clean the position
          this.extractDates(line, currentExperience);
          currentExperience.position = this.cleanPositionFromDates(line);
          expectingDateLine = true;
          expectingCompanyLine = false;
        } else if (currentExperience && !expectingDateLine && !expectingCompanyLine) {
          this.addDescriptionLine(line, currentExperience);
        }
      }
    }
    
    if (currentExperience && this.isValidExperience(currentExperience)) {
      experiences.push(currentExperience);
    }
    
    return this.cleanupExperiences(experiences);
  }
  
  private parseWithFlexibleFormat(lines: string[]): Partial<WorkExperience>[] {
    // Flexible parsing for alternative formats
    const experiences: Partial<WorkExperience>[] = [];
    let inExperienceSection = false;
    let currentExperience: Partial<WorkExperience> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (this.isExperienceSection(line)) {
        inExperienceSection = true;
        continue;
      }
      
      if (inExperienceSection && this.isEndOfExperienceSection(line)) {
        if (currentExperience && this.isValidExperience(currentExperience)) {
          experiences.push(currentExperience);
        }
        break;
      }
      
      if (inExperienceSection && line.length > 0) {
        const lineAnalysis = this.analyzeLine(line);
        
        // Check for inline format: "Software Engineer at Google (2020-2023)"
        const inlineMatch = line.match(/^(.+?)\s+at\s+(.+?)\s*\((.+?)\)$/);
        if (inlineMatch) {
          if (currentExperience && this.isValidExperience(currentExperience)) {
            experiences.push(currentExperience);
          }
          
          currentExperience = {
            id: `exp_${experiences.length + 1}`,
            position: inlineMatch[1].trim(),
            company: inlineMatch[2].trim(),
            description: [],
            current: false
          };
          this.extractDates(inlineMatch[3], currentExperience);
          continue;
        }
        
        // Try to identify the best field for this line
        if (lineAnalysis.isJobTitle > Math.max(lineAnalysis.isCompany, lineAnalysis.isDate, lineAnalysis.isDescription)) {
          // Start new experience with job title
          if (currentExperience && this.isValidExperience(currentExperience)) {
            experiences.push(currentExperience);
          }
          currentExperience = {
            id: `exp_${experiences.length + 1}`,
            position: '',
            company: '',
            description: [],
            current: false
          };
          
          // Extract dates from the job title line and clean the position
          this.extractDates(line, currentExperience);
          currentExperience.position = this.cleanPositionFromDates(line);
        } else if (currentExperience) {
          if (lineAnalysis.isCompany > Math.max(lineAnalysis.isDate, lineAnalysis.isDescription) && !currentExperience.company) {
            currentExperience.company = line;
          } else if (lineAnalysis.isDate > lineAnalysis.isDescription) {
            this.extractDates(line, currentExperience);
          } else if (lineAnalysis.isDescription > 0.3) {
            this.addDescriptionLine(line, currentExperience);
          }
        }
      }
    }
    
    if (currentExperience && this.isValidExperience(currentExperience)) {
      experiences.push(currentExperience);
    }
    
    return this.cleanupExperiences(experiences);
  }
  
  private parseWithKeywordExtraction(lines: string[]): Partial<WorkExperience>[] {
    // Fallback parsing using keyword extraction
    const experiences: Partial<WorkExperience>[] = [];
    let inExperienceSection = false;
    let currentBlock: string[] = [];
    
    for (const line of lines) {
      if (this.isExperienceSection(line)) {
        inExperienceSection = true;
        continue;
      }
      
      if (inExperienceSection && this.isEndOfExperienceSection(line)) {
        if (currentBlock.length > 0) {
          const experience = this.extractExperienceFromBlock(currentBlock, experiences.length + 1);
          if (experience && this.isValidExperience(experience)) {
            experiences.push(experience);
          }
        }
        break;
      }
      
      if (inExperienceSection) {
        if (line.trim().length === 0 && currentBlock.length > 0) {
          // Empty line - process current block
          const experience = this.extractExperienceFromBlock(currentBlock, experiences.length + 1);
          if (experience && this.isValidExperience(experience)) {
            experiences.push(experience);
          }
          currentBlock = [];
        } else if (line.trim().length > 0) {
          currentBlock.push(line.trim());
        }
      }
    }
    
    // Process final block
    if (currentBlock.length > 0) {
      const experience = this.extractExperienceFromBlock(currentBlock, experiences.length + 1);
      if (experience && this.isValidExperience(experience)) {
        experiences.push(experience);
      }
    }
    
    return this.cleanupExperiences(experiences);
  }
  
  // Helper methods for generic parsing
  private scoreParsingResult(experiences: Partial<WorkExperience>[]): number {
    let score = 0;
    
    for (const exp of experiences) {
      // Score based on completeness and quality
      if (exp.position) score += 20;
      if (exp.company) score += 20;
      if (exp.startDate) score += 15;
      if (exp.endDate || exp.current) score += 10;
      if (exp.description && exp.description.length > 0) score += 20;
      if (exp.description && exp.description.length > 2) score += 10;
      
      // Bonus for realistic content
      if (exp.position && exp.position.length > 5 && exp.position.length < 100) score += 5;
      if (exp.company && exp.company.length > 2 && exp.company.length < 50) score += 5;
    }
    
    return score;
  }
  
  private isExperienceSection(line: string): boolean {
    const lowerLine = line.toLowerCase();
    const experienceKeywords = [
      'experience', 'employment', 'work history', 'professional experience',
      'work experience', 'career history', 'professional background',
      'employment history', 'work', 'career'
    ];
    
    return experienceKeywords.some(keyword => 
      lowerLine.includes(keyword) && 
      (lowerLine.includes('experience') || lowerLine.includes('history') || lowerLine.includes('employment'))
    );
  }
  
  private isEndOfExperienceSection(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return lowerLine.includes('education') || lowerLine.includes('skills') || 
           lowerLine.includes('projects') || lowerLine.includes('certifications') ||
           lowerLine.includes('awards') || lowerLine.includes('publications');
  }
  
  private isValidExperience(exp: Partial<WorkExperience>): boolean {
    return !!(exp.company && exp.position && 
             (exp.startDate || (exp.description && exp.description.length > 0)));
  }
  
  private analyzeLine(line: string): {
    isJobTitle: number;
    isCompany: number;
    isDate: number;
    isDescription: number;
  } {
    const lowerLine = line.toLowerCase();
    let scores = {
      isJobTitle: 0,
      isCompany: 0,
      isDate: 0,
      isDescription: 0
    };
    
    // Date detection
    const datePattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\d{4}\s*[-–—]\s*\d{4}|present|current/gi;
    if (datePattern.test(line)) {
      scores.isDate = 0.9;
    }
    
    // Job title detection
    const jobTitleIndicators = /\b(engineer|developer|manager|director|analyst|specialist|coordinator|assistant|lead|senior|junior|intern|consultant|architect|designer|programmer|administrator|supervisor|executive|officer)\b/i;
    const hasTechInParens = /\([^)]*\)/;
    if (jobTitleIndicators.test(line)) scores.isJobTitle += 0.6;
    if (hasTechInParens.test(line)) scores.isJobTitle += 0.4;
    if (line.length > 10 && line.length < 80) scores.isJobTitle += 0.2;
    
    // Company detection
    const companyIndicators = /\b(inc|llc|corp|corporation|company|ltd|limited|group|systems|solutions|technologies|consulting|services|title|bank|financial|insurance|healthcare|medical|hospital|clinic|university|college|school|institute)\b/i;
    if (companyIndicators.test(line)) scores.isCompany += 0.7;
    if (line.length > 3 && line.length < 50 && !jobTitleIndicators.test(line)) scores.isCompany += 0.3;
    
    // Description detection
    if (line.startsWith('●') || line.startsWith('•') || line.startsWith('*') || line.startsWith('-')) {
      scores.isDescription = 0.9;
    } else if (line.length > 30) {
      scores.isDescription = 0.4;
    }
    
    // Normalize scores to max 1.0
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.min(1.0, scores[key as keyof typeof scores]);
    });
    
    return scores;
  }
  

  
  private extractDates(line: string, experience: Partial<WorkExperience>): void {
    // Enhanced date pattern to match various formats including regular hyphens
    const datePattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(present|current)|\d{4}\s*[-–—−]\s*\d{4}|\d{4}\s*[-–—−]\s*(present|current)/gi;
    
    const matches = line.match(datePattern);
    if (matches && matches.length > 0) {
      const dateRange = matches[0];
      
      // Split the date range
      const dateParts = dateRange.split(/\s*[-–—−]\s*/);
      
      if (dateParts.length >= 2) {
        experience.startDate = this.formatDate(dateParts[0].trim());
        const endPart = dateParts[1].trim().toLowerCase();
        
        if (endPart === 'present' || endPart === 'current') {
          experience.current = true;
          experience.endDate = undefined;
        } else {
          experience.current = false;
          experience.endDate = this.formatDate(endPart);
        }
      }
    }
  }
  
  private formatDate(dateStr: string): string {
    // Convert abbreviated months to full names and ensure consistent formatting
    const monthMap: { [key: string]: string } = {
      'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
      'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
      'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
    };
    
    // Handle full month names (capitalize first letter)
    const fullMonthPattern = /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})$/i;
    const fullMonthMatch = dateStr.match(fullMonthPattern);
    if (fullMonthMatch) {
      const month = fullMonthMatch[1].charAt(0).toUpperCase() + fullMonthMatch[1].slice(1).toLowerCase();
      return `${month} ${fullMonthMatch[2]}`;
    }
    
    // Handle abbreviated month names
    const abbrevPattern = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})$/i;
    const abbrevMatch = dateStr.match(abbrevPattern);
    if (abbrevMatch) {
      const month = monthMap[abbrevMatch[1].toLowerCase()];
      return `${month} ${abbrevMatch[2]}`;
    }
    
    // Handle year-only format
    if (/^\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Return as-is if no pattern matches
    return dateStr;
  }
  
  private cleanPositionFromDates(position: string): string {
    // Remove date patterns from position strings
    const datePattern = /\s*\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\s*\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(present|current)|\s*\d{4}\s*[-–—−]\s*\d{4}|\s*\d{4}\s*[-–—−]\s*(present|current)/gi;
    
    return position.replace(datePattern, '').trim();
  }

  private addDescriptionLine(line: string, experience: Partial<WorkExperience>): void {
    if (line.startsWith('●') || line.startsWith('•') || line.startsWith('*') || line.startsWith('-')) {
      // Clean up bullet points
      let cleanLine = line.replace(/^[●•\*\-]\s*/, '').trim();
      
      // Filter out empty lines, stray punctuation, or very short content
      if (cleanLine.length > 10 && !/^[\-\*•●\s]*$/.test(cleanLine)) {
        experience.description = experience.description || [];
        experience.description.push(cleanLine);
      }
    } else if (line.length > 20) {
      // This might be a continuation of a previous bullet point or a new description
      if (experience.description && experience.description.length > 0) {
        const lastIndex = experience.description.length - 1;
        // Check if this looks like a continuation (doesn't start with capital letter or common sentence starters)
        if (!/^[A-Z]/.test(line) || line.startsWith('and ') || line.startsWith('or ') || line.startsWith('with ')) {
          experience.description[lastIndex] += ' ' + line;
        } else {
          experience.description.push(line);
        }
      } else {
        experience.description = [line];
      }
    }
  }


  private extractExperienceFromBlock(block: string[], id: number): Partial<WorkExperience> | null {
    if (block.length === 0) return null;
    
    const experience: Partial<WorkExperience> = {
      id: `exp_${id}`,
      company: '',
      position: '',
      description: [],
      current: false
    };
    
    // First pass: Extract dates from any line that contains them
    for (const line of block) {
      this.extractDates(line, experience);
    }
    
    // Second pass: Analyze each line for content assignment
    for (const line of block) {
      const analysis = this.analyzeLine(line);
      
      if (analysis.isJobTitle > 0.6 && !experience.position) {
        // Clean the position of any date information
        experience.position = this.cleanPositionFromDates(line);
      } else if (analysis.isCompany > 0.5 && !experience.company) {
        experience.company = line;
      } else if (analysis.isDescription > 0.3) {
        this.addDescriptionLine(line, experience);
      }
    }
    
    // If we couldn't identify position/company clearly, make best guesses
    if (!experience.position && !experience.company) {
      // First non-bullet line is likely position or company
      const nonBulletLines = block.filter(line => 
        !line.startsWith('●') && !line.startsWith('•') && 
        !line.startsWith('*') && !line.startsWith('-') &&
        this.analyzeLine(line).isDate < 0.5
      );
      
      if (nonBulletLines.length >= 1) {
        const firstAnalysis = this.analyzeLine(nonBulletLines[0]);
        if (firstAnalysis.isJobTitle >= firstAnalysis.isCompany) {
          // Clean position (dates already extracted in first pass)
          experience.position = this.cleanPositionFromDates(nonBulletLines[0]);
          if (nonBulletLines.length >= 2) {
            experience.company = nonBulletLines[1];
          }
        } else {
          experience.company = nonBulletLines[0];
          if (nonBulletLines.length >= 2) {
            // Clean position (dates already extracted in first pass)
            experience.position = this.cleanPositionFromDates(nonBulletLines[1]);
          }
        }
      }
    }
    
    return experience;
  }
  
  private cleanupExperiences(experiences: Partial<WorkExperience>[]): Partial<WorkExperience>[] {
    return experiences
      .filter(exp => this.isValidExperience(exp))
      .map(exp => ({
        ...exp,
        company: exp.company || 'Unknown Company',
        position: exp.position || 'Unknown Position',
        description: exp.description?.filter(desc => 
          desc.length > 10 && 
          desc.trim().length > 0 && 
          !/^[\-\*•●\s]*$/.test(desc.trim())
        ) || []
      }));
  }

  private extractEducation(text: string, lines: string[]): Partial<Education>[] {
    const education: Partial<Education>[] = [];
    const educationKeywords = ['education', 'academic', 'university', 'college', 'degree', 'school'];
    
    let inEducationSection = false;
    let currentEducation: Partial<Education> | null = null;
    let educationLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      if (educationKeywords.some(keyword => lowerLine.includes(keyword)) && 
          (lowerLine.includes('education') || lowerLine.includes('academic'))) {
        inEducationSection = true;
        continue;
      }
      
      if (inEducationSection && (lowerLine.includes('experience') || lowerLine.includes('skills') || 
          lowerLine.includes('projects') || lowerLine.includes('certifications'))) {
        break;
      }
      
      if (inEducationSection && line.length > 0) {
        educationLines.push(line);
      }
    }
    
    // Process all education lines together to avoid multiple entries
    if (educationLines.length > 0) {
      currentEducation = {
        id: 'edu_1',
        institution: '',
        degree: '',
        field: ''
      };
      
      const combinedText = educationLines.join(' ');
      const datePattern = /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+)?(?:20\d{2}|19\d{2})\b/gi;
      const monthYearPattern = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(?:20\d{2}|19\d{2})\b/gi;
      const yearOnlyPattern = /\b(?:20\d{2}|19\d{2})\b/g;
      
      // Extract dates from combined text
      const monthYearMatches = combinedText.match(monthYearPattern);
      const yearMatches = combinedText.match(yearOnlyPattern);
      
      if (monthYearMatches && monthYearMatches.length >= 1) {
        currentEducation.startDate = monthYearMatches[0];
        if (monthYearMatches.length >= 2) {
          currentEducation.endDate = monthYearMatches[1];
        }
      } else if (yearMatches && yearMatches.length >= 1) {
        currentEducation.startDate = yearMatches[0];
        if (yearMatches.length >= 2) {
          currentEducation.endDate = yearMatches[1];
        }
      }
      
      // Look for institution (University, College, etc.)
      for (const line of educationLines) {
        const lowerLine = line.toLowerCase();
        if ((lowerLine.includes('university') || lowerLine.includes('college') || lowerLine.includes('institute')) && !currentEducation.institution) {
          currentEducation.institution = line.replace(datePattern, '').trim();
          break;
        }
      }
      
      // Look for degree information
      const degreePattern = /\b(bachelor|master|phd|doctorate|associate|diploma|certificate)\s+(of\s+)?(science|arts|engineering|business|education|fine\s+arts)?\s+(in\s+)?([\w\s]+)?/gi;
      const simplePattern = /\b(bachelor|master|phd|doctorate|associate|diploma|certificate)/gi;
      
      let degreeMatch = combinedText.match(degreePattern);
      if (!degreeMatch) {
        degreeMatch = combinedText.match(simplePattern);
      }
      
      if (degreeMatch) {
        const fullDegree = degreeMatch[0];
        const degreeType = fullDegree.toLowerCase();
        
        if (degreeType.includes('bachelor')) {
          if (degreeType.includes('science')) {
            currentEducation.degree = 'Bachelor of Science';
            // Extract field after "in"
            const fieldMatch = fullDegree.match(/in\s+([\w\s]+)/i);
            if (fieldMatch) {
              currentEducation.field = fieldMatch[1].trim();
            }
          } else if (degreeType.includes('arts')) {
            currentEducation.degree = 'Bachelor of Arts';
            const fieldMatch = fullDegree.match(/in\s+([\w\s]+)/i);
            if (fieldMatch) {
              currentEducation.field = fieldMatch[1].trim();
            }
          } else {
            currentEducation.degree = 'Bachelor\'s Degree';
          }
        } else if (degreeType.includes('master')) {
          currentEducation.degree = 'Master\'s Degree';
        } else if (degreeType.includes('phd') || degreeType.includes('doctorate')) {
          currentEducation.degree = 'PhD';
        } else {
          currentEducation.degree = fullDegree;
        }
      }
      
      // If no specific field was found in degree, look for common fields
      if (!currentEducation.field) {
        const fieldKeywords = ['computer science', 'engineering', 'business', 'mathematics', 'biology', 'chemistry', 'physics', 'psychology', 'english', 'history', 'art', 'music'];
        for (const keyword of fieldKeywords) {
          if (combinedText.toLowerCase().includes(keyword)) {
            currentEducation.field = keyword.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            break;
          }
        }
      }
      
      // Clean up institution name (remove dates and degree info)
      if (currentEducation.institution) {
        currentEducation.institution = currentEducation.institution
          .replace(datePattern, '')
          .replace(degreePattern, '')
          .replace(/[-–—|]+/g, '') // Remove hyphens and dashes
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/^[\s-]+|[\s-]+$/g, '') // Remove leading/trailing spaces and hyphens
          .trim();
      }
      
      // Ensure we have at least basic information
      if (currentEducation.institution || currentEducation.degree) {
        education.push({
          ...currentEducation,
          institution: currentEducation.institution || 'Unknown Institution',
          degree: currentEducation.degree || 'Degree',
          field: currentEducation.field || 'Unknown Field'
        });
      }
    }
    
    return education;
  }

  private extractSkills(text: string, lines: string[]): Partial<Skill>[] {
    const skills: Partial<Skill>[] = [];
    const skillKeywords = ['skills', 'technologies', 'technical skills', 'programming'];
    
    let inSkillsSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (skillKeywords.some(keyword => line.includes(keyword))) {
        inSkillsSection = true;
        continue;
      }
      
      if (inSkillsSection && (line.includes('experience') || line.includes('education') || line.includes('projects'))) {
        break;
      }
      
      if (inSkillsSection && lines[i].length > 0) {
        // Split by common delimiters
        const skillItems = lines[i].split(/[,;|•·]/).map(s => s.trim()).filter(s => s.length > 0);
        
        skillItems.forEach(skill => {
          skills.push({
            name: skill,
            category: 'technical' // Default to technical, can be refined
          });
        });
      }
    }
    
    return skills;
  }

  private extractProjects(text: string, lines: string[]): Partial<any>[] {
    // Basic project extraction - can be enhanced
    return [];
  }
  
  /**
   * Enrich work experience entries with company website information
   */
  private async enrichWithCompanyWebsites(experiences: Partial<WorkExperience>[]): Promise<Partial<WorkExperience>[]> {
    const enrichedExperiences = await Promise.all(
      experiences.map(async (exp) => {
        if (exp.company && exp.company.trim().length > 0) {
          try {
            const companyInfo = await this.companyLookup.findCompanyWebsite(exp.company);
            return {
              ...exp,
              website: companyInfo.website
            };
          } catch (error) {
            console.log(`Could not find website for ${exp.company}:`, error);
            return exp;
          }
        }
        return exp;
      })
    );
    
    return enrichedExperiences;
  }
  
  /**
   * Fast company website lookup using known companies mapping with automatic fallback to internet search
   */
  private async enrichWithCompanyWebsitesFast(experiences: Partial<WorkExperience>[]): Promise<Partial<WorkExperience>[]> {
    // Known company mappings for immediate lookup
    const knownCompanies: { [key: string]: string } = {
      'google': 'https://www.google.com',
      'microsoft': 'https://www.microsoft.com',
      'apple': 'https://www.apple.com',
      'amazon': 'https://www.amazon.com',
      'facebook': 'https://www.facebook.com',
      'meta': 'https://www.meta.com',
      'netflix': 'https://www.netflix.com',
      'spotify': 'https://www.spotify.com',
      'airbnb': 'https://www.airbnb.com',
      'uber': 'https://www.uber.com',
      'lyft': 'https://www.lyft.com',
      'tesla': 'https://www.tesla.com',
      'kaseya': 'https://www.kaseya.com',
      'ainsworth game technology': 'https://www.ainsworth.com.au',
      'ainsworth': 'https://www.ainsworth.com.au',
      'ibm': 'https://www.ibm.com',
      'oracle': 'https://www.oracle.com',
      'salesforce': 'https://www.salesforce.com',
      'adobe': 'https://www.adobe.com',
      'intel': 'https://www.intel.com',
      'nvidia': 'https://www.nvidia.com',
      'amd': 'https://www.amd.com',
      'cisco': 'https://www.cisco.com',
      'vmware': 'https://www.vmware.com',
      'red hat': 'https://www.redhat.com',
      'redhat': 'https://www.redhat.com',
      'mongodb': 'https://www.mongodb.com',
      'atlassian': 'https://www.atlassian.com',
      'slack': 'https://slack.com',
      'zoom': 'https://zoom.us',
      'dropbox': 'https://www.dropbox.com',
      'github': 'https://github.com',
      'gitlab': 'https://gitlab.com',
      'bitbucket': 'https://bitbucket.org',
      'jira': 'https://www.atlassian.com/software/jira',
      'confluence': 'https://www.atlassian.com/software/confluence',
      'first american title': 'https://www.firstam.com',
      'first american': 'https://www.firstam.com',
      'enterprise data concepts': 'https://edcnow.com',
      'edc': 'https://edcnow.com'
    };

    const enrichedExperiences = await Promise.all(
      experiences.map(async (exp) => {
        if (exp.company && exp.company.trim().length > 0) {
          const normalizedCompany = exp.company.toLowerCase()
            .replace(/\b(inc|corp|corporation|ltd|limited|llc|company|co)\b\.?/g, '')
            .replace(/[^\w\s]/g, '')
            .trim();

          console.log(`[DEBUG] Processing company: "${exp.company}" -> normalized: "${normalizedCompany}"`);

          // First, check known companies for fast lookup
          for (const [key, website] of Object.entries(knownCompanies)) {
            if (normalizedCompany === key || 
                normalizedCompany.includes(key) || 
                key.includes(normalizedCompany)) {
              console.log(`[DEBUG] FAST MATCH FOUND! "${normalizedCompany}" matches "${key}" -> ${website}`);
              return {
                ...exp,
                website: website
              };
            }
          }

          // If not in known companies, use CompanyLookupService to search the internet
          console.log(`[DEBUG] No fast match found for "${normalizedCompany}", searching internet...`);
          try {
            const companyInfo = await this.companyLookup.findCompanyWebsite(exp.company);
            if (companyInfo.website) {
              console.log(`[DEBUG] INTERNET SEARCH SUCCESS! Found website for "${exp.company}" -> ${companyInfo.website}`);
              return {
                ...exp,
                website: companyInfo.website
              };
            }
          } catch (error) {
            console.log(`[DEBUG] Internet search failed for "${exp.company}":`, error);
          }

          console.log(`[DEBUG] No website found for "${normalizedCompany}"`);
        }
        return exp;
      })
    );

    return enrichedExperiences;
  }

  /**
   * Enrich education entries with institution websites using automatic lookup
   */
  private async enrichWithEducationWebsites(educationEntries: Partial<Education>[]): Promise<Partial<Education>[]> {
    // Known educational institutions for fast lookup
    const knownInstitutions: { [key: string]: string } = {
      'university of louisiana at lafayette': 'https://www.louisiana.edu',
      'ull': 'https://www.louisiana.edu',
      'louisiana': 'https://www.louisiana.edu',
      'harvard university': 'https://www.harvard.edu',
      'harvard': 'https://www.harvard.edu',
      'stanford university': 'https://www.stanford.edu',
      'stanford': 'https://www.stanford.edu',
      'mit': 'https://www.mit.edu',
      'massachusetts institute of technology': 'https://www.mit.edu',
      'university of california berkeley': 'https://www.berkeley.edu',
      'uc berkeley': 'https://www.berkeley.edu',
      'berkeley': 'https://www.berkeley.edu',
      'university of texas at austin': 'https://www.utexas.edu',
      'ut austin': 'https://www.utexas.edu',
      'georgia institute of technology': 'https://www.gatech.edu',
      'georgia tech': 'https://www.gatech.edu',
      'carnegie mellon university': 'https://www.cmu.edu',
      'carnegie mellon': 'https://www.cmu.edu',
      'cmu': 'https://www.cmu.edu',
      'university of washington': 'https://www.washington.edu',
      'uw': 'https://www.washington.edu',
      'university of michigan': 'https://www.umich.edu',
      'umich': 'https://www.umich.edu',
      'michigan': 'https://www.umich.edu',
      'yale university': 'https://www.yale.edu',
      'yale': 'https://www.yale.edu',
      'princeton university': 'https://www.princeton.edu',
      'princeton': 'https://www.princeton.edu',
      'columbia university': 'https://www.columbia.edu',
      'columbia': 'https://www.columbia.edu',
      'university of pennsylvania': 'https://www.upenn.edu',
      'upenn': 'https://www.upenn.edu',
      'penn': 'https://www.upenn.edu',
      'cornell university': 'https://www.cornell.edu',
      'cornell': 'https://www.cornell.edu',
      'caltech': 'https://www.caltech.edu',
      'california institute of technology': 'https://www.caltech.edu',
      'university of southern california': 'https://www.usc.edu',
      'usc': 'https://www.usc.edu',
      'new york university': 'https://www.nyu.edu',
      'nyu': 'https://www.nyu.edu'
    };

    const enrichedEducation = await Promise.all(
      educationEntries.map(async (edu) => {
        if (edu.institution && edu.institution.trim().length > 0) {
          const normalizedInstitution = edu.institution.toLowerCase()
            .replace(/\b(university|college|institute|school)\b/g, '')
            .replace(/[^\w\s]/g, '')
            .trim();

          console.log(`[DEBUG] Processing institution: "${edu.institution}" -> normalized: "${normalizedInstitution}"`);

          // First, check known institutions for fast lookup
          for (const [key, website] of Object.entries(knownInstitutions)) {
            if (normalizedInstitution.includes(key.replace(/\b(university|college|institute|school)\b/g, '').trim()) || 
                key.includes(normalizedInstitution) ||
                normalizedInstitution === key) {
              console.log(`[DEBUG] FAST MATCH FOUND! "${normalizedInstitution}" matches "${key}" -> ${website}`);
              return {
                ...edu,
                website: website
              };
            }
          }

          // If not in known institutions, use CompanyLookupService to search the internet
          console.log(`[DEBUG] No fast match found for "${normalizedInstitution}", searching internet...`);
          try {
            const institutionInfo = await this.companyLookup.findCompanyWebsite(edu.institution);
            if (institutionInfo.website) {
              console.log(`[DEBUG] INTERNET SEARCH SUCCESS! Found website for "${edu.institution}" -> ${institutionInfo.website}`);
              return {
                ...edu,
                website: institutionInfo.website
              };
            }
          } catch (error) {
            console.log(`[DEBUG] Internet search failed for "${edu.institution}":`, error);
          }

          console.log(`[DEBUG] No website found for "${normalizedInstitution}"`);
        }
        return edu;
      })
    );

    return enrichedEducation;
  }

  /**
   * Generate a professional summary based on work experience and education
   */
  private generateProfessionalSummary(
    personalInfo: Partial<PersonalInfo>, 
    workExperience: Partial<WorkExperience>[], 
    education: Partial<Education>[]
  ): Partial<PersonalInfo> {
    if (!workExperience || workExperience.length === 0) {
      return personalInfo;
    }

    // Calculate years of experience
    const yearsOfExperience = this.calculateYearsOfExperience(workExperience);
    
    // Extract key technologies and skills from work experience
    const technologies = this.extractTechnologiesFromExperience(workExperience);
    
    // Determine primary role/title based on most recent positions
    const primaryRole = this.determinePrimaryRole(workExperience);
    
    // Get education level
    const educationLevel = this.getHighestEducationLevel(education);
    
    // Generate summary
    const summary = this.buildProfessionalSummary({
      yearsOfExperience,
      technologies,
      primaryRole,
      educationLevel,
      name: personalInfo.name
    });

    console.log(`[DEBUG] Generated professional summary: ${summary}`);

    return {
      ...personalInfo,
      summary: summary
    };
  }

  /**
   * Calculate total years of professional experience
   */
  private calculateYearsOfExperience(workExperience: Partial<WorkExperience>[]): number {
    let totalMonths = 0;
    
    for (const exp of workExperience) {
      if (exp.startDate) {
        const startDate = this.parseDate(exp.startDate);
        const endDate = exp.current ? new Date() : (exp.endDate ? this.parseDate(exp.endDate) : new Date());
        
        if (startDate && endDate) {
          const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
          totalMonths += Math.max(0, months);
        }
      }
    }
    
    return Math.floor(totalMonths / 12); // Round down to nearest whole number
  }

  /**
   * Extract key technologies from work experience descriptions, ordered by frequency
   */
  private extractTechnologiesFromExperience(workExperience: Partial<WorkExperience>[]): string[] {
    const techKeywords = [
      'C#', '.NET', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js',
      'Python', 'Java', 'C++', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
      'PostgreSQL', 'MySQL', 'Redis', 'REST', 'GraphQL', 'Git', 'Jenkins', 'CI/CD',
      'Agile', 'Scrum', 'T-SQL', 'DynamoDB', 'OpenSearch', 'Kafka', 'SQS', 'S3',
      'Ruby', 'Cucumber', 'Entity Framework', 'ASP.NET', 'HTML', 'CSS', 'SASS',
      'Webpack', 'Babel', 'Express', 'Spring', 'Django', 'Flask', 'Laravel'
    ];
    
    const techCounts = new Map<string, number>();
    
    // Count occurrences of each technology
    for (const exp of workExperience) {
      const text = `${exp.position || ''} ${exp.description?.join(' ') || ''}`;
      
      for (const tech of techKeywords) {
        // Special handling for technologies with special characters
        let regex;
        switch (tech) {
          case 'C#':
            // Match C# in various contexts (C#/.NET, C#/.Net, standalone C#)
            regex = /C#(?:\/\.NET|\/\.Net|\b)/gi;
            break;
          case 'C++':
            // Match C++ with proper escaping of plus symbols
            regex = /\bC\+\+\b/gi;
            break;
          case '.NET':
            // Match .NET in various contexts
            regex = /\.NET\b/gi;
            break;
          case 'ASP.NET':
            // Match ASP.NET with escaped dot
            regex = /\bASP\.NET\b/gi;
            break;
          case 'Node.js':
            // Match Node.js with escaped dot
            regex = /\bNode\.js\b/gi;
            break;
          case 'Vue.js':
            // Match Vue.js with escaped dot
            regex = /\bVue\.js\b/gi;
            break;
          case 'Next.js':
            // Match Next.js with escaped dot
            regex = /\bNext\.js\b/gi;
            break;
          case 'Express.js':
            // Match Express.js with escaped dot
            regex = /\bExpress\.js\b/gi;
            break;
          case 'D3.js':
            // Match D3.js with escaped dot
            regex = /\bD3\.js\b/gi;
            break;
          case 'Chart.js':
            // Match Chart.js with escaped dot
            regex = /\bChart\.js\b/gi;
            break;
          case 'Three.js':
            // Match Three.js with escaped dot
            regex = /\bThree\.js\b/gi;
            break;
          case 'Objective-C':
            // Match Objective-C with escaped hyphen
            regex = /\bObjective-C\b/gi;
            break;
          case 'F#':
            // Match F# with escaped hash
            regex = /\bF#\b/gi;
            break;
          case 'Q#':
            // Match Q# (Microsoft quantum language)
            regex = /\bQ#\b/gi;
            break;
          case 'T-SQL':
            // Match T-SQL with escaped hyphen
            regex = /\bT-SQL\b/gi;
            break;
          case 'PL/SQL':
            // Match PL/SQL with escaped slash
            regex = /\bPL\/SQL\b/gi;
            break;
          case 'X++':
            // Match X++ (Microsoft Dynamics language)
            regex = /\bX\+\+\b/gi;
            break;
          default:
            // Escape special regex characters for other technologies
            const escapedTech = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            regex = new RegExp(`\\b${escapedTech}\\b`, 'gi');
            break;
        }
        
        const matches = text.match(regex);
        if (matches) {
          const currentCount = techCounts.get(tech) || 0;
          techCounts.set(tech, currentCount + matches.length);
        }
      }
    }
    
    // Sort technologies by frequency (most to least) and return top 8
    const sortedTechs = Array.from(techCounts.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([tech, count]) => {
        console.log(`[DEBUG] Technology frequency: ${tech} = ${count} occurrences`);
        return tech;
      })
      .slice(0, 8);
    
    return sortedTechs;
  }

  /**
   * Determine primary role based on most recent positions
   */
  private determinePrimaryRole(workExperience: Partial<WorkExperience>[]): string {
    if (workExperience.length === 0) return 'Software Professional';
    
    // Get the most recent position
    const recentExp = workExperience[0];
    const position = recentExp.position || '';
    
    // Extract role from position title
    if (position.toLowerCase().includes('senior')) {
      if (position.toLowerCase().includes('engineer')) return 'Senior Software Engineer';
      if (position.toLowerCase().includes('developer')) return 'Senior Software Developer';
      return 'Senior Software Professional';
    }
    
    if (position.toLowerCase().includes('engineer')) return 'Software Engineer';
    if (position.toLowerCase().includes('developer')) return 'Software Developer';
    if (position.toLowerCase().includes('architect')) return 'Software Architect';
    if (position.toLowerCase().includes('lead')) return 'Technical Lead';
    
    return 'Software Professional';
  }

  /**
   * Get highest education level
   */
  private getHighestEducationLevel(education: Partial<Education>[]): string {
    if (!education || education.length === 0) return '';
    
    for (const edu of education) {
      const degree = edu.degree?.toLowerCase() || '';
      if (degree.includes('phd') || degree.includes('doctorate')) return 'PhD';
      if (degree.includes('master')) return "Master's degree";
      if (degree.includes('bachelor')) return "Bachelor's degree";
    }
    
    return education[0]?.degree || '';
  }

  /**
   * Build the professional summary text
   */
  private buildProfessionalSummary(data: {
    yearsOfExperience: number;
    technologies: string[];
    primaryRole: string;
    educationLevel: string;
    name?: string;
  }): string {
    const { yearsOfExperience, technologies, primaryRole, educationLevel } = data;
    
    let summary = `${primaryRole} with ${yearsOfExperience}+ years of experience`;
    
    if (technologies.length > 0) {
      const techList = technologies.slice(0, 5).join(', ');
      summary += ` specializing in ${techList}`;
      if (technologies.length > 5) {
        summary += ` and other technologies`;
      }
    }
    
    summary += '. Proven track record in full-stack development, system architecture, and delivering scalable solutions.';
    
    return summary;
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    
    // Handle various date formats
    const cleanDate = dateString.toLowerCase().replace(/present|current/, new Date().getFullYear().toString());
    
    // Try parsing different formats
    const formats = [
      /^(\w+)\s+(\d{4})$/, // "August 2021"
      /^(\d{1,2})\/(\d{4})$/, // "8/2021"
      /^(\d{4})$/ // "2021"
    ];
    
    for (const format of formats) {
      const match = cleanDate.match(format);
      if (match) {
        if (format === formats[0]) { // Month Year
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                             'july', 'august', 'september', 'october', 'november', 'december'];
          const monthIndex = monthNames.indexOf(match[1].toLowerCase());
          if (monthIndex !== -1) {
            return new Date(parseInt(match[2]), monthIndex, 1);
          }
        } else if (format === formats[1]) { // MM/YYYY
          return new Date(parseInt(match[2]), parseInt(match[1]) - 1, 1);
        } else if (format === formats[2]) { // YYYY
          return new Date(parseInt(match[1]), 0, 1);
        }
      }
    }
    
    return new Date(dateString); // Fallback to native parsing
  }

  /**
   * Asynchronously enrich work experience entries with company websites (non-blocking)
   */
  private enrichWithCompanyWebsitesAsync(experiences: Partial<WorkExperience>[]): void {
    // Run in background without blocking
    this.enrichWithCompanyWebsites(experiences)
      .then(enrichedExperiences => {
        console.log('Company websites enriched for', enrichedExperiences.length, 'experiences');
        // Could emit an event or update a cache here if needed
      })
      .catch(error => {
        console.log('Error enriching company websites:', error);
      });
  }
}
