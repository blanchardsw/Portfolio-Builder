"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSecurityService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
class FileSecurityService {
    constructor() {
        this.ALLOWED_MIME_TYPES = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/msword', // .doc
            'text/plain'
        ];
        this.ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        this.MIN_FILE_SIZE = 100; // 100 bytes
        // File signatures (magic numbers) for validation
        this.FILE_SIGNATURES = {
            'pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
            'docx': [0x50, 0x4B, 0x03, 0x04], // ZIP header (DOCX is ZIP-based)
            'doc': [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE header
        };
        // Suspicious patterns that might indicate malicious content
        this.MALICIOUS_PATTERNS = [
            // JavaScript patterns
            /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /onload\s*=/gi,
            /onerror\s*=/gi,
            /onclick\s*=/gi,
            // Executable patterns
            /\.exe\b/gi,
            /\.bat\b/gi,
            /\.cmd\b/gi,
            /\.scr\b/gi,
            /\.com\b/gi,
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
        ];
    }
    async scanFile(filePath, mimeType) {
        const threats = [];
        try {
            // 1. Basic file validation
            const basicValidation = this.validateBasicFileProperties(filePath, mimeType);
            if (!basicValidation.isValid) {
                threats.push(...basicValidation.threats);
            }
            // 2. File signature validation
            const signatureValidation = await this.validateFileSignature(filePath, mimeType);
            if (!signatureValidation.isValid) {
                threats.push(...signatureValidation.threats);
            }
            // 3. Content scanning
            const contentScan = await this.scanFileContent(filePath);
            if (!contentScan.isClean) {
                threats.push(...contentScan.threats);
            }
            // 4. File hash calculation for tracking
            const fileHash = await this.calculateFileHash(filePath);
            // 5. Get file info
            const stats = fs_1.default.statSync(filePath);
            const extension = path_1.default.extname(filePath).toLowerCase();
            const fileInfo = {
                size: stats.size,
                mimeType,
                extension,
                hash: fileHash
            };
            const isSecure = threats.length === 0;
            console.log(`🔒 Security scan complete for ${path_1.default.basename(filePath)}: ${isSecure ? 'SECURE' : 'THREATS DETECTED'}`);
            if (threats.length > 0) {
                console.warn(`⚠️ Threats detected: ${threats.join(', ')}`);
            }
            return {
                isSecure,
                threats,
                fileInfo
            };
        }
        catch (error) {
            console.error('❌ Error during security scan:', error);
            return {
                isSecure: false,
                threats: ['Security scan failed'],
                fileInfo: {
                    size: 0,
                    mimeType: 'unknown',
                    extension: 'unknown',
                    hash: 'unknown'
                }
            };
        }
    }
    validateBasicFileProperties(filePath, mimeType) {
        const threats = [];
        // Check if file exists
        if (!fs_1.default.existsSync(filePath)) {
            threats.push('File does not exist');
            return { isValid: false, threats };
        }
        // Check file size
        const stats = fs_1.default.statSync(filePath);
        if (stats.size > this.MAX_FILE_SIZE) {
            threats.push(`File too large: ${stats.size} bytes (max: ${this.MAX_FILE_SIZE})`);
        }
        if (stats.size < this.MIN_FILE_SIZE) {
            threats.push(`File too small: ${stats.size} bytes (min: ${this.MIN_FILE_SIZE})`);
        }
        // Check MIME type
        if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
            threats.push(`Disallowed MIME type: ${mimeType}`);
        }
        // Check file extension
        const extension = path_1.default.extname(filePath).toLowerCase();
        if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
            threats.push(`Disallowed file extension: ${extension}`);
        }
        // Check for double extensions (e.g., .pdf.exe)
        const filename = path_1.default.basename(filePath);
        const extensionCount = (filename.match(/\./g) || []).length;
        if (extensionCount > 1) {
            threats.push('Multiple file extensions detected (possible disguised executable)');
        }
        return { isValid: threats.length === 0, threats };
    }
    async validateFileSignature(filePath, mimeType) {
        const threats = [];
        try {
            const buffer = fs_1.default.readFileSync(filePath);
            // Check file signature based on MIME type
            let expectedSignature;
            if (mimeType === 'application/pdf') {
                expectedSignature = this.FILE_SIGNATURES.pdf;
            }
            else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                expectedSignature = this.FILE_SIGNATURES.docx;
            }
            else if (mimeType === 'application/msword') {
                expectedSignature = this.FILE_SIGNATURES.doc;
            }
            if (expectedSignature) {
                const fileSignature = Array.from(buffer.slice(0, expectedSignature.length));
                const signatureMatch = expectedSignature.every((byte, index) => byte === fileSignature[index]);
                if (!signatureMatch) {
                    threats.push(`File signature mismatch: expected ${mimeType} but signature doesn't match`);
                }
            }
            // Check for executable signatures in any file
            const executableSignatures = [
                [0x4D, 0x5A], // MZ (Windows executable)
                [0x7F, 0x45, 0x4C, 0x46], // ELF (Linux executable)
                [0xCA, 0xFE, 0xBA, 0xBE], // Mach-O (macOS executable)
            ];
            for (const signature of executableSignatures) {
                const matches = signature.every((byte, index) => byte === buffer[index]);
                if (matches) {
                    threats.push('Executable file signature detected');
                    break;
                }
            }
        }
        catch (error) {
            threats.push('Could not validate file signature');
        }
        return { isValid: threats.length === 0, threats };
    }
    async scanFileContent(filePath) {
        const threats = [];
        try {
            // Read file content as text (for pattern matching)
            const buffer = fs_1.default.readFileSync(filePath);
            const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024 * 1024)); // First 1MB only
            // Scan for malicious patterns
            for (const pattern of this.MALICIOUS_PATTERNS) {
                if (pattern.test(content)) {
                    threats.push(`Suspicious pattern detected: ${pattern.source}`);
                }
            }
            // Check for embedded files or unusual content
            if (content.includes('Content-Type:')) {
                threats.push('Possible embedded MIME content detected');
            }
            // Check for null bytes (could indicate binary content in text files)
            if (content.includes('\0') && path_1.default.extname(filePath).toLowerCase() === '.txt') {
                threats.push('Null bytes detected in text file');
            }
        }
        catch (error) {
            // File might be binary, which is expected for PDF/DOCX
            // Only flag as threat if it's supposed to be a text file
            if (path_1.default.extname(filePath).toLowerCase() === '.txt') {
                threats.push('Could not read file as text');
            }
        }
        return { isClean: threats.length === 0, threats };
    }
    async calculateFileHash(filePath) {
        try {
            const buffer = fs_1.default.readFileSync(filePath);
            return crypto_1.default.createHash('sha256').update(buffer).digest('hex');
        }
        catch (error) {
            return 'hash_calculation_failed';
        }
    }
    // Additional method to quarantine suspicious files
    quarantineFile(filePath) {
        const quarantineDir = path_1.default.join(path_1.default.dirname(filePath), 'quarantine');
        if (!fs_1.default.existsSync(quarantineDir)) {
            fs_1.default.mkdirSync(quarantineDir, { recursive: true });
        }
        const timestamp = Date.now();
        const quarantinePath = path_1.default.join(quarantineDir, `quarantined_${timestamp}_${path_1.default.basename(filePath)}`);
        fs_1.default.renameSync(filePath, quarantinePath);
        console.log(`🚨 File quarantined: ${quarantinePath}`);
        return quarantinePath;
    }
}
exports.FileSecurityService = FileSecurityService;
//# sourceMappingURL=fileSecurityService.js.map