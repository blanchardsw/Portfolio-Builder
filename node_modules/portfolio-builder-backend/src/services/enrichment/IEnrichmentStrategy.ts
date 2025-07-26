/**
 * Interface for enrichment strategies following Strategy Pattern
 * Supports both companies and educational institutions
 */
export interface IEnrichmentStrategy<T> {
  enrich(items: Partial<T>[]): Promise<Partial<T>[]>;
}

export interface IEnrichmentData {
  getKnownMappings(): { [key: string]: string };
  normalizeKey(key: string): string;
  getKeyFromItem<T>(item: Partial<T>): string | undefined;
}
