/**
 * Service cache to avoid recreating expensive service instances
 * Improves performance by reusing service instances across requests
 */
import { ResumeParser } from '../services/resumeParser';
import { PortfolioService } from '../services/portfolioService';
import { FileSecurityService } from '../services/fileSecurityService';
declare class ServiceCache {
    private static instance;
    private services;
    private constructor();
    static getInstance(): ServiceCache;
    /**
     * Get or create a service instance
     */
    getService<T>(serviceKey: string, factory: () => T): T;
    /**
     * Get cached ResumeParser instance
     */
    getResumeParser(): ResumeParser;
    /**
     * Get cached PortfolioService instance
     */
    getPortfolioService(): PortfolioService;
    /**
     * Get cached FileSecurityService instance
     */
    getFileSecurityService(): FileSecurityService;
    /**
     * Clear all cached services (useful for testing or memory management)
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        cachedServices: string[];
        count: number;
    };
}
export declare const serviceCache: ServiceCache;
export default serviceCache;
//# sourceMappingURL=serviceCache.d.ts.map