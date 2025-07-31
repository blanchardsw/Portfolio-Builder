"use strict";
/**
 * Unit tests for application constants and configuration values
 *
 * Tests cover:
 * - File size and type constants
 * - MIME type definitions
 * - File signature validation data
 * - Cache duration settings
 * - API limit configurations
 * - Skill categorization constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../config/constants");
describe('Configuration Constants', () => {
    describe('FILE_CONSTANTS', () => {
        it('should have correct file size limits', () => {
            expect(constants_1.FILE_CONSTANTS.MAX_FILE_SIZE).toBe(10 * 1024 * 1024); // 10MB
            expect(constants_1.FILE_CONSTANTS.MIN_FILE_SIZE).toBe(100); // 100 bytes
            expect(constants_1.FILE_CONSTANTS.SCAN_SIZE_LIMIT).toBe(512 * 1024); // 512KB
            expect(constants_1.FILE_CONSTANTS.MAX_THREATS_BEFORE_EXIT).toBe(3);
        });
        it('should have reasonable file size constraints', () => {
            expect(constants_1.FILE_CONSTANTS.MAX_FILE_SIZE).toBeGreaterThan(constants_1.FILE_CONSTANTS.MIN_FILE_SIZE);
            expect(constants_1.FILE_CONSTANTS.SCAN_SIZE_LIMIT).toBeLessThan(constants_1.FILE_CONSTANTS.MAX_FILE_SIZE);
            expect(constants_1.FILE_CONSTANTS.MAX_THREATS_BEFORE_EXIT).toBeGreaterThan(0);
        });
        it('should be readonly constants', () => {
            expect(() => {
                // @ts-expect-error - Testing readonly constraint
                constants_1.FILE_CONSTANTS.MAX_FILE_SIZE = 999;
            }).toThrow();
        });
    });
    describe('MIME_TYPES', () => {
        it('should define correct MIME types', () => {
            expect(constants_1.MIME_TYPES.PDF).toBe('application/pdf');
            expect(constants_1.MIME_TYPES.DOCX).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            expect(constants_1.MIME_TYPES.DOC).toBe('application/msword');
            expect(constants_1.MIME_TYPES.TEXT).toBe('text/plain');
        });
        it('should have all required document types', () => {
            const mimeValues = Object.values(constants_1.MIME_TYPES);
            expect(mimeValues).toContain('application/pdf');
            expect(mimeValues).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            expect(mimeValues).toContain('application/msword');
            expect(mimeValues).toContain('text/plain');
        });
        it('should be readonly constants', () => {
            expect(() => {
                // @ts-expect-error - Testing readonly constraint
                constants_1.MIME_TYPES.PDF = 'invalid';
            }).toThrow();
        });
    });
    describe('FILE_EXTENSIONS', () => {
        it('should define correct file extensions', () => {
            expect(constants_1.FILE_EXTENSIONS.PDF).toBe('.pdf');
            expect(constants_1.FILE_EXTENSIONS.DOCX).toBe('.docx');
            expect(constants_1.FILE_EXTENSIONS.DOC).toBe('.doc');
            expect(constants_1.FILE_EXTENSIONS.TXT).toBe('.txt');
        });
        it('should have extensions with leading dots', () => {
            const extensions = Object.values(constants_1.FILE_EXTENSIONS);
            extensions.forEach(ext => {
                expect(ext).toMatch(/^\./);
            });
        });
        it('should match MIME type keys', () => {
            const mimeKeys = Object.keys(constants_1.MIME_TYPES);
            const extensionKeys = Object.keys(constants_1.FILE_EXTENSIONS);
            // Should have same keys (except TEXT vs TXT)
            expect(extensionKeys).toContain('PDF');
            expect(extensionKeys).toContain('DOCX');
            expect(extensionKeys).toContain('DOC');
            expect(extensionKeys).toContain('TXT');
        });
    });
    describe('CACHE_DURATIONS', () => {
        it('should define cache duration values', () => {
            expect(constants_1.CACHE_DURATIONS.PORTFOLIO_CACHE).toBe(5 * 60 * 1000); // 5 minutes
            expect(constants_1.CACHE_DURATIONS.SERVICE_CACHE).toBe(Infinity);
        });
        it('should have reasonable cache durations', () => {
            expect(constants_1.CACHE_DURATIONS.PORTFOLIO_CACHE).toBeGreaterThan(0);
            expect(constants_1.CACHE_DURATIONS.SERVICE_CACHE).toBe(Infinity);
        });
        it('should be readonly constants', () => {
            expect(() => {
                // @ts-expect-error - Testing readonly constraint
                constants_1.CACHE_DURATIONS.PORTFOLIO_CACHE = 999;
            }).toThrow();
        });
    });
    describe('API_LIMITS', () => {
        it('should define API payload limits', () => {
            expect(constants_1.API_LIMITS.JSON_PAYLOAD_LIMIT).toBe('10mb');
            expect(constants_1.API_LIMITS.URL_ENCODED_LIMIT).toBe('10mb');
        });
        it('should have consistent limit values', () => {
            expect(constants_1.API_LIMITS.JSON_PAYLOAD_LIMIT).toBe(constants_1.API_LIMITS.URL_ENCODED_LIMIT);
        });
        it('should be readonly constants', () => {
            expect(() => {
                // @ts-expect-error - Testing readonly constraint
                constants_1.API_LIMITS.JSON_PAYLOAD_LIMIT = '1mb';
            }).toThrow();
        });
    });
    describe('SKILL_CATEGORIES', () => {
        it('should define skill categories', () => {
            expect(constants_1.SKILL_CATEGORIES).toEqual(['technical', 'soft', 'language']);
        });
        it('should be an array of strings', () => {
            expect(Array.isArray(constants_1.SKILL_CATEGORIES)).toBe(true);
            constants_1.SKILL_CATEGORIES.forEach(category => {
                expect(typeof category).toBe('string');
            });
        });
        it('should have expected categories', () => {
            expect(constants_1.SKILL_CATEGORIES).toContain('technical');
            expect(constants_1.SKILL_CATEGORIES).toContain('soft');
            expect(constants_1.SKILL_CATEGORIES).toContain('language');
        });
        it('should be readonly constants', () => {
            expect(() => {
                // @ts-expect-error - Testing readonly constraint
                constants_1.SKILL_CATEGORIES.push('invalid');
            }).toThrow();
        });
    });
    describe('SKILL_LEVELS', () => {
        it('should define skill levels in order', () => {
            expect(constants_1.SKILL_LEVELS).toEqual(['beginner', 'intermediate', 'advanced', 'expert']);
        });
        it('should be an array of strings', () => {
            expect(Array.isArray(constants_1.SKILL_LEVELS)).toBe(true);
            constants_1.SKILL_LEVELS.forEach(level => {
                expect(typeof level).toBe('string');
            });
        });
        it('should have progressive skill levels', () => {
            expect(constants_1.SKILL_LEVELS[0]).toBe('beginner');
            expect(constants_1.SKILL_LEVELS[1]).toBe('intermediate');
            expect(constants_1.SKILL_LEVELS[2]).toBe('advanced');
            expect(constants_1.SKILL_LEVELS[3]).toBe('expert');
        });
        it('should be readonly constants', () => {
            expect(() => {
                // @ts-expect-error - Testing readonly constraint
                constants_1.SKILL_LEVELS.push('master');
            }).toThrow();
        });
    });
    describe('FILE_SIGNATURES', () => {
        it('should define file signature byte arrays', () => {
            expect(constants_1.FILE_SIGNATURES.PDF).toEqual([0x25, 0x50, 0x44, 0x46]); // %PDF
            expect(constants_1.FILE_SIGNATURES.DOCX).toEqual([0x50, 0x4B, 0x03, 0x04]); // ZIP header
            expect(constants_1.FILE_SIGNATURES.DOC).toEqual([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]); // OLE header
        });
        it('should have valid byte values', () => {
            Object.values(constants_1.FILE_SIGNATURES).forEach(signature => {
                expect(Array.isArray(signature)).toBe(true);
                signature.forEach(byte => {
                    expect(byte).toBeGreaterThanOrEqual(0);
                    expect(byte).toBeLessThanOrEqual(255);
                    expect(Number.isInteger(byte)).toBe(true);
                });
            });
        });
        it('should have different signatures for different file types', () => {
            const signatures = Object.values(constants_1.FILE_SIGNATURES);
            const uniqueSignatures = new Set(signatures.map(sig => JSON.stringify(sig)));
            expect(uniqueSignatures.size).toBe(signatures.length);
        });
        it('should be readonly constants', () => {
            expect(() => {
                // @ts-expect-error - Testing readonly constraint
                constants_1.FILE_SIGNATURES.PDF = [0x00];
            }).toThrow();
        });
    });
    describe('EXECUTABLE_SIGNATURES', () => {
        it('should define executable file signatures', () => {
            expect(constants_1.EXECUTABLE_SIGNATURES).toContainEqual([0x4D, 0x5A]); // MZ (Windows)
            expect(constants_1.EXECUTABLE_SIGNATURES).toContainEqual([0x7F, 0x45, 0x4C, 0x46]); // ELF (Linux)
            expect(constants_1.EXECUTABLE_SIGNATURES).toContainEqual([0xCA, 0xFE, 0xBA, 0xBE]); // Mach-O (macOS)
        });
        it('should be an array of byte arrays', () => {
            expect(Array.isArray(constants_1.EXECUTABLE_SIGNATURES)).toBe(true);
            constants_1.EXECUTABLE_SIGNATURES.forEach(signature => {
                expect(Array.isArray(signature)).toBe(true);
                signature.forEach(byte => {
                    expect(byte).toBeGreaterThanOrEqual(0);
                    expect(byte).toBeLessThanOrEqual(255);
                    expect(Number.isInteger(byte)).toBe(true);
                });
            });
        });
        it('should have multiple executable formats', () => {
            expect(constants_1.EXECUTABLE_SIGNATURES.length).toBeGreaterThanOrEqual(3);
        });
        it('should be readonly constants', () => {
            expect(() => {
                // @ts-expect-error - Testing readonly constraint
                constants_1.EXECUTABLE_SIGNATURES.push([0x00]);
            }).toThrow();
        });
    });
    describe('constant relationships', () => {
        it('should have matching keys between MIME_TYPES and FILE_EXTENSIONS', () => {
            expect(Object.keys(constants_1.MIME_TYPES)).toContain('PDF');
            expect(Object.keys(constants_1.MIME_TYPES)).toContain('DOCX');
            expect(Object.keys(constants_1.MIME_TYPES)).toContain('DOC');
            expect(Object.keys(constants_1.FILE_EXTENSIONS)).toContain('PDF');
            expect(Object.keys(constants_1.FILE_EXTENSIONS)).toContain('DOCX');
            expect(Object.keys(constants_1.FILE_EXTENSIONS)).toContain('DOC');
        });
        it('should have file signatures for supported document types', () => {
            expect(Object.keys(constants_1.FILE_SIGNATURES)).toContain('PDF');
            expect(Object.keys(constants_1.FILE_SIGNATURES)).toContain('DOCX');
            expect(Object.keys(constants_1.FILE_SIGNATURES)).toContain('DOC');
        });
        it('should have reasonable file size limits relative to scan limits', () => {
            expect(constants_1.FILE_CONSTANTS.SCAN_SIZE_LIMIT).toBeLessThan(constants_1.FILE_CONSTANTS.MAX_FILE_SIZE);
            expect(constants_1.FILE_CONSTANTS.MIN_FILE_SIZE).toBeLessThan(constants_1.FILE_CONSTANTS.SCAN_SIZE_LIMIT);
        });
    });
});
//# sourceMappingURL=constants.test.js.map