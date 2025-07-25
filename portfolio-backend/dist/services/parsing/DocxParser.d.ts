import { IFileParser } from './IFileParser';
/**
 * DOCX file parser following Single Responsibility Principle
 */
export declare class DocxParser implements IFileParser {
    canParse(mimeType: string): boolean;
    parse(filePath: string): Promise<string>;
}
//# sourceMappingURL=DocxParser.d.ts.map