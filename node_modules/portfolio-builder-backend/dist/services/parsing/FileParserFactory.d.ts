import { IFileParser } from './IFileParser';
/**
 * Factory for creating file parsers following Factory Pattern
 * Eliminates conditional logic from main parser class
 */
export declare class FileParserFactory {
    private parsers;
    createParser(mimeType: string): IFileParser;
    getSupportedMimeTypes(): string[];
}
//# sourceMappingURL=FileParserFactory.d.ts.map