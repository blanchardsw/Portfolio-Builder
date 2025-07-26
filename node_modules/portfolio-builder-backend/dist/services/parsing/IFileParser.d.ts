/**
 * Interface for file parsers following Strategy Pattern
 * Supports different file types (PDF, DOCX, TXT)
 */
export interface IFileParser {
    canParse(mimeType: string): boolean;
    parse(filePath: string): Promise<string>;
}
export declare enum SupportedMimeTypes {
    PDF = "application/pdf",
    DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    TEXT = "text/plain"
}
//# sourceMappingURL=IFileParser.d.ts.map