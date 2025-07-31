"use strict";
/**
 * Application constants and configuration values
 * Centralized location for all magic numbers and strings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MALICIOUS_PATTERNS = exports.EXECUTABLE_SIGNATURES = exports.FILE_SIGNATURES = exports.SKILL_LEVELS = exports.SKILL_CATEGORIES = exports.API_LIMITS = exports.CACHE_DURATIONS = exports.FILE_EXTENSIONS = exports.MIME_TYPES = exports.FILE_CONSTANTS = void 0;
exports.FILE_CONSTANTS = Object.freeze({
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MIN_FILE_SIZE: 100, // 100 bytes
    SCAN_SIZE_LIMIT: 512 * 1024, // 512KB for security scanning
    MAX_THREATS_BEFORE_EXIT: 3,
});
exports.MIME_TYPES = Object.freeze({
    PDF: 'application/pdf',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOC: 'application/msword',
    TEXT: 'text/plain',
});
exports.FILE_EXTENSIONS = Object.freeze({
    PDF: '.pdf',
    DOCX: '.docx',
    DOC: '.doc',
    TXT: '.txt',
});
exports.CACHE_DURATIONS = Object.freeze({
    PORTFOLIO_CACHE: 5 * 60 * 1000, // 5 minutes
    SERVICE_CACHE: Infinity, // Services cached indefinitely
});
exports.API_LIMITS = Object.freeze({
    JSON_PAYLOAD_LIMIT: '10mb',
    URL_ENCODED_LIMIT: '10mb',
});
exports.SKILL_CATEGORIES = Object.freeze(['technical', 'soft', 'language']);
exports.SKILL_LEVELS = Object.freeze(['beginner', 'intermediate', 'advanced', 'expert']);
exports.FILE_SIGNATURES = Object.freeze({
    PDF: Object.freeze([0x25, 0x50, 0x44, 0x46]), // %PDF
    DOCX: Object.freeze([0x50, 0x4B, 0x03, 0x04]), // ZIP header (DOCX is ZIP-based)
    DOC: Object.freeze([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]), // OLE header
});
exports.EXECUTABLE_SIGNATURES = Object.freeze([
    Object.freeze([0x4D, 0x5A]), // MZ (Windows executable)
    Object.freeze([0x7F, 0x45, 0x4C, 0x46]), // ELF (Linux executable)
    Object.freeze([0xCA, 0xFE, 0xBA, 0xBE]), // Mach-O (macOS executable)
]);
exports.MALICIOUS_PATTERNS = Object.freeze([
    // JavaScript patterns
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    // Executable patterns (more specific to avoid false positives)
    /\.exe\b/gi,
    /\.bat\b/gi,
    /\.cmd\b/gi,
    /\.scr\b/gi,
    /\.pif\b/gi,
    // Macro patterns
    /Auto_Open/gi,
    /AutoExec/gi,
    /Document_Open/gi,
    /Workbook_Open/gi,
    // Shell command patterns
    /cmd\.exe/gi,
    /powershell/gi,
    /system\(/gi,
    /exec\(/gi,
    /eval\(/gi,
]);
//# sourceMappingURL=constants.js.map