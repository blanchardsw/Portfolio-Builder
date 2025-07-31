"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileParserFactory_1 = require("../../../services/parsing/FileParserFactory");
const IFileParser_1 = require("../../../services/parsing/IFileParser");
const PdfParser_1 = require("../../../services/parsing/PdfParser");
const DocxParser_1 = require("../../../services/parsing/DocxParser");
const TextParser_1 = require("../../../services/parsing/TextParser");
describe('FileParserFactory', () => {
    let factory;
    beforeEach(() => {
        factory = new FileParserFactory_1.FileParserFactory();
    });
    describe('createParser', () => {
        it('should create PdfParser for PDF mime type', () => {
            const parser = factory.createParser(IFileParser_1.SupportedMimeTypes.PDF);
            expect(parser).toBeInstanceOf(PdfParser_1.PdfParser);
            expect(parser.canParse(IFileParser_1.SupportedMimeTypes.PDF)).toBe(true);
        });
        it('should create DocxParser for DOCX mime type', () => {
            const parser = factory.createParser(IFileParser_1.SupportedMimeTypes.DOCX);
            expect(parser).toBeInstanceOf(DocxParser_1.DocxParser);
            expect(parser.canParse(IFileParser_1.SupportedMimeTypes.DOCX)).toBe(true);
        });
        it('should create TextParser for TEXT mime type', () => {
            const parser = factory.createParser(IFileParser_1.SupportedMimeTypes.TEXT);
            expect(parser).toBeInstanceOf(TextParser_1.TextParser);
            expect(parser.canParse(IFileParser_1.SupportedMimeTypes.TEXT)).toBe(true);
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
                factory.createParser(null);
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
            expect(supportedTypes).toContain(IFileParser_1.SupportedMimeTypes.PDF);
            expect(supportedTypes).toContain(IFileParser_1.SupportedMimeTypes.DOCX);
            expect(supportedTypes).toContain(IFileParser_1.SupportedMimeTypes.TEXT);
            expect(supportedTypes).toHaveLength(3);
        });
        it('should return mime types that match SupportedMimeTypes enum', () => {
            const supportedTypes = factory.getSupportedMimeTypes();
            const enumValues = Object.values(IFileParser_1.SupportedMimeTypes);
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
            const parser1 = factory.createParser(IFileParser_1.SupportedMimeTypes.PDF);
            const parser2 = factory.createParser(IFileParser_1.SupportedMimeTypes.PDF);
            // Should return same instance (parsers are created once in constructor)
            expect(parser1).toBe(parser2);
        });
        it('should return different parser instances for different mime types', () => {
            const pdfParser = factory.createParser(IFileParser_1.SupportedMimeTypes.PDF);
            const docxParser = factory.createParser(IFileParser_1.SupportedMimeTypes.DOCX);
            const textParser = factory.createParser(IFileParser_1.SupportedMimeTypes.TEXT);
            expect(pdfParser).not.toBe(docxParser);
            expect(pdfParser).not.toBe(textParser);
            expect(docxParser).not.toBe(textParser);
        });
    });
    describe('integration with parsers', () => {
        it('should create parsers that correctly identify their supported types', () => {
            const pdfParser = factory.createParser(IFileParser_1.SupportedMimeTypes.PDF);
            const docxParser = factory.createParser(IFileParser_1.SupportedMimeTypes.DOCX);
            const textParser = factory.createParser(IFileParser_1.SupportedMimeTypes.TEXT);
            // PDF parser should only support PDF
            expect(pdfParser.canParse(IFileParser_1.SupportedMimeTypes.PDF)).toBe(true);
            expect(pdfParser.canParse(IFileParser_1.SupportedMimeTypes.DOCX)).toBe(false);
            expect(pdfParser.canParse(IFileParser_1.SupportedMimeTypes.TEXT)).toBe(false);
            // DOCX parser should only support DOCX
            expect(docxParser.canParse(IFileParser_1.SupportedMimeTypes.DOCX)).toBe(true);
            expect(docxParser.canParse(IFileParser_1.SupportedMimeTypes.PDF)).toBe(false);
            expect(docxParser.canParse(IFileParser_1.SupportedMimeTypes.TEXT)).toBe(false);
            // Text parser should only support TEXT
            expect(textParser.canParse(IFileParser_1.SupportedMimeTypes.TEXT)).toBe(true);
            expect(textParser.canParse(IFileParser_1.SupportedMimeTypes.PDF)).toBe(false);
            expect(textParser.canParse(IFileParser_1.SupportedMimeTypes.DOCX)).toBe(false);
        });
    });
});
//# sourceMappingURL=fileParserFactory.test.js.map