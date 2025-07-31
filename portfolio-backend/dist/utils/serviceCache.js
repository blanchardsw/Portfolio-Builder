"use strict";
/**
 * Service cache to avoid recreating expensive service instances
 * Improves performance by reusing service instances across requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceCache = void 0;
const resumeParser_1 = require("../services/resumeParser");
const portfolioService_1 = require("../services/portfolioService");
const fileSecurityService_1 = require("../services/fileSecurityService");
class ServiceCache {
    constructor() {
        this.services = new Map();
    }
    static getInstance() {
        if (!ServiceCache.instance) {
            ServiceCache.instance = new ServiceCache();
        }
        return ServiceCache.instance;
    }
    /**
     * Get or create a service instance
     */
    getService(serviceKey, factory) {
        if (!this.services.has(serviceKey)) {
            console.log(`🏭 Creating new ${serviceKey} service instance`);
            this.services.set(serviceKey, factory());
        }
        return this.services.get(serviceKey);
    }
    /**
     * Get cached ResumeParser instance
     */
    getResumeParser() {
        return this.getService('resumeParser', () => new resumeParser_1.ResumeParser());
    }
    /**
     * Get cached PortfolioService instance
     */
    getPortfolioService() {
        return this.getService('portfolioService', () => new portfolioService_1.PortfolioService());
    }
    /**
     * Get cached FileSecurityService instance
     */
    getFileSecurityService() {
        return this.getService('fileSecurityService', () => new fileSecurityService_1.FileSecurityService());
    }
    /**
     * Clear all cached services (useful for testing or memory management)
     */
    clearCache() {
        console.log('🗑️ Clearing service cache');
        this.services.clear();
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            cachedServices: Array.from(this.services.keys()),
            count: this.services.size
        };
    }
}
exports.serviceCache = ServiceCache.getInstance();
exports.default = exports.serviceCache;
//# sourceMappingURL=serviceCache.js.map