import { IFileParser, SupportedMimeTypes } from './IFileParser';
import { PdfParser } from './PdfParser';
import { DocxParser } from './DocxParser';
import { TextParser } from './TextParser';

/**
 * Factory for creating file parsers following Factory Pattern
 * Eliminates conditional logic from main parser class
 */
export class FileParserFactory {
  private parsers: IFileParser[] = [
    new PdfParser(),
    new DocxParser(),
    new TextParser()
  ];

  createParser(mimeType: string): IFileParser {
    const parser = this.parsers.find(p => p.canParse(mimeType));
    
    if (!parser) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
    
    return parser;
  }

  getSupportedMimeTypes(): string[] {
    return Object.values(SupportedMimeTypes);
  }
}
