"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TechnologyAnalysisService_1 = require("../../../services/analysis/TechnologyAnalysisService");
describe('TechnologyAnalysisService', () => {
    let service;
    beforeEach(() => {
        service = new TechnologyAnalysisService_1.TechnologyAnalysisService();
        // Mock console.log to avoid noise in test output
        jest.spyOn(console, 'log').mockImplementation();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('extractTechnologiesFromExperience', () => {
        it('should extract technologies from work experience descriptions', () => {
            const workExperience = [
                {
                    position: 'Senior Software Engineer',
                    description: ['Developed applications using React and Node.js', 'Worked with AWS and Docker containers']
                },
                {
                    position: 'Full Stack Developer',
                    description: ['Built APIs with Python and Django', 'Used PostgreSQL database']
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toContain('React');
            expect(result).toContain('Node.js');
            expect(result).toContain('AWS');
            expect(result).toContain('Docker');
            expect(result).toContain('PostgreSQL');
        });
        it('should return technologies ordered by frequency', () => {
            const workExperience = [
                {
                    position: 'Developer',
                    description: ['Used JavaScript and React extensively', 'JavaScript was the main language']
                },
                {
                    position: 'Engineer',
                    description: ['Built with React and TypeScript', 'React components everywhere']
                },
                {
                    position: 'Consultant',
                    description: ['Python scripting and React development']
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            // React should appear first (3 occurrences), then JavaScript (2), then others
            expect(result[0]).toBe('React');
            expect(result[1]).toBe('JavaScript');
            expect(result).toContain('TypeScript');
            expect(result).toContain('Python');
        });
        it('should limit results to top 8 technologies', () => {
            const workExperience = [
                {
                    position: 'Full Stack Developer',
                    description: [
                        'JavaScript React Angular Vue Node.js Python Java C# .NET TypeScript AWS Docker Kubernetes PostgreSQL MongoDB Redis Git Jenkins'
                    ]
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toHaveLength(8);
            expect(result).toContain('JavaScript');
            expect(result).toContain('React');
            expect(result).toContain('Python');
        });
        it('should handle empty work experience array', () => {
            const result = service.extractTechnologiesFromExperience([]);
            expect(result).toEqual([]);
        });
        it('should handle work experience with no descriptions', () => {
            const workExperience = [
                { position: 'Developer' },
                { position: 'Engineer', description: [] }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toEqual([]);
        });
        it('should handle work experience with undefined/null descriptions', () => {
            const workExperience = [
                { position: 'Developer', description: undefined },
                { position: 'Engineer', description: null }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toEqual([]);
        });
        it('should extract technologies from position titles', () => {
            const workExperience = [
                { position: 'React Developer' },
                { position: 'Python Engineer' },
                { position: 'AWS Solutions Architect' }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toContain('React');
            expect(result).toContain('Python');
            expect(result).toContain('AWS');
        });
        it('should handle special technology names correctly', () => {
            const workExperience = [
                {
                    position: 'Software Engineer',
                    description: [
                        'Developed with .NET framework',
                        'Built Node.js APIs and ASP.NET applications',
                        'Worked with T-SQL databases'
                    ]
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toContain('.NET');
            expect(result).toContain('Node.js');
            expect(result).toContain('ASP.NET');
            expect(result).toContain('T-SQL');
        });
        it('should be case insensitive for technology matching', () => {
            const workExperience = [
                {
                    position: 'Developer',
                    description: [
                        'Used JAVASCRIPT and react',
                        'Worked with python and DOCKER',
                        'Built with TypeScript and aws'
                    ]
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toContain('JavaScript');
            expect(result).toContain('React');
            expect(result).toContain('Python');
            expect(result).toContain('Docker');
            expect(result).toContain('TypeScript');
            expect(result).toContain('AWS');
        });
        it('should handle technologies mentioned multiple times in same description', () => {
            const workExperience = [
                {
                    position: 'React Developer',
                    description: [
                        'Built React components using React hooks',
                        'Optimized React performance with React.memo',
                        'Tested React applications'
                    ]
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result[0]).toBe('React'); // Should be first due to high frequency
        });
        it('should handle complex work experience with multiple positions', () => {
            const workExperience = [
                {
                    position: 'Senior Full Stack Developer',
                    description: [
                        'Led development of React applications with TypeScript',
                        'Built REST APIs using Node.js and Express',
                        'Deployed applications on AWS using Docker containers',
                        'Managed PostgreSQL databases and Redis caching'
                    ]
                },
                {
                    position: 'Software Engineer',
                    description: [
                        'Implemented CI/CD pipelines with Jenkins',
                        'Used Kubernetes for container orchestration',
                        'Worked with MongoDB and SQL databases'
                    ]
                },
                {
                    position: 'Frontend Developer',
                    description: [
                        'Built responsive UIs with React and CSS',
                        'Used Webpack and Babel for build processes',
                        'Implemented state management with Redux'
                    ]
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toHaveLength(8);
            expect(result).toContain('React');
            expect(result).toContain('TypeScript');
            expect(result).toContain('Node.js');
            expect(result).toContain('AWS');
            expect(result).toContain('Docker');
            expect(result).toContain('PostgreSQL');
        });
        it('should ignore non-technology words', () => {
            const workExperience = [
                {
                    position: 'Project Manager',
                    description: [
                        'Managed team of developers working on various projects',
                        'Coordinated with stakeholders and clients',
                        'Used Agile methodologies and Scrum practices'
                    ]
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toContain('Agile');
            expect(result).toContain('Scrum');
            expect(result).not.toContain('team');
            expect(result).not.toContain('projects');
            expect(result).not.toContain('stakeholders');
        });
    });
    describe('createTechRegex', () => {
        it('should create correct regex for .NET', () => {
            const service_any = service;
            const regex = service_any.createTechRegex('.NET');
            expect('.NET'.match(regex)).toBeTruthy();
            expect('ASP.NET Core'.match(regex)).toBeTruthy();
            expect('NET'.match(regex)).toBeFalsy();
        });
        it('should create correct regex for Node.js', () => {
            const service_any = service;
            const regex = service_any.createTechRegex('Node.js');
            expect('Node.js'.match(regex)).toBeTruthy();
            expect('Built APIs with Node.js'.match(regex)).toBeTruthy();
            expect('Node'.match(regex)).toBeFalsy();
            expect('Nodejs'.match(regex)).toBeFalsy();
        });
        it('should create correct regex for T-SQL', () => {
            const service_any = service;
            const regex = service_any.createTechRegex('T-SQL');
            expect('T-SQL'.match(regex)).toBeTruthy();
            expect('Used T-SQL for queries'.match(regex)).toBeTruthy();
            expect('SQL'.match(regex)).toBeFalsy();
            expect('TSQL'.match(regex)).toBeFalsy();
        });
        it('should create correct regex for regular technologies', () => {
            const service_any = service;
            const regex = service_any.createTechRegex('JavaScript');
            expect('JavaScript'.match(regex)).toBeTruthy();
            expect('Used JavaScript extensively'.match(regex)).toBeTruthy();
            expect('JAVASCRIPT'.match(regex)).toBeTruthy();
            expect('javascript'.match(regex)).toBeTruthy();
            expect('Java'.match(regex)).toBeFalsy();
            expect('Script'.match(regex)).toBeFalsy();
        });
        it('should handle case insensitive matching', () => {
            const service_any = service;
            const technologies = ['React', 'Python', 'AWS', 'Docker'];
            technologies.forEach(tech => {
                const regex = service_any.createTechRegex(tech);
                expect(tech.toLowerCase().match(regex)).toBeTruthy();
                expect(tech.toUpperCase().match(regex)).toBeTruthy();
                expect(tech.match(regex)).toBeTruthy();
            });
        });
    });
    describe('edge cases and error handling', () => {
        it('should handle malformed work experience objects', () => {
            const workExperience = [
                {},
                { position: null, description: null },
                { position: undefined, description: undefined }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toEqual([]);
        });
        it('should handle very long descriptions', () => {
            const longDescription = 'JavaScript '.repeat(1000) + 'React '.repeat(500);
            const workExperience = [
                {
                    position: 'Developer',
                    description: [longDescription]
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result[0]).toBe('JavaScript');
            expect(result[1]).toBe('React');
        });
        it('should handle special characters in descriptions', () => {
            const workExperience = [
                {
                    position: 'Developer',
                    description: [
                        'Used React.js & Node.js for development',
                        'Built APIs using REST/GraphQL protocols'
                    ]
                }
            ];
            const result = service.extractTechnologiesFromExperience(workExperience);
            expect(result).toContain('React');
            expect(result).toContain('Node.js');
            expect(result).toContain('REST');
            expect(result).toContain('GraphQL');
        });
    });
});
//# sourceMappingURL=technologyAnalysisService.test.js.map