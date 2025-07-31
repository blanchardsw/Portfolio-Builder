/**
 * Service cache to avoid recreating expensive service instances
 * Improves performance by reusing service instances across requests
 */

import { ResumeParser } from '../services/resumeParser';
import { PortfolioService } from '../services/portfolioService';
import { FileSecurityService } from '../services/fileSecurityService';


class ServiceCache {
  private static instance: ServiceCache;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ServiceCache {
    if (!ServiceCache.instance) {
      ServiceCache.instance = new ServiceCache();
    }
    return ServiceCache.instance;
  }

  /**
   * Get or create a service instance
   */
  getService<T>(serviceKey: string, factory: () => T): T {
    if (!this.services.has(serviceKey)) {
      console.log(`🏭 Creating new ${serviceKey} service instance`);
      this.services.set(serviceKey, factory());
    }
    return this.services.get(serviceKey);
  }

  /**
   * Get cached ResumeParser instance
   */
  getResumeParser(): ResumeParser {
    return this.getService('resumeParser', () => new ResumeParser());
  }

  /**
   * Get cached PortfolioService instance
   */
  getPortfolioService(): PortfolioService {
    return this.getService('portfolioService', () => new PortfolioService());
  }

  /**
   * Get cached FileSecurityService instance
   */
  getFileSecurityService(): FileSecurityService {
    return this.getService('fileSecurityService', () => new FileSecurityService());
  }



  /**
   * Clear all cached services (useful for testing or memory management)
   */
  clearCache(): void {
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

export const serviceCache = ServiceCache.getInstance();
export default serviceCache;
