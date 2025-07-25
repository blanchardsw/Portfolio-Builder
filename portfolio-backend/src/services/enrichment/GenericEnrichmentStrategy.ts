import { IEnrichmentStrategy, IEnrichmentData } from './IEnrichmentStrategy';
import { CompanyLookupService } from '../companyLookup';

/**
 * Generic enrichment strategy following Strategy Pattern and DRY principles
 * Eliminates code duplication between company and education enrichment
 */
export class GenericEnrichmentStrategy<T> implements IEnrichmentStrategy<T> {
  private enrichmentData: IEnrichmentData;
  private companyLookup: CompanyLookupService;
  private entityType: string;

  constructor(enrichmentData: IEnrichmentData, companyLookup: CompanyLookupService, entityType: string) {
    this.enrichmentData = enrichmentData;
    this.companyLookup = companyLookup;
    this.entityType = entityType;
  }

  async enrich(items: Partial<T>[]): Promise<Partial<T>[]> {
    const knownMappings = this.enrichmentData.getKnownMappings();

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const entityName = this.enrichmentData.getKeyFromItem(item);
        
        if (!entityName || entityName.trim().length === 0) {
          return item;
        }

        const normalizedName = this.enrichmentData.normalizeKey(entityName);
        console.log(`[DEBUG] Processing ${this.entityType}: "${entityName}" -> normalized: "${normalizedName}"`);

        // Fast lookup in known mappings
        const website = this.findInKnownMappings(normalizedName, knownMappings);
        if (website) {
          console.log(`[DEBUG] FAST MATCH FOUND! "${normalizedName}" -> ${website}`);
          return {
            ...item,
            website: website
          };
        }

        // Fallback to internet search
        console.log(`[DEBUG] No fast match found for "${normalizedName}", searching internet...`);
        try {
          const searchResult = await this.companyLookup.findCompanyWebsite(entityName);
          if (searchResult.website) {
            console.log(`[DEBUG] INTERNET SEARCH SUCCESS! Found website for "${entityName}" -> ${searchResult.website}`);
            return {
              ...item,
              website: searchResult.website
            };
          }
        } catch (error) {
          console.log(`[DEBUG] Internet search failed for "${entityName}":`, error);
        }

        console.log(`[DEBUG] No website found for "${normalizedName}"`);
        return item;
      })
    );

    return enrichedItems;
  }

  private findInKnownMappings(normalizedName: string, knownMappings: { [key: string]: string }): string | null {
    for (const [key, website] of Object.entries(knownMappings)) {
      if (this.isMatch(normalizedName, key)) {
        return website;
      }
    }
    return null;
  }

  private isMatch(normalizedName: string, key: string): boolean {
    return normalizedName === key || 
           normalizedName.includes(key) || 
           key.includes(normalizedName);
  }
}
