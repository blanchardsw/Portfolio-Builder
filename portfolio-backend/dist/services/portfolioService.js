"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PortfolioService {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/portfolio.json');
        this.ensureDataDirectory();
    }
    ensureDataDirectory() {
        const dataDir = path.dirname(this.dataPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }
    async getPortfolio() {
        try {
            if (!fs.existsSync(this.dataPath)) {
                return null;
            }
            const data = fs.readFileSync(this.dataPath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error reading portfolio data:', error);
            return null;
        }
    }
    async updatePortfolioFromResume(parsedData) {
        const existingPortfolio = await this.getPortfolio();
        const portfolio = {
            personalInfo: {
                name: parsedData.personalInfo.name || existingPortfolio?.personalInfo.name || '',
                email: parsedData.personalInfo.email || existingPortfolio?.personalInfo.email || '',
                phone: parsedData.personalInfo.phone || existingPortfolio?.personalInfo.phone,
                location: parsedData.personalInfo.location || existingPortfolio?.personalInfo.location,
                linkedin: parsedData.personalInfo.linkedin || existingPortfolio?.personalInfo.linkedin,
                github: parsedData.personalInfo.github || existingPortfolio?.personalInfo.github,
                website: parsedData.personalInfo.website || existingPortfolio?.personalInfo.website,
                summary: parsedData.personalInfo.summary || existingPortfolio?.personalInfo.summary
            },
            workExperience: parsedData.workExperience.map((exp, index) => ({
                id: exp.id || `exp_${index + 1}`,
                company: exp.company || '',
                position: exp.position || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate,
                current: exp.current || false,
                description: exp.description || [],
                technologies: exp.technologies || [],
                location: exp.location
            })),
            education: parsedData.education.map((edu, index) => ({
                id: edu.id || `edu_${index + 1}`,
                institution: edu.institution || '',
                degree: edu.degree || '',
                field: edu.field || '',
                startDate: edu.startDate || '',
                endDate: edu.endDate,
                gpa: edu.gpa,
                honors: edu.honors || [],
                coursework: edu.coursework || []
            })),
            skills: parsedData.skills.map(skill => ({
                name: skill.name || '',
                category: skill.category || 'technical',
                level: skill.level
            })),
            projects: parsedData.projects.map((proj, index) => ({
                id: proj.id || `proj_${index + 1}`,
                name: proj.name || '',
                description: proj.description || '',
                technologies: proj.technologies || [],
                url: proj.url,
                github: proj.github,
                startDate: proj.startDate,
                endDate: proj.endDate
            })),
            lastUpdated: new Date().toISOString()
        };
        await this.savePortfolio(portfolio);
        return portfolio;
    }
    async savePortfolio(portfolio) {
        try {
            fs.writeFileSync(this.dataPath, JSON.stringify(portfolio, null, 2));
        }
        catch (error) {
            console.error('Error saving portfolio data:', error);
            throw new Error('Failed to save portfolio data');
        }
    }
    async updatePortfolio(updates) {
        const existingPortfolio = await this.getPortfolio();
        const updatedPortfolio = {
            ...existingPortfolio,
            ...updates,
            lastUpdated: new Date().toISOString()
        };
        await this.savePortfolio(updatedPortfolio);
        return updatedPortfolio;
    }
}
exports.PortfolioService = PortfolioService;
//# sourceMappingURL=portfolioService.js.map