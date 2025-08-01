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
    ['first american title', 'www.firstam.com'],
    ['first american', 'www.firstam.com'],
    ['enterprise data concepts', 'www.enterprisedata.com'],
    ['enterprise data', 'www.enterprisedata.com'],
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
    // First check if it's in known companies
    if (this.knownCompanies.has(companyName.toLowerCase())) {
      return { name: companyName, website: this.knownCompanies.get(companyName.toLowerCase()) };
    }
    
    const apiKey = process.env.SERPAPI_KEY;
    const query = encodeURIComponent(companyName);
    const url = `${process.env.SERPAPI_URL}?q=${query}&api_key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const results = response.data.organic_results;

      if (results && results.length > 0) {
        // if not in known companies, add it
        if (!this.knownCompanies.has(companyName.toLowerCase())) {
          // verify it's a valid website
          if (await this.isValidWebsite(results[0].link)) {
            this.knownCompanies.set(companyName.toLowerCase(), results[0].link);
          }
        }
        return { name: companyName, website: results[0].link };
      }
      return { name: companyName };
    } catch (error) {
      console.error('Search failed:', error);
      return { name: companyName };
    }
  }

  /**
   * Check if a URL is a valid, accessible website
   */
  private async isValidWebsite(url: string): Promise<boolean> {
    try {
      await axios.head(url, {
        timeout: this.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });
      
      // If we reach here, the request succeeded and status was valid
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  }
