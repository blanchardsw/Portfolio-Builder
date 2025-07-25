import { ParsedResumeData } from '../types/portfolio';
/**
 * Refactored Resume Parser following SOLID principles
 * - Single Responsibility: Only orchestrates the parsing workflow
 * - Open/Closed: Extensible through strategy patterns
 * - Liskov Substitution: Uses interfaces for all dependencies
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Depends on abstractions, not concretions
 */
export declare class ResumeParserRefactored {
    private fileParserFactory;
    private companyEnrichmentStrategy;
    private educationEnrichmentStrategy;
    private technologyAnalysisService;
    constructor();
    parseFile(filePath: string, mimeType: string): Promise<ParsedResumeData>;
    private extractDataFromText;
    private extractPersonalInfo;
    private generateProfessionalSummary;
    private calculateYearsOfExperience;
    private parseDate;
    private determinePrimaryRole;
    private buildProfessionalSummary;
    private extractWorkExperience;
    private extractEducation;
    private extractSkills;
    private extractProjects;
}
//# sourceMappingURL=ResumeParserRefactored.d.ts.map