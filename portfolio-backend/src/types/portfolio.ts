export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
  profilePhoto?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
  technologies?: string[];
  location?: string;
  website?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  honors?: string[];
  coursework?: string[];
  website?: string;
}

export type SkillCategory = string; // Allow dynamic categories from resume
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  name: string;
  category: SkillCategory;
  level?: SkillLevel;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
}

export interface Portfolio {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  lastUpdated: string;
}

export type MimeType = 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'application/msword' | 'text/plain';
export type FileExtension = '.pdf' | '.docx' | '.doc' | '.txt';

export interface ParsedResumeData {
  personalInfo: Partial<PersonalInfo>;
  workExperience: Partial<WorkExperience>[];
  education: Partial<Education>[];
  skills: Partial<Skill>[];
  projects: Partial<Project>[];
}

// Utility types for better type safety
export type RequiredPersonalInfo = Required<Pick<PersonalInfo, 'name' | 'email'>>;
export type OptionalPersonalInfo = Partial<Omit<PersonalInfo, 'name' | 'email'>>;
export type CompletePersonalInfo = RequiredPersonalInfo & OptionalPersonalInfo;

// API Response types
export interface UploadResponse {
  message: string;
  portfolio: Portfolio;
  parsedData: {
    personalInfo: Partial<PersonalInfo>;
    workExperienceCount: number;
    educationCount: number;
    skillsCount: number;
    projectsCount: number;
  };
}

export interface ErrorResponse {
  error: string;
  details?: string;
  threats?: string[];
}
