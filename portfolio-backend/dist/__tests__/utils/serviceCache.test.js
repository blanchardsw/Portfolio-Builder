"use strict";
/**
 * Unit tests for ServiceCache utility
 *
 * Tests cover:
 * - Singleton pattern implementation
 * - Service caching and reuse
 * - Factory method functionality
 * - Performance optimization
 */
Object.defineProperty(exports, "__esModule", { value: true });
const serviceCache_1 = require("../../utils/serviceCache");
const resumeParser_1 = require("../../services/resumeParser");
const portfolioService_1 = require("../../services/portfolioService");
const fileSecurityService_1 = require("../../services/fileSecurityService");
// Mock all services to avoid real instantiation
jest.mock('../../services/resumeParser');
jest.mock('../../services/portfolioService');
jest.mock('../../services/fileSecurityService');
describe('ServiceCache', () => {
    beforeEach(() => {
        // Clear any cached services before each test
        serviceCache_1.serviceCache.services.clear();
        jest.clearAllMocks();
    });
    describe('singleton pattern', () => {
        it('should return the same instance', () => {
            const instance1 = serviceCache_1.serviceCache;
            const instance2 = serviceCache_1.serviceCache;
            expect(instance1).toBe(instance2);
        });
    });
    describe('service caching', () => {
        it('should create and cache ResumeParser service', () => {
            const parser1 = serviceCache_1.serviceCache.getResumeParser();
            const parser2 = serviceCache_1.serviceCache.getResumeParser();
            expect(parser1).toBeDefined();
            expect(parser1).toBe(parser2); // Should return same cached instance
            expect(resumeParser_1.ResumeParser).toHaveBeenCalledTimes(1); // Constructor called only once
        });
        it('should create and cache PortfolioService service', () => {
            const service1 = serviceCache_1.serviceCache.getPortfolioService();
            const service2 = serviceCache_1.serviceCache.getPortfolioService();
            expect(service1).toBeDefined();
            expect(service1).toBe(service2); // Should return same cached instance
            expect(portfolioService_1.PortfolioService).toHaveBeenCalledTimes(1); // Constructor called only once
        });
        it('should create and cache FileSecurityService service', () => {
            const service1 = serviceCache_1.serviceCache.getFileSecurityService();
            const service2 = serviceCache_1.serviceCache.getFileSecurityService();
            expect(service1).toBeDefined();
            expect(service1).toBe(service2); // Should return same cached instance
            expect(fileSecurityService_1.FileSecurityService).toHaveBeenCalledTimes(1); // Constructor called only once
        });
        // LinkedIn photo service was removed - test removed
    });
    describe('generic service caching', () => {
        it('should cache custom services using getService method', () => {
            const mockFactory = jest.fn(() => ({ test: 'service' }));
            const service1 = serviceCache_1.serviceCache.getService('testService', mockFactory);
            const service2 = serviceCache_1.serviceCache.getService('testService', mockFactory);
            expect(service1).toBeDefined();
            expect(service1).toBe(service2); // Should return same cached instance
            expect(mockFactory).toHaveBeenCalledTimes(1); // Factory called only once
            expect(service1).toEqual({ test: 'service' });
        });
        it('should create different instances for different service keys', () => {
            const factory1 = jest.fn(() => ({ service: 'one' }));
            const factory2 = jest.fn(() => ({ service: 'two' }));
            const service1 = serviceCache_1.serviceCache.getService('service1', factory1);
            const service2 = serviceCache_1.serviceCache.getService('service2', factory2);
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
                serviceCache_1.serviceCache.getResumeParser(),
                serviceCache_1.serviceCache.getResumeParser(),
                serviceCache_1.serviceCache.getPortfolioService(),
                serviceCache_1.serviceCache.getPortfolioService(),
                serviceCache_1.serviceCache.getFileSecurityService(),
                serviceCache_1.serviceCache.getFileSecurityService()
            ];
            // Each service constructor should be called only once
            expect(resumeParser_1.ResumeParser).toHaveBeenCalledTimes(1);
            expect(portfolioService_1.PortfolioService).toHaveBeenCalledTimes(1);
            expect(fileSecurityService_1.FileSecurityService).toHaveBeenCalledTimes(1);
            // Services should be properly cached
            expect(services[0]).toBe(services[1]); // ResumeParser instances
            expect(services[2]).toBe(services[3]); // PortfolioService instances
            expect(services[4]).toBe(services[5]); // FileSecurityService instances
        });
    });
});
//# sourceMappingURL=serviceCache.test.js.map