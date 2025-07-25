import { WorkExperience } from '../../types/portfolio';
/**
 * Service for analyzing technologies in work experience
 * Follows Single Responsibility Principle
 */
export declare class TechnologyAnalysisService {
    private techKeywords;
    /**
     * Extract technologies ordered by frequency from work experience
     */
    extractTechnologiesFromExperience(workExperience: Partial<WorkExperience>[]): string[];
    /**
     * Create regex pattern for technology with special character handling
     */
    private createTechRegex;
}
//# sourceMappingURL=TechnologyAnalysisService.d.ts.map