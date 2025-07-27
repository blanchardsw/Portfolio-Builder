import { PdfParser } from '../../../services/parsing/PdfParser';
import { SupportedMimeTypes } from '../../../services/parsing/IFileParser';
import * as fs from 'fs';
import pdfParse from 'pdf-parse';

// Mock dependencies
jest.mock('fs');
jest.mock('pdf-parse');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPdfParse = pdfParse as jest.MockedFunction<typeof pdfParse>;

describe('PdfParser', () => {
  let parser: PdfParser;

  beforeEach(() => {
    parser = new PdfParser();
    jest.clearAllMocks();
  });

  describe('canParse', () => {
    it('should return true for PDF mime type', () => {
      expect(parser.canParse(SupportedMimeTypes.PDF)).toBe(true);
    });

    it('should return false for DOCX mime type', () => {
      expect(parser.canParse(SupportedMimeTypes.DOCX)).toBe(false);
    });

    it('should return false for TEXT mime type', () => {
      expect(parser.canParse(SupportedMimeTypes.TEXT)).toBe(false);
    });

    it('should return false for unsupported mime types', () => {
      expect(parser.canParse('application/json')).toBe(false);
      expect(parser.canParse('image/png')).toBe(false);
      expect(parser.canParse('')).toBe(false);
      expect(parser.canParse(null as any)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(parser.canParse('APPLICATION/PDF')).toBe(false);
      expect(parser.canParse('Application/Pdf')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse PDF file and return text content', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      const mockPdfData = { 
        text: 'Extracted PDF text content',
        numpages: 1,
        numrender: 1,
        info: {},
        metadata: {},
        version: '1.0' as any
      };
      
      mockedFs.readFileSync.mockReturnValue(mockBuffer);
      mockedPdfParse.mockResolvedValue(mockPdfData);

      const result = await parser.parse('/path/to/test.pdf');

      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/path/to/test.pdf');
      expect(mockedPdfParse).toHaveBeenCalledWith(mockBuffer);
      expect(result).toBe('Extracted PDF text content');
    });

    it('should handle PDF files with complex text content', async () => {
      const mockBuffer = Buffer.from('complex pdf');
      const complexText = `
        John Doe
        Software Engineer
        
        Experience:
        - 5 years in JavaScript development
        - React, Node.js, TypeScript
        - AWS, Docker, Kubernetes
        
        Education:
        Computer Science Degree
      `.trim();
      
      mockedFs.readFileSync.mockReturnValue(mockBuffer);
      mockedPdfParse.mockResolvedValue({ 
        text: complexText,
        numpages: 1,
        numrender: 1,
        info: {},
        metadata: {},
        version: '1.0' as any
      });

      const result = await parser.parse('/path/to/resume.pdf');

      expect(result).toBe(complexText);
      expect(result).toContain('John Doe');
      expect(result).toContain('JavaScript');
      expect(result).toContain('AWS');
    });

    it('should handle empty PDF files', async () => {
      const mockBuffer = Buffer.from('');
      mockedFs.readFileSync.mockReturnValue(mockBuffer);
      mockedPdfParse.mockResolvedValue({ 
        text: '',
        numpages: 1,
        numrender: 1,
        info: {},
        metadata: {},
        version: '1.0' as any
      });

      const result = await parser.parse('/path/to/empty.pdf');

      expect(result).toBe('');
    });

    it('should handle PDF files with only whitespace', async () => {
      const mockBuffer = Buffer.from('whitespace pdf');
      mockedFs.readFileSync.mockReturnValue(mockBuffer);
      mockedPdfParse.mockResolvedValue({ 
        text: '   \n\t  \n  ',
        numpages: 1,
        numrender: 1,
        info: {},
        metadata: {},
        version: '1.0' as any
      });

      const result = await parser.parse('/path/to/whitespace.pdf');

      expect(result).toBe('   \n\t  \n  ');
    });

    it('should handle file system errors', async () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(parser.parse('/nonexistent/file.pdf')).rejects.toThrow('File not found');
    });

    it('should handle PDF parsing errors', async () => {
      const mockBuffer = Buffer.from('corrupted pdf');
      mockedFs.readFileSync.mockReturnValue(mockBuffer);
      mockedPdfParse.mockRejectedValue(new Error('Invalid PDF format'));

      await expect(parser.parse('/path/to/corrupted.pdf')).rejects.toThrow('Invalid PDF format');
    });

    it('should handle different file paths correctly', async () => {
      const mockBuffer = Buffer.from('test');
      mockedFs.readFileSync.mockReturnValue(mockBuffer);
      mockedPdfParse.mockResolvedValue({ 
        text: 'test content',
        numpages: 1,
        numrender: 1,
        info: {},
        metadata: {},
        version: '1.0' as any
      });

      const paths = [
        '/absolute/path/file.pdf',
        'relative/path/file.pdf',
        'C:\\Windows\\path\\file.pdf',
        './current/dir/file.pdf'
      ];

      for (const path of paths) {
        await parser.parse(path);
        expect(mockedFs.readFileSync).toHaveBeenCalledWith(path);
      }
    });
  });

  describe('integration behavior', () => {
    it('should work with FileParserFactory pattern', () => {
      expect(parser.canParse(SupportedMimeTypes.PDF)).toBe(true);
      expect(typeof parser.parse).toBe('function');
    });

    it('should maintain consistent interface', () => {
      // Verify it implements IFileParser interface correctly
      expect(parser).toHaveProperty('canParse');
      expect(parser).toHaveProperty('parse');
      expect(typeof parser.canParse).toBe('function');
      expect(typeof parser.parse).toBe('function');
    });
  });
});
