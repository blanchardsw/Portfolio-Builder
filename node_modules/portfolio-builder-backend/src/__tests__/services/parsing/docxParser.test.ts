import { DocxParser } from '../../../services/parsing/DocxParser';
import { SupportedMimeTypes } from '../../../services/parsing/IFileParser';
import mammoth from 'mammoth';

// Mock mammoth
jest.mock('mammoth');
const mockedMammoth = mammoth as jest.Mocked<typeof mammoth>;

describe('DocxParser', () => {
  let parser: DocxParser;

  beforeEach(() => {
    parser = new DocxParser();
    jest.clearAllMocks();
  });

  describe('canParse', () => {
    it('should return true for DOCX mime type', () => {
      expect(parser.canParse(SupportedMimeTypes.DOCX)).toBe(true);
    });

    it('should return false for PDF mime type', () => {
      expect(parser.canParse(SupportedMimeTypes.PDF)).toBe(false);
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
      expect(parser.canParse('APPLICATION/VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse DOCX file and return text content', async () => {
      const mockResult = { value: 'Extracted DOCX text content', messages: [] };
      mockedMammoth.extractRawText.mockResolvedValue(mockResult);

      const result = await parser.parse('/path/to/test.docx');

      expect(mockedMammoth.extractRawText).toHaveBeenCalledWith({ path: '/path/to/test.docx' });
      expect(result).toBe('Extracted DOCX text content');
    });

    it('should handle DOCX files with complex text content', async () => {
      const complexText = `
        Jane Smith
        Senior Developer
        
        Professional Experience:
        Software Engineer at Tech Corp (2020-2023)
        - Developed React applications
        - Implemented REST APIs with Node.js
        - Managed AWS infrastructure
        
        Skills:
        JavaScript, TypeScript, Python, Docker
        
        Education:
        Master's in Computer Science
      `.trim();
      
      mockedMammoth.extractRawText.mockResolvedValue({ value: complexText, messages: [] });

      const result = await parser.parse('/path/to/resume.docx');

      expect(result).toBe(complexText);
      expect(result).toContain('Jane Smith');
      expect(result).toContain('React');
      expect(result).toContain('AWS');
    });

    it('should handle empty DOCX files', async () => {
      mockedMammoth.extractRawText.mockResolvedValue({ value: '', messages: [] });

      const result = await parser.parse('/path/to/empty.docx');

      expect(result).toBe('');
    });

    it('should handle DOCX files with only whitespace', async () => {
      mockedMammoth.extractRawText.mockResolvedValue({ value: '   \n\t  \n  ', messages: [] });

      const result = await parser.parse('/path/to/whitespace.docx');

      expect(result).toBe('   \n\t  \n  ');
    });

    it('should handle DOCX files with special characters', async () => {
      const textWithSpecialChars = 'Résumé for José María with €1000 salary';
      mockedMammoth.extractRawText.mockResolvedValue({ value: textWithSpecialChars, messages: [] });

      const result = await parser.parse('/path/to/special.docx');

      expect(result).toBe(textWithSpecialChars);
    });

    it('should handle mammoth parsing errors', async () => {
      mockedMammoth.extractRawText.mockRejectedValue(new Error('Invalid DOCX format'));

      await expect(parser.parse('/path/to/corrupted.docx')).rejects.toThrow('Invalid DOCX format');
    });

    it('should handle different file paths correctly', async () => {
      mockedMammoth.extractRawText.mockResolvedValue({ value: 'test content', messages: [] });

      const paths = [
        '/absolute/path/file.docx',
        'relative/path/file.docx',
        'C:\\Windows\\path\\file.docx',
        './current/dir/file.docx'
      ];

      for (const path of paths) {
        await parser.parse(path);
        expect(mockedMammoth.extractRawText).toHaveBeenCalledWith({ path });
      }
    });

    it('should handle DOCX with formatted text', async () => {
      const formattedText = `
        JOHN DOE
        Software Engineer
        
        EXPERIENCE
        Senior Developer - ABC Company
        • Led team of 5 developers
        • Increased performance by 40%
        
        SKILLS
        React, Node.js, AWS, Docker
      `.trim();
      
      mockedMammoth.extractRawText.mockResolvedValue({ value: formattedText, messages: [] });

      const result = await parser.parse('/path/to/formatted.docx');

      expect(result).toBe(formattedText);
      expect(result).toContain('JOHN DOE');
      expect(result).toContain('40%');
    });
  });

  describe('integration behavior', () => {
    it('should work with FileParserFactory pattern', () => {
      expect(parser.canParse(SupportedMimeTypes.DOCX)).toBe(true);
      expect(typeof parser.parse).toBe('function');
    });

    it('should maintain consistent interface', () => {
      // Verify it implements IFileParser interface correctly
      expect(parser).toHaveProperty('canParse');
      expect(parser).toHaveProperty('parse');
      expect(typeof parser.canParse).toBe('function');
      expect(typeof parser.parse).toBe('function');
    });

    it('should handle mammoth result structure correctly', async () => {
      // Test that we correctly extract the 'value' property from mammoth result
      const mockResult = { 
        value: 'extracted text',
        messages: [],
        style: {}
      };
      mockedMammoth.extractRawText.mockResolvedValue(mockResult);

      const result = await parser.parse('/path/to/test.docx');

      expect(result).toBe('extracted text');
    });
  });
});
