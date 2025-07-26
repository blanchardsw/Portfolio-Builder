import { IEnrichmentData } from './IEnrichmentStrategy';
/**
 * Education enrichment data following Single Responsibility Principle
 * Handles institution-specific normalization and known mappings
 */
export declare class EducationEnrichmentData implements IEnrichmentData {
    private knownInstitutions;
    getKnownMappings(): {
        [key: string]: string;
    };
    normalizeKey(institution: string): string;
    getKeyFromItem<T>(item: Partial<T>): string | undefined;
}
//# sourceMappingURL=EducationEnrichmentData.d.ts.map