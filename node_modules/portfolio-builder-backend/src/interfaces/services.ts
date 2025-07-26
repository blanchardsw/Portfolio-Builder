/**
 * Service interfaces for better OOP design and dependency injection
 */

import { Portfolio, ParsedResumeData } from '../types/portfolio';

export interface IPortfolioService {
  getPortfolio(): Promise<Portfolio | null>;
  updatePortfolioFromResume(parsedData: ParsedResumeData): Promise<Portfolio>;
  savePortfolio(portfolio: Portfolio): Promise<void>;
}

export interface IResumeParser {
  parseFile(filePath: string, mimeType: string): Promise<ParsedResumeData>;
  parseBuffer(buffer: Buffer, mimeType: string): Promise<ParsedResumeData>;
}

export interface IFileSecurityService {
  scanFile(filePath: string, mimeType: string): Promise<SecurityScanResult>;
  quarantineFile(filePath: string): string;
}

export interface ILinkedInPhotoService {
  getProfilePhotoUrl(linkedinUrl: string): Promise<string | null>;
}

export interface SecurityScanResult {
  isSecure: boolean;
  threats: string[];
  fileInfo: {
    size: number;
    mimeType: string;
    extension: string;
    hash: string;
  };
}

export interface FileValidationResult {
  isValid: boolean;
  threats: string[];
}

export interface CompanyInfo {
  name: string;
  website?: string;
  industry?: string;
}

export interface ICompanyLookupService {
  lookupCompany(companyName: string): Promise<CompanyInfo | null>;
}
