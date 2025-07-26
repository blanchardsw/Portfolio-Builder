import { IFileParser, SupportedMimeTypes } from './IFileParser';
import * as fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * PDF file parser following Single Responsibility Principle
 */
export class PdfParser implements IFileParser {
  canParse(mimeType: string): boolean {
    return mimeType === SupportedMimeTypes.PDF;
  }

  async parse(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }
}
