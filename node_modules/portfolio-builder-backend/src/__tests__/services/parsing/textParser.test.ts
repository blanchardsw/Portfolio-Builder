import { TextParser } from '../../../services/parsing/TextParser';
import { SupportedMimeTypes } from '../../../services/parsing/IFileParser';
import * as fs from 'fs';

// Mock fs
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('TextParser', () => {
  let parser: TextParser;

  beforeEach(() => {
    parser = new TextParser();
    jest.clearAllMocks();
  });

  describe('canParse', () => {
    it('should return true for TEXT mime type', () => {
      expect(parser.canParse(SupportedMimeTypes.TEXT)).toBe(true);
    });

    it('should return false for PDF mime type', () => {
      expect(parser.canParse(SupportedMimeTypes.PDF)).toBe(false);
    });

    it('should return false for DOCX mime type', () => {
      expect(parser.canParse(SupportedMimeTypes.DOCX)).toBe(false);
    });

    it('should return false for unsupported mime types', () => {
      expect(parser.canParse('application/json')).toBe(false);
      expect(parser.canParse('image/png')).toBe(false);
      expect(parser.canParse('')).toBe(false);
      expect(parser.canParse(null as any)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(parser.canParse('TEXT/PLAIN')).toBe(false);
      expect(parser.canParse('Text/Plain')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse text file and return content', async () => {
      const mockContent = 'Simple text file content';
      mockedFs.readFileSync.mockReturnValue(mockContent);

      const result = await parser.parse('/path/to/test.txt');

      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/path/to/test.txt', 'utf-8');
      expect(result).toBe('Simple text file content');
    });

    it('should handle text files with complex content', async () => {
      const complexText = `
        Michael Johnson
        Full Stack Developer
        
        Contact Information:
        Email: michael@example.com
        Phone: (555) 123-4567
        
        Technical Skills:
        - JavaScript, TypeScript, Python
        - React, Vue.js, Angular
        - Node.js, Express, Django
        - AWS, Docker, Kubernetes
        - PostgreSQL, MongoDB, Redis
        
        Professional Experience:
        
        Senior Software Engineer | TechCorp Inc. | 2021-Present
        • Led development of microservices architecture
        • Implemented CI/CD pipelines using Jenkins
        • Mentored junior developers
        
        Software Developer | StartupXYZ | 2019-2021
        • Built responsive web applications
        • Optimized database queries for better performance
        • Collaborated with cross-functional teams
        
        Education:
        Bachelor of Science in Computer Science
        University of Technology | 2015-2019
      `.trim();
      
      mockedFs.readFileSync.mockReturnValue(complexText);

      const result = await parser.parse('/path/to/resume.txt');

      expect(result).toBe(complexText);
      expect(result).toContain('Michael Johnson');
      expect(result).toContain('JavaScript');
      expect(result).toContain('TechCorp Inc.');
    });

    it('should handle empty text files', async () => {
      mockedFs.readFileSync.mockReturnValue('');

      const result = await parser.parse('/path/to/empty.txt');

      expect(result).toBe('');
    });

    it('should handle text files with only whitespace', async () => {
      const whitespaceContent = '   \n\t  \n  ';
      mockedFs.readFileSync.mockReturnValue(whitespaceContent);

      const result = await parser.parse('/path/to/whitespace.txt');

      expect(result).toBe(whitespaceContent);
    });

    it('should handle text files with special characters', async () => {
      const textWithSpecialChars = 'Résumé for José María with €1000 salary and 中文 characters';
      mockedFs.readFileSync.mockReturnValue(textWithSpecialChars);

      const result = await parser.parse('/path/to/special.txt');

      expect(result).toBe(textWithSpecialChars);
    });

    it('should handle text files with line breaks', async () => {
      const textWithLineBreaks = 'Line 1\nLine 2\r\nLine 3\rLine 4';
      mockedFs.readFileSync.mockReturnValue(textWithLineBreaks);

      const result = await parser.parse('/path/to/multiline.txt');

      expect(result).toBe(textWithLineBreaks);
      expect(result.split('\n')).toHaveLength(3); // \n and \r\n create line breaks
    });

    it('should handle file system errors', async () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(parser.parse('/nonexistent/file.txt')).rejects.toThrow('File not found');
    });

    it('should handle permission errors', async () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(parser.parse('/restricted/file.txt')).rejects.toThrow('Permission denied');
    });

    it('should handle different file paths correctly', async () => {
      mockedFs.readFileSync.mockReturnValue('test content');

      const paths = [
        '/absolute/path/file.txt',
        'relative/path/file.txt',
        'C:\\Windows\\path\\file.txt',
        './current/dir/file.txt'
      ];

      for (const path of paths) {
        await parser.parse(path);
        expect(mockedFs.readFileSync).toHaveBeenCalledWith(path, 'utf-8');
      }
    });

    it('should handle large text files', async () => {
      const largeContent = 'A'.repeat(10000) + '\n' + 'B'.repeat(5000);
      mockedFs.readFileSync.mockReturnValue(largeContent);

      const result = await parser.parse('/path/to/large.txt');

      expect(result).toBe(largeContent);
      expect(result.length).toBe(15001); // 10000 + 1 + 5000
    });

    it('should preserve exact file content including formatting', async () => {
      const formattedContent = `
{
  "name": "John Doe",
  "skills": ["JavaScript", "Python"],
  "experience": {
    "years": 5,
    "companies": ["TechCorp", "StartupXYZ"]
  }
}
      `.trim();
      
      mockedFs.readFileSync.mockReturnValue(formattedContent);

      const result = await parser.parse('/path/to/data.txt');

      expect(result).toBe(formattedContent);
      expect(result).toContain('"name": "John Doe"');
    });
  });

  describe('integration behavior', () => {
    it('should work with FileParserFactory pattern', () => {
      expect(parser.canParse(SupportedMimeTypes.TEXT)).toBe(true);
      expect(typeof parser.parse).toBe('function');
    });

    it('should maintain consistent interface', () => {
      // Verify it implements IFileParser interface correctly
      expect(parser).toHaveProperty('canParse');
      expect(parser).toHaveProperty('parse');
      expect(typeof parser.canParse).toBe('function');
      expect(typeof parser.parse).toBe('function');
    });

    it('should use correct encoding for file reading', async () => {
      mockedFs.readFileSync.mockReturnValue('test');

      await parser.parse('/path/to/test.txt');

      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/path/to/test.txt', 'utf-8');
    });
  });
});
