"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnologyAnalysisService = void 0;
/**
 * Service for analyzing technologies in work experience
 * Follows Single Responsibility Principle
 */
class TechnologyAnalysisService {
    constructor() {
        this.techKeywords = [
            'C#', '.NET', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js',
            'Python', 'Java', 'C++', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
            'PostgreSQL', 'MySQL', 'Redis', 'REST', 'GraphQL', 'Git', 'Jenkins', 'CI/CD',
            'Agile', 'Scrum', 'T-SQL', 'DynamoDB', 'OpenSearch', 'Kafka', 'SQS', 'S3',
            'Ruby', 'Cucumber', 'Entity Framework', 'ASP.NET', 'HTML', 'CSS', 'SASS',
            'Webpack', 'Babel', 'Express', 'Spring', 'Django', 'Flask', 'Laravel'
        ];
    }
    /**
     * Extract technologies ordered by frequency from work experience
     */
    extractTechnologiesFromExperience(workExperience) {
        const techCounts = new Map();
        // Count occurrences of each technology
        for (const exp of workExperience) {
            const text = `${exp.position || ''} ${exp.description?.join(' ') || ''}`;
            for (const tech of this.techKeywords) {
                const regex = this.createTechRegex(tech);
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
     * Create regex pattern for technology with special character handling
     */
    createTechRegex(tech) {
        switch (tech) {
            case 'C#':
                return /C#(?:\/\.NET|\/\.Net|\b)/gi;
            case 'C++':
                return /\bC\+\+\b/gi;
            case '.NET':
                return /\.NET\b/gi;
            case 'ASP.NET':
                return /\bASP\.NET\b/gi;
            case 'Node.js':
                return /\bNode\.js\b/gi;
            case 'Vue.js':
                return /\bVue\.js\b/gi;
            case 'Next.js':
                return /\bNext\.js\b/gi;
            case 'Express.js':
                return /\bExpress\.js\b/gi;
            case 'D3.js':
                return /\bD3\.js\b/gi;
            case 'Chart.js':
                return /\bChart\.js\b/gi;
            case 'Three.js':
                return /\bThree\.js\b/gi;
            case 'Objective-C':
                return /\bObjective-C\b/gi;
            case 'F#':
                return /\bF#\b/gi;
            case 'Q#':
                return /\bQ#\b/gi;
            case 'T-SQL':
                return /\bT-SQL\b/gi;
            case 'PL/SQL':
                return /\bPL\/SQL\b/gi;
            case 'X++':
                return /\bX\+\+\b/gi;
            default:
                const escapedTech = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return new RegExp(`\\b${escapedTech}\\b`, 'gi');
        }
    }
}
exports.TechnologyAnalysisService = TechnologyAnalysisService;
//# sourceMappingURL=TechnologyAnalysisService.js.map