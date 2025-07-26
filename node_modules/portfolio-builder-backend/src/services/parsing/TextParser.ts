import { IFileParser, SupportedMimeTypes } from './IFileParser';
import * as fs from 'fs';

/**
 * Text file parser following Single Responsibility Principle
 */
export class TextParser implements IFileParser {
  canParse(mimeType: string): boolean {
    return mimeType === SupportedMimeTypes.TEXT;
  }

  async parse(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }
}
