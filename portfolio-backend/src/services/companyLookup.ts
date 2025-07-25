import axios from 'axios';

export interface CompanyInfo {
  name: string;
  website?: string;
  domain?: string;
}

export class CompanyLookupService {
  private cache: Map<string, CompanyInfo> = new Map();
  private readonly timeout = 5000; // 5 second timeout
  private knownCompanies: Map<string, string> = new Map([
    ['google', 'www.google.com'],
    ['microsoft', 'www.microsoft.com'],
    ['apple', 'www.apple.com'],
    ['amazon', 'www.amazon.com'],
    ['facebook', 'www.facebook.com'],
    ['meta', 'www.meta.com'],
    ['netflix', 'www.netflix.com'],
    ['spotify', 'www.spotify.com'],
    ['airbnb', 'www.airbnb.com'],
    ['uber', 'www.uber.com'],
    ['lyft', 'www.lyft.com'],
    ['tesla', 'www.tesla.com'],
    ['kaseya', 'www.kaseya.com'],
    ['ainsworth game technology', 'www.ainsworth.com.au'],
    ['ainsworth', 'www.ainsworth.com.au']
  ]);

  /**
   * Find the homepage URL for a company
   * @param companyName The name of the company to look up
   * @returns CompanyInfo with website URL if found, or just the name if not found
   */
  async findCompanyWebsite(companyName: string): Promise<CompanyInfo> {
    if (!companyName || companyName.trim().length === 0) {
      return { name: companyName };
    }

    const normalizedName = this.normalizeCompanyName(companyName);
    
    // Check cache first
    if (this.cache.has(normalizedName)) {
      return this.cache.get(normalizedName)!;
    }

    try {
      // Try multiple strategies to find the company website
      const strategies = [
        () => this.tryDirectDomain(normalizedName),
        () => this.tryCommonDomainVariations(normalizedName),
        () => this.trySearchEngineApproach(normalizedName)
      ];

      for (const strategy of strategies) {
        try {
          const result = await strategy();
          if (result.website) {
            this.cache.set(normalizedName, result);
            return result;
          }
        } catch (error) {
          // Continue to next strategy
          continue;
        }
      }

      // If no website found, cache the result without website
      const result = { name: companyName };
      this.cache.set(normalizedName, result);
      return result;

    } catch (error) {
      console.log(`Could not find website for ${companyName}:`, error);
      return { name: companyName };
    }
  }

  /**
   * Normalize company name for consistent lookup
   */
  private normalizeCompanyName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(inc|corp|corporation|ltd|limited|llc|company|co)\b\.?/g, '')
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Try direct domain approach (company.com, companyname.com)
   */
  private async tryDirectDomain(normalizedName: string): Promise<CompanyInfo> {
    const domainName = normalizedName.replace(/\s+/g, '');
    const commonTlds = ['com', 'net', 'org'];

    for (const tld of commonTlds) {
      const domain = `${domainName}.${tld}`;
      const url = `https://${domain}`;
      
      if (await this.isValidWebsite(url)) {
        return {
          name: normalizedName,
          website: url,
          domain: domain
        };
      }
    }

    throw new Error('Direct domain not found');
  }

  /**
   * Try common domain variations
   */
  private async tryCommonDomainVariations(normalizedName: string): Promise<CompanyInfo> {
    const words = normalizedName.split(' ');
    const variations = [
      words.join(''),           // concatenated
      words.join('-'),          // hyphenated
      words[0],                 // first word only
      words.slice(0, 2).join('') // first two words
    ];

    const commonTlds = ['com', 'net', 'org'];

    for (const variation of variations) {
      for (const tld of commonTlds) {
        const domain = `${variation}.${tld}`;
        const url = `https://${domain}`;
        
        if (await this.isValidWebsite(url)) {
          return {
            name: normalizedName,
            website: url,
            domain: domain
          };
        }
      }
    }

    throw new Error('Domain variations not found');
  }

  /**
   * Try a simple search-based approach using known company mappings
   */
  private async trySearchEngineApproach(normalizedName: string): Promise<CompanyInfo> {
    // Known company mappings for common companies
    const knownCompanies: { [key: string]: string } = {
      'google': 'https://www.google.com',
      'microsoft': 'https://www.microsoft.com',
      'apple': 'https://www.apple.com',
      'amazon': 'https://www.amazon.com',
      'facebook': 'https://www.facebook.com',
      'meta': 'https://www.meta.com',
      'netflix': 'https://www.netflix.com',
      'spotify': 'https://www.spotify.com',
      'airbnb': 'https://www.airbnb.com',
      'uber': 'https://www.uber.com',
      'lyft': 'https://www.lyft.com',
      'tesla': 'https://www.tesla.com',
      'kaseya': 'https://www.kaseya.com',
      'ainsworth game technology': 'https://www.ainsworth.com.au',
      'ainsworth': 'https://www.ainsworth.com.au'
    };

    const lowerName = normalizedName.toLowerCase();
    for (const [key, url] of Object.entries(knownCompanies)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        if (await this.isValidWebsite(url)) {
          return {
            name: normalizedName,
            website: url,
            domain: new URL(url).hostname
          };
        }
      }
    }

    throw new Error('Search approach not found');
  }

  /**
   * Check if a URL is a valid, accessible website
   */
  private async isValidWebsite(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, {
        timeout: this.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });
      
      return response.status >= 200 && response.status < 400;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a simple domain pattern for fast lookup (no HTTP validation)
   */
  private generateSimpleDomain(companyName: string): string | null {
    const cleaned = companyName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .replace(/inc$|llc$|corp$|corporation$|company$|co$|ltd$|limited$/, '')
      .trim();
    
    if (cleaned.length < 2) {
      return null;
    }
    
    // Only return for well-known patterns
    const commonPatterns = [
      'google', 'microsoft', 'apple', 'amazon', 'facebook', 'meta',
      'netflix', 'spotify', 'airbnb', 'uber', 'lyft', 'tesla',
      'adobe', 'salesforce', 'oracle', 'ibm', 'intel', 'nvidia'
    ];
    
    if (commonPatterns.includes(cleaned)) {
      return `${cleaned}.com`;
    }
    
    return null;
  }

  /**
   * Batch lookup multiple companies
   */
  async findMultipleCompanyWebsites(companyNames: string[]): Promise<CompanyInfo[]> {
    const promises = companyNames.map(name => this.findCompanyWebsite(name));
    return Promise.all(promises);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
