import { IFileParser, SupportedMimeTypes } from './IFileParser';
import mammoth from 'mammoth';

/**
 * DOCX file parser following Single Responsibility Principle
 */
export class DocxParser implements IFileParser {
  canParse(mimeType: string): boolean {
    return mimeType === SupportedMimeTypes.DOCX;
  }

  async parse(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
}
