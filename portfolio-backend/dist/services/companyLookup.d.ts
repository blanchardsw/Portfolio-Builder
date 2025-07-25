export interface CompanyInfo {
    name: string;
    website?: string;
    domain?: string;
}
export declare class CompanyLookupService {
    private cache;
    private readonly timeout;
    /**
     * Find the homepage URL for a company
     * @param companyName The name of the company to look up
     * @returns CompanyInfo with website URL if found, or just the name if not found
     */
    findCompanyWebsite(companyName: string): Promise<CompanyInfo>;
    /**
     * Normalize company name for consistent lookup
     */
    private normalizeCompanyName;
    /**
     * Try direct domain approach (company.com, companyname.com)
     */
    private tryDirectDomain;
    /**
     * Try common domain variations
     */
    private tryCommonDomainVariations;
    /**
     * Try a simple search-based approach using known company mappings
     */
    private trySearchEngineApproach;
    /**
     * Check if a URL is a valid, accessible website
     */
    private isValidWebsite;
    /**
     * Batch lookup multiple companies
     */
    findMultipleCompanyWebsites(companyNames: string[]): Promise<CompanyInfo[]>;
    /**
     * Clear the cache
     */
    clearCache(): void;
}
//# sourceMappingURL=companyLookup.d.ts.map