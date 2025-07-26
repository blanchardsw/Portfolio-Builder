import { IFileParser } from './IFileParser';
/**
 * Text file parser following Single Responsibility Principle
 */
export declare class TextParser implements IFileParser {
    canParse(mimeType: string): boolean;
    parse(filePath: string): Promise<string>;
}
//# sourceMappingURL=TextParser.d.ts.map