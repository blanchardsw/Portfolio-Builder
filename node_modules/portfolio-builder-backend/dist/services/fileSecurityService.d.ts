export interface SecurityScanResult {
    isSecure: boolean;
    threats: string[];
    fileInfo: {
        size: number;
        mimeType: string;
        extension: string;
        hash: string;
    };
}
export declare class FileSecurityService {
    private readonly ALLOWED_MIME_TYPES;
    private readonly ALLOWED_EXTENSIONS;
    private readonly MAX_FILE_SIZE;
    private readonly MIN_FILE_SIZE;
    private readonly FILE_SIGNATURES;
    private readonly MALICIOUS_PATTERNS;
    scanFile(filePath: string, mimeType: string): Promise<SecurityScanResult>;
    private validateBasicFileProperties;
    private validateFileSignature;
    private scanFileContent;
    private calculateFileHash;
    quarantineFile(filePath: string): string;
}
//# sourceMappingURL=fileSecurityService.d.ts.map