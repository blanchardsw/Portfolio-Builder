"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PdfParser_1 = require("../../../services/parsing/PdfParser");
const IFileParser_1 = require("../../../services/parsing/IFileParser");
const fs = __importStar(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
// Mock dependencies
jest.mock('fs');
jest.mock('pdf-parse');
const mockedFs = fs;
const mockedPdfParse = pdf_parse_1.default;
describe('PdfParser', () => {
    let parser;
    beforeEach(() => {
        parser = new PdfParser_1.PdfParser();
        jest.clearAllMocks();
    });
    describe('canParse', () => {
        it('should return true for PDF mime type', () => {
            expect(parser.canParse(IFileParser_1.SupportedMimeTypes.PDF)).toBe(true);
        });
        it('should return false for DOCX mime type', () => {
            expect(parser.canParse(IFileParser_1.SupportedMimeTypes.DOCX)).toBe(false);
        });
        it('should return false for TEXT mime type', () => {
            expect(parser.canParse(IFileParser_1.SupportedMimeTypes.TEXT)).toBe(false);
        });
        it('should return false for unsupported mime types', () => {
            expect(parser.canParse('application/json')).toBe(false);
            expect(parser.canParse('image/png')).toBe(false);
            expect(parser.canParse('')).toBe(false);
            expect(parser.canParse(null)).toBe(false);
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
                version: '1.0'
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
                version: '1.0'
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
                version: '1.0'
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
                version: '1.0'
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
                version: '1.0'
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
            expect(parser.canParse(IFileParser_1.SupportedMimeTypes.PDF)).toBe(true);
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
//# sourceMappingURL=pdfParser.test.js.map