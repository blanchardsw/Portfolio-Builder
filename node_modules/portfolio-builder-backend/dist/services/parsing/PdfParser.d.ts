import { IFileParser } from './IFileParser';
/**
 * PDF file parser following Single Responsibility Principle
 */
export declare class PdfParser implements IFileParser {
    canParse(mimeType: string): boolean;
    parse(filePath: string): Promise<string>;
}
//# sourceMappingURL=PdfParser.d.ts.map