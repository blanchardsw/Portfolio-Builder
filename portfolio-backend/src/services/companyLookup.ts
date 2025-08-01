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
    // Companies
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
    ['ainsworth', 'www.ainsworth.com.au'],
    // Educational Institutions
    ['university of louisiana at lafayette', 'louisiana.edu'],
    ['university of louisiana', 'louisiana.edu'],
    ['ull', 'louisiana.edu'],
    ['ul lafayette', 'louisiana.edu'],
    ['harvard university', 'harvard.edu'],
    ['harvard', 'harvard.edu'],
    ['stanford university', 'stanford.edu'],
    ['stanford', 'stanford.edu'],
    ['mit', 'mit.edu'],
    ['massachusetts institute of technology', 'mit.edu'],
    ['university of california berkeley', 'berkeley.edu'],
    ['uc berkeley', 'berkeley.edu'],
    ['university of texas at austin', 'utexas.edu'],
    ['ut austin', 'utexas.edu']
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
      // First check if it's a known company/institution
      const knownWebsite = this.knownCompanies.get(normalizedName);
      if (knownWebsite) {
        const fullUrl = knownWebsite.startsWith('http') ? knownWebsite : `https://${knownWebsite}`;
        if (await this.isValidWebsite(fullUrl)) {
          const result = {
            name: companyName,
            website: fullUrl,
            domain: new URL(fullUrl).hostname
          };
          this.cache.set(normalizedName, result);
          return result;
        }
      }
      
      // Try multiple strategies to find the company website
      const strategies = [
        () => this.trySearchEngineApproach(normalizedName), // Try Google search first
        () => this.tryDirectDomain(normalizedName),
        () => this.tryCommonDomainVariations(normalizedName)
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
   * Use Google search to find the actual company website
   */
  private async trySearchEngineApproach(normalizedName: string): Promise<CompanyInfo> {
    try {
      // Use a Google search query to find the company's official website
      const searchQuery = `${normalizedName} official website`;
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=5`;
      
      console.log(`Searching for: ${searchQuery}`);
      
      const response = await axios.get(googleSearchUrl, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Extract URLs from Google search results
      const html = response.data;
      const urlRegex = /href="\/url\?q=([^&]+)&/g;
      const urls: string[] = [];
      
      let match;
      while ((match = urlRegex.exec(html)) !== null) {
        try {
          const decodedUrl = decodeURIComponent(match[1]);
          if (this.isLikelyCompanyWebsite(decodedUrl, normalizedName)) {
            urls.push(decodedUrl);
          }
        } catch (e) {
          // Skip invalid URLs
          continue;
        }
      }
      
      // Try each URL to find the best match
      for (const url of urls.slice(0, 3)) { // Check top 3 results
        try {
          if (await this.isValidWebsite(url)) {
            console.log(`Found website for ${normalizedName}: ${url}`);
            return {
              name: normalizedName,
              website: url,
              domain: new URL(url).hostname
            };
          }
        } catch (e) {
          continue;
        }
      }
      
      throw new Error('No valid website found in search results');
    } catch (error) {
      console.log(`Google search failed for ${normalizedName}:`, error);
      throw new Error('Search approach failed');
    }
  }
  
  /**
   * Check if a URL is likely to be a company's official website
   */
  private isLikelyCompanyWebsite(url: string, companyName: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      const companyWords = companyName.toLowerCase().split(/\s+/);
      
      // Skip common non-company domains
      const skipDomains = ['google.com', 'facebook.com', 'linkedin.com', 'twitter.com', 'youtube.com', 'wikipedia.org', 'crunchbase.com', 'glassdoor.com'];
      if (skipDomains.some(domain => hostname.includes(domain))) {
        return false;
      }
      
      // Check if the domain contains company name words
      const domainParts = hostname.replace('www.', '').split('.');
      const mainDomain = domainParts[0];
      
      // Look for company name in domain
      for (const word of companyWords) {
        if (word.length > 2 && (mainDomain.includes(word) || word.includes(mainDomain))) {
          return true;
        }
      }
      
      // Check for exact matches or close matches
      const normalizedCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedDomain = mainDomain.replace(/[^a-z0-9]/g, '');
      
      if (normalizedDomain.includes(normalizedCompany) || normalizedCompany.includes(normalizedDomain)) {
        return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
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
