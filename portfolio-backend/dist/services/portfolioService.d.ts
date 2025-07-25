import { Portfolio, ParsedResumeData } from '../types/portfolio';
export declare class PortfolioService {
    private dataPath;
    constructor();
    private ensureDataDirectory;
    getPortfolio(): Promise<Portfolio | null>;
    updatePortfolioFromResume(parsedData: ParsedResumeData): Promise<Portfolio>;
    savePortfolio(portfolio: Portfolio): Promise<void>;
    updatePortfolio(updates: Partial<Portfolio>): Promise<Portfolio>;
}
//# sourceMappingURL=portfolioService.d.ts.map