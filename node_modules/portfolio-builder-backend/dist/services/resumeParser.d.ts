import { ParsedResumeData } from '../types/portfolio';
export declare class ResumeParser {
    private companyLookup;
    constructor();
    parseFile(filePath: string, mimeType: string): Promise<ParsedResumeData>;
    parseBuffer(buffer: Buffer, mimeType: string): Promise<ParsedResumeData>;
    private parsePDF;
    private parsePDFBuffer;
    private parseDocx;
    private parseDocxBuffer;
    private parseText;
    private extractDataFromText;
    private extractPersonalInfo;
    private extractWorkExperience;
    private parseWithStructuredFormat;
    private parseWithFlexibleFormat;
    private parseWithKeywordExtraction;
    private scoreParsingResult;
    private isExperienceSection;
    private isEndOfExperienceSection;
    private isValidExperience;
    private analyzeLine;
    private extractDates;
    private formatDate;
    private cleanPositionFromDates;
    private addDescriptionLine;
    private extractExperienceFromBlock;
    private cleanupExperiences;
    private extractEducation;
    private extractSkills;
    private extractProjects;
    /**
     * Enrich work experience entries with company website information
     */
    private enrichWithCompanyWebsites;
    /**
     * Fast company website lookup using known companies mapping with automatic fallback to internet search
     */
    private enrichWithCompanyWebsitesFast;
    /**
     * Enrich education entries with institution websites using automatic lookup
     */
    private enrichWithEducationWebsites;
    /**
     * Generate a professional summary based on work experience and education
     */
    private generateProfessionalSummary;
    /**
     * Calculate total years of professional experience
     */
    private calculateYearsOfExperience;
    /**
     * Extract key technologies from work experience descriptions, ordered by frequency
     */
    private extractTechnologiesFromExperience;
    /**
     * Determine primary role based on most recent positions
     */
    private determinePrimaryRole;
    /**
     * Get highest education level
     */
    private getHighestEducationLevel;
    /**
     * Build the professional summary text
     */
    private buildProfessionalSummary;
    /**
     * Parse date string to Date object
     */
    private parseDate;
    /**
     * Asynchronously enrich work experience entries with company websites (non-blocking)
     */
    private enrichWithCompanyWebsitesAsync;
}
//# sourceMappingURL=resumeParser.d.ts.map