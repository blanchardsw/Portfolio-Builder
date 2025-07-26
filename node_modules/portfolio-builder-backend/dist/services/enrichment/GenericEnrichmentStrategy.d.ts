import { IEnrichmentStrategy, IEnrichmentData } from './IEnrichmentStrategy';
import { CompanyLookupService } from '../companyLookup';
/**
 * Generic enrichment strategy following Strategy Pattern and DRY principles
 * Eliminates code duplication between company and education enrichment
 */
export declare class GenericEnrichmentStrategy<T> implements IEnrichmentStrategy<T> {
    private enrichmentData;
    private companyLookup;
    private entityType;
    constructor(enrichmentData: IEnrichmentData, companyLookup: CompanyLookupService, entityType: string);
    enrich(items: Partial<T>[]): Promise<Partial<T>[]>;
    private findInKnownMappings;
    private isMatch;
}
//# sourceMappingURL=GenericEnrichmentStrategy.d.ts.map