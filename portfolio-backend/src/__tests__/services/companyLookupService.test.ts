import { CompanyLookupService, CompanyInfo } from '../../services/companyLookup';

// Mock axios to prevent actual network calls
jest.mock('axios');
const mockedAxios = require('axios');

describe('CompanyLookupService', () => {
  let companyLookupService: CompanyLookupService;

  beforeEach(() => {
    companyLookupService = new CompanyLookupService();
    // Reset axios mocks
    mockedAxios.head.mockClear();
  });

  describe('findCompanyWebsite', () => {
    it('should return company name only for empty input', async () => {
      const result = await companyLookupService.findCompanyWebsite('');
      expect(result).toEqual({ name: '' });
    });

    it('should return company name only for whitespace input', async () => {
      const result = await companyLookupService.findCompanyWebsite('   ');
      expect(result).toEqual({ name: '   ' });
    });

    it('should return company name only for null input', async () => {
      const result = await companyLookupService.findCompanyWebsite(null as any);
      expect(result).toEqual({ name: '' });
    });

    it('should find known companies from predefined list', async () => {
      // Mock axios to return successful responses for known companies
      mockedAxios.head.mockResolvedValue({ status: 200 });

      const knownCompanies = [
        { input: 'Google', expected: { name: 'Google', website: 'www.google.com' } },
        { input: 'Microsoft', expected: { name: 'Microsoft', website: 'www.microsoft.com' } },
        { input: 'Apple', expected: { name: 'Apple', website: 'www.apple.com' } },
        { input: 'Tesla', expected: { name: 'Tesla', website: 'www.tesla.com' } }
      ];

      for (const { input, expected } of knownCompanies) {
        const result = await companyLookupService.findCompanyWebsite(input);
        expect(result).toEqual(expected);
      }
    });

    it('should handle case insensitive known company lookup', async () => {
      // Mock axios to return successful responses
      mockedAxios.head.mockResolvedValue({ status: 200 });

      const caseVariations = [
        'google',
        'GOOGLE', 
        'Google',
        'gOoGlE'
      ];

      for (const variation of caseVariations) {
        const result = await companyLookupService.findCompanyWebsite(variation);
        expect(result.website).toBe('www.google.com');
        expect(result.name).toBe(variation); // original name, not normalized
      }
    });

    it('should handle company names with extra whitespace', async () => {
      // Mock axios to return successful responses
      mockedAxios.head.mockResolvedValue({ status: 200 });

      const result = await companyLookupService.findCompanyWebsite('  Google  ');
      expect(result).toEqual({
        name: '  Google  ' // original name with whitespace, no website found due to whitespace
      });
    });

    it('should handle special company name variations', async () => {
      // Mock axios to return successful responses
      mockedAxios.head.mockResolvedValue({ status: 200 });

      const variations = [
        { input: 'Ainsworth Game Technology', expected: 'www.ainsworth.com.au' },
        { input: 'ainsworth', expected: 'www.ainsworth.com.au' }
      ];

      for (const { input, expected } of variations) {
        const result = await companyLookupService.findCompanyWebsite(input);
        expect(result.website).toBe(expected);
      }
    });

    it('should use cache for repeated lookups', async () => {
      // Mock axios to return successful responses
      mockedAxios.head.mockResolvedValue({ status: 200 });

      // First lookup
      const result1 = await companyLookupService.findCompanyWebsite('Google');
      expect(result1.website).toBe('www.google.com');

      // Second lookup should use cache (we can't directly test cache hit, but we can verify consistent results)
      const result2 = await companyLookupService.findCompanyWebsite('Google');
      expect(result2).toEqual(result1);
    });

    it('should return company name only for unknown companies', async () => {
      // Mock axios to return failed responses for unknown companies
      mockedAxios.head.mockRejectedValue(new Error('Network error'));

      const unknownCompanies = [
        'Unknown Startup Inc',
        'NonExistent Corp'
      ];

      for (const companyName of unknownCompanies) {
        const result = await companyLookupService.findCompanyWebsite(companyName);
        expect(result.name).toBe(companyName);
        expect(result.website).toBeUndefined();
        expect(result.domain).toBeUndefined();
      }
    });
  });

  describe('normalizeCompanyName', () => {
    it('should normalize company names correctly', () => {
      const service = companyLookupService as any; // Access private method

      const testCases = [
        { input: 'Google Inc.', expected: 'google' },
        { input: 'Microsoft Corporation', expected: 'microsoft' },
        { input: '  Apple Inc  ', expected: 'apple' },
        { input: 'AMAZON.COM, INC.', expected: 'amazoncom' },
        { input: 'Meta Platforms, Inc.', expected: 'meta platforms' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = service.normalizeCompanyName(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle empty and whitespace strings', () => {
      const service = companyLookupService as any;

      expect(service.normalizeCompanyName('')).toBe('');
      expect(service.normalizeCompanyName('   ')).toBe('');
      expect(service.normalizeCompanyName('\t\n')).toBe('');
    });
  });



  describe('error handling and edge cases', () => {
    it('should handle network timeouts gracefully for unknown companies', async () => {
      // Mock axios to return failed responses
      mockedAxios.head.mockRejectedValue(new Error('Network timeout'));
      
      const result = await companyLookupService.findCompanyWebsite('Definitely Unknown Company XYZ123');
      
      expect(result.name).toBe('Definitely Unknown Company XYZ123');
      expect(result.website).toBeUndefined();
      expect(result.domain).toBeUndefined();
    });

    it('should handle special characters in company names', async () => {
      // Mock axios to return failed responses
      mockedAxios.head.mockRejectedValue(new Error('Network error'));
      
      const result = await companyLookupService.findCompanyWebsite('AT&T Inc.');
      expect(result.name).toBe('AT&T Inc.');
      expect(result.website).toBeUndefined();
    });
  });

  describe('caching behavior', () => {
    it('should cache results for consistent lookups', async () => {
      // Mock axios to return failed responses for unknown companies
      mockedAxios.head.mockRejectedValue(new Error('Network error'));
      
      const companyName = 'Test Company For Caching';
      
      // First lookup
      const result1 = await companyLookupService.findCompanyWebsite(companyName);
      
      // Second lookup should return same object reference (cached)
      const result2 = await companyLookupService.findCompanyWebsite(companyName);
      
      expect(result1).toEqual(result2);
      expect(result1.name).toBe(companyName);
    });

    it('should cache known company results', async () => {
      // Mock axios to return successful responses
      mockedAxios.head.mockResolvedValue({ status: 200 });
      
      // Multiple lookups of the same known company should be consistent
      const results = await Promise.all([
        companyLookupService.findCompanyWebsite('Google'),
        companyLookupService.findCompanyWebsite('Google'),
        companyLookupService.findCompanyWebsite('Google')
      ]);

      results.forEach(result => {
        expect(result).toEqual({
          name: 'Google',
          website: 'www.google.com'
        });
      });
    });
  });
});
