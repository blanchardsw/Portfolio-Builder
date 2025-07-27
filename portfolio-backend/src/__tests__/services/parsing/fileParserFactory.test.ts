import { FileParserFactory } from '../../../services/parsing/FileParserFactory';
import { SupportedMimeTypes } from '../../../services/parsing/IFileParser';
import { PdfParser } from '../../../services/parsing/PdfParser';
import { DocxParser } from '../../../services/parsing/DocxParser';
import { TextParser } from '../../../services/parsing/TextParser';

describe('FileParserFactory', () => {
  let factory: FileParserFactory;

  beforeEach(() => {
    factory = new FileParserFactory();
  });

  describe('createParser', () => {
    it('should create PdfParser for PDF mime type', () => {
      const parser = factory.createParser(SupportedMimeTypes.PDF);
      expect(parser).toBeInstanceOf(PdfParser);
      expect(parser.canParse(SupportedMimeTypes.PDF)).toBe(true);
    });

    it('should create DocxParser for DOCX mime type', () => {
      const parser = factory.createParser(SupportedMimeTypes.DOCX);
      expect(parser).toBeInstanceOf(DocxParser);
      expect(parser.canParse(SupportedMimeTypes.DOCX)).toBe(true);
    });

    it('should create TextParser for TEXT mime type', () => {
      const parser = factory.createParser(SupportedMimeTypes.TEXT);
      expect(parser).toBeInstanceOf(TextParser);
      expect(parser.canParse(SupportedMimeTypes.TEXT)).toBe(true);
    });

    it('should throw error for unsupported mime type', () => {
      expect(() => {
        factory.createParser('application/unsupported');
      }).toThrow('Unsupported file type: application/unsupported');
    });

    it('should throw error for empty mime type', () => {
      expect(() => {
        factory.createParser('');
      }).toThrow('Unsupported file type: ');
    });

    it('should throw error for null mime type', () => {
      expect(() => {
        factory.createParser(null as any);
      }).toThrow('Unsupported file type: null');
    });

    it('should be case sensitive for mime types', () => {
      expect(() => {
        factory.createParser('APPLICATION/PDF');
      }).toThrow('Unsupported file type: APPLICATION/PDF');
    });

    it('should handle mime types with extra whitespace', () => {
      expect(() => {
        factory.createParser(' application/pdf ');
      }).toThrow('Unsupported file type:  application/pdf ');
    });
  });

  describe('getSupportedMimeTypes', () => {
    it('should return all supported mime types', () => {
      const supportedTypes = factory.getSupportedMimeTypes();
      
      expect(supportedTypes).toContain(SupportedMimeTypes.PDF);
      expect(supportedTypes).toContain(SupportedMimeTypes.DOCX);
      expect(supportedTypes).toContain(SupportedMimeTypes.TEXT);
      expect(supportedTypes).toHaveLength(3);
    });

    it('should return mime types that match SupportedMimeTypes enum', () => {
      const supportedTypes = factory.getSupportedMimeTypes();
      const enumValues = Object.values(SupportedMimeTypes);
      
      expect(supportedTypes.sort()).toEqual(enumValues.sort());
    });

    it('should return consistent results on multiple calls', () => {
      const types1 = factory.getSupportedMimeTypes();
      const types2 = factory.getSupportedMimeTypes();
      
      expect(types1).toEqual(types2);
    });
  });

  describe('parser instances', () => {
    it('should return same parser instance for same mime type', () => {
      const parser1 = factory.createParser(SupportedMimeTypes.PDF);
      const parser2 = factory.createParser(SupportedMimeTypes.PDF);
      
      // Should return same instance (parsers are created once in constructor)
      expect(parser1).toBe(parser2);
    });

    it('should return different parser instances for different mime types', () => {
      const pdfParser = factory.createParser(SupportedMimeTypes.PDF);
      const docxParser = factory.createParser(SupportedMimeTypes.DOCX);
      const textParser = factory.createParser(SupportedMimeTypes.TEXT);
      
      expect(pdfParser).not.toBe(docxParser);
      expect(pdfParser).not.toBe(textParser);
      expect(docxParser).not.toBe(textParser);
    });
  });

  describe('integration with parsers', () => {
    it('should create parsers that correctly identify their supported types', () => {
      const pdfParser = factory.createParser(SupportedMimeTypes.PDF);
      const docxParser = factory.createParser(SupportedMimeTypes.DOCX);
      const textParser = factory.createParser(SupportedMimeTypes.TEXT);

      // PDF parser should only support PDF
      expect(pdfParser.canParse(SupportedMimeTypes.PDF)).toBe(true);
      expect(pdfParser.canParse(SupportedMimeTypes.DOCX)).toBe(false);
      expect(pdfParser.canParse(SupportedMimeTypes.TEXT)).toBe(false);

      // DOCX parser should only support DOCX
      expect(docxParser.canParse(SupportedMimeTypes.DOCX)).toBe(true);
      expect(docxParser.canParse(SupportedMimeTypes.PDF)).toBe(false);
      expect(docxParser.canParse(SupportedMimeTypes.TEXT)).toBe(false);

      // Text parser should only support TEXT
      expect(textParser.canParse(SupportedMimeTypes.TEXT)).toBe(true);
      expect(textParser.canParse(SupportedMimeTypes.PDF)).toBe(false);
      expect(textParser.canParse(SupportedMimeTypes.DOCX)).toBe(false);
    });
  });
});
