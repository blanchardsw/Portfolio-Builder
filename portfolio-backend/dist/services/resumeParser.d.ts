import { ParsedResumeData } from '../types/portfolio';
export declare class ResumeParser {
    private companyLookup;
    constructor();
    parseFile(filePath: string, mimeType: string): Promise<ParsedResumeData>;
    private parsePDF;
    private parseDocx;
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
}
//# sourceMappingURL=resumeParser.d.ts.map