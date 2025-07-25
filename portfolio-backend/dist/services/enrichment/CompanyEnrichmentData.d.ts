import { IEnrichmentData } from './IEnrichmentStrategy';
/**
 * Company enrichment data following Single Responsibility Principle
 * Handles company-specific normalization and known mappings
 */
export declare class CompanyEnrichmentData implements IEnrichmentData {
    private knownCompanies;
    getKnownMappings(): {
        [key: string]: string;
    };
    normalizeKey(company: string): string;
    getKeyFromItem<T>(item: Partial<T>): string | undefined;
}
//# sourceMappingURL=CompanyEnrichmentData.d.ts.map