/**
 * Unit tests for ServiceCache utility
 * 
 * Tests cover:
 * - Singleton pattern implementation
 * - Service caching and reuse
 * - Factory method functionality
 * - Performance optimization
 */

import { serviceCache } from '../../utils/serviceCache';
import { ResumeParser } from '../../services/resumeParser';
import { PortfolioService } from '../../services/portfolioService';
import { FileSecurityService } from '../../services/fileSecurityService';
import { LinkedInPhotoService } from '../../services/linkedinPhotoService';

// Mock all services to avoid real instantiation
jest.mock('../../services/resumeParser');
jest.mock('../../services/portfolioService');
jest.mock('../../services/fileSecurityService');
jest.mock('../../services/linkedinPhotoService');

describe('ServiceCache', () => {
  beforeEach(() => {
    // Clear any cached services before each test
    (serviceCache as any).services.clear();
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = serviceCache;
      const instance2 = serviceCache;
      expect(instance1).toBe(instance2);
    });
  });

  describe('service caching', () => {
    it('should create and cache ResumeParser service', () => {
      const parser1 = serviceCache.getResumeParser();
      const parser2 = serviceCache.getResumeParser();
      
      expect(parser1).toBeDefined();
      expect(parser1).toBe(parser2); // Should return same cached instance
      expect(ResumeParser).toHaveBeenCalledTimes(1); // Constructor called only once
    });

    it('should create and cache PortfolioService service', () => {
      const service1 = serviceCache.getPortfolioService();
      const service2 = serviceCache.getPortfolioService();
      
      expect(service1).toBeDefined();
      expect(service1).toBe(service2); // Should return same cached instance
      expect(PortfolioService).toHaveBeenCalledTimes(1); // Constructor called only once
    });

    it('should create and cache FileSecurityService service', () => {
      const service1 = serviceCache.getFileSecurityService();
      const service2 = serviceCache.getFileSecurityService();
      
      expect(service1).toBeDefined();
      expect(service1).toBe(service2); // Should return same cached instance
      expect(FileSecurityService).toHaveBeenCalledTimes(1); // Constructor called only once
    });

    it('should create and cache LinkedInPhotoService service', () => {
      const service1 = serviceCache.getLinkedInPhotoService();
      const service2 = serviceCache.getLinkedInPhotoService();
      
      expect(service1).toBeDefined();
      expect(service1).toBe(service2); // Should return same cached instance
      expect(LinkedInPhotoService).toHaveBeenCalledTimes(1); // Constructor called only once
    });
  });

  describe('generic service caching', () => {
    it('should cache custom services using getService method', () => {
      const mockFactory = jest.fn(() => ({ test: 'service' }));
      
      const service1 = serviceCache.getService('testService', mockFactory);
      const service2 = serviceCache.getService('testService', mockFactory);
      
      expect(service1).toBeDefined();
      expect(service1).toBe(service2); // Should return same cached instance
      expect(mockFactory).toHaveBeenCalledTimes(1); // Factory called only once
      expect(service1).toEqual({ test: 'service' });
    });

    it('should create different instances for different service keys', () => {
      const factory1 = jest.fn(() => ({ service: 'one' }));
      const factory2 = jest.fn(() => ({ service: 'two' }));
      
      const service1 = serviceCache.getService('service1', factory1);
      const service2 = serviceCache.getService('service2', factory2);
      
      expect(service1).not.toBe(service2);
      expect(factory1).toHaveBeenCalledTimes(1);
      expect(factory2).toHaveBeenCalledTimes(1);
      expect(service1).toEqual({ service: 'one' });
      expect(service2).toEqual({ service: 'two' });
    });
  });

  describe('performance optimization', () => {
    it('should avoid recreating expensive service instances', () => {
      // Simulate multiple requests for the same service
      const services = [
        serviceCache.getResumeParser(),
        serviceCache.getResumeParser(),
        serviceCache.getPortfolioService(),
        serviceCache.getPortfolioService(),
        serviceCache.getFileSecurityService(),
        serviceCache.getFileSecurityService()
      ];
      
      // Each service constructor should be called only once
      expect(ResumeParser).toHaveBeenCalledTimes(1);
      expect(PortfolioService).toHaveBeenCalledTimes(1);
      expect(FileSecurityService).toHaveBeenCalledTimes(1);
      
      // Services should be properly cached
      expect(services[0]).toBe(services[1]); // ResumeParser instances
      expect(services[2]).toBe(services[3]); // PortfolioService instances
      expect(services[4]).toBe(services[5]); // FileSecurityService instances
    });
  });
});
