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
import { tmpdir } from 'os';

describe('FileSecurityService', () => {
  let fileSecurityService: FileSecurityService;
  const fixturesPath = path.join(__dirname, '..', 'fixtures');
  const samplePdfPath = path.join(fixturesPath, 'sample.pdf');
  const sampleTxtPath = path.join(fixturesPath, 'sample.txt');
  const maliciousFilePath = path.join(fixturesPath, 'malicious.txt');
  
  beforeEach(() => {
    fileSecurityService = new FileSecurityService();
  });

  describe('scanFile', () => {
    it('should pass security scan for valid PDF file', async () => {
      // Act
      const result = await fileSecurityService.scanFile(samplePdfPath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(true);
      expect(result.threats).toHaveLength(0);
      expect(result.fileInfo.hash).toBeDefined();
      expect(typeof result.fileInfo.hash).toBe('string');
      expect(result.fileInfo.mimeType).toBe('application/pdf');
    });

    it('should pass security scan for valid text file', async () => {
      // Act
      const result = await fileSecurityService.scanFile(sampleTxtPath, 'text/plain');

      // Assert
      expect(result.isSecure).toBe(true);
      expect(result.threats).toHaveLength(0);
      expect(result.fileInfo.hash).toBeDefined();
      expect(result.fileInfo.mimeType).toBe('text/plain');
    });

    it('should detect malicious content in file', async () => {
      // Act
      const result = await fileSecurityService.scanFile(maliciousFilePath, 'text/plain');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.threats.some(threat => 
        threat.includes('JavaScript') || 
        threat.includes('script') || 
        threat.includes('Shell command')
      )).toBe(true);
    });

    it('should handle non-existent files gracefully', async () => {
      // Act
      const result = await fileSecurityService.scanFile('/nonexistent/file.pdf', 'application/pdf');

      // Assert - service should handle errors gracefully
      expect(result.isSecure).toBe(false);
      expect(result.threats).toContain('Security scan failed');
      expect(result.fileInfo.size).toBe(0);
      expect(result.fileInfo.hash).toBe('unknown');
    });

    it('should reject invalid file signatures', async () => {
      // Use a text file and claim it's a PDF - should fail signature validation
      // Act
      const result = await fileSecurityService.scanFile(sampleTxtPath, 'application/pdf');

      // Assert
      expect(result.isSecure).toBe(false);
      expect(result.threats.some(threat => 
        threat.includes('signature') || 
        threat.includes('Invalid')
      )).toBe(true);
    });
  });

  describe('quarantineFile', () => {
    it('should quarantine a malicious file', async () => {
      const tempDir = tmpdir();
      const testFile = path.join(tempDir, 'test-quarantine.txt');
      await fsAsync.writeFile(testFile, 'test content');

      try {
        // Act
        const quarantinePath = fileSecurityService.quarantineFile(testFile);

        // Assert - quarantine should return a path
        expect(quarantinePath).toBeDefined();
        expect(typeof quarantinePath).toBe('string');
        expect(quarantinePath).toContain('quarantine');
        
        // File should be moved to quarantine (renamed)
        const originalExists = await fsAsync.access(testFile).then(() => true).catch(() => false);
        expect(originalExists).toBe(false);
        
        const quarantineExists = await fsAsync.access(quarantinePath).then(() => true).catch(() => false);
        expect(quarantineExists).toBe(true);
      } finally {
        // Cleanup - remove quarantined file if it exists
        const quarantinePath = path.join(tempDir, 'quarantine');
        await fsAsync.rm(quarantinePath, { recursive: true, force: true }).catch(() => {});
      }
    });
  });

  describe('performance tests', () => {
    it('should process files efficiently', async () => {
      const startTime = Date.now();

      // Act
      await fileSecurityService.scanFile(samplePdfPath, 'application/pdf');

      // Assert
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should process multiple files concurrently', async () => {
      const files = [
        { path: samplePdfPath, mimeType: 'application/pdf' },
        { path: sampleTxtPath, mimeType: 'text/plain' },
        { path: maliciousFilePath, mimeType: 'text/plain' },
      ];

      const startTime = Date.now();

      // Act
      const results = await Promise.all(
        files.map(file => fileSecurityService.scanFile(file.path, file.mimeType))
      );

      // Assert
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      expect(results).toHaveLength(3);
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });


});
