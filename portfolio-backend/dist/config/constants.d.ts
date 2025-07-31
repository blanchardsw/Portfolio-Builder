/**
 * Application constants and configuration values
 * Centralized location for all magic numbers and strings
 */
export declare const FILE_CONSTANTS: Readonly<{
    readonly MAX_FILE_SIZE: number;
    readonly MIN_FILE_SIZE: 100;
    readonly SCAN_SIZE_LIMIT: number;
    readonly MAX_THREATS_BEFORE_EXIT: 3;
}>;
export declare const MIME_TYPES: Readonly<{
    readonly PDF: "application/pdf";
    readonly DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    readonly DOC: "application/msword";
    readonly TEXT: "text/plain";
}>;
export declare const FILE_EXTENSIONS: Readonly<{
    readonly PDF: ".pdf";
    readonly DOCX: ".docx";
    readonly DOC: ".doc";
    readonly TXT: ".txt";
}>;
export declare const CACHE_DURATIONS: Readonly<{
    readonly PORTFOLIO_CACHE: number;
    readonly SERVICE_CACHE: number;
}>;
export declare const API_LIMITS: Readonly<{
    readonly JSON_PAYLOAD_LIMIT: "10mb";
    readonly URL_ENCODED_LIMIT: "10mb";
}>;
export declare const SKILL_CATEGORIES: readonly ["technical", "soft", "language"];
export declare const SKILL_LEVELS: readonly ["beginner", "intermediate", "advanced", "expert"];
export declare const FILE_SIGNATURES: Readonly<{
    readonly PDF: readonly number[];
    readonly DOCX: readonly number[];
    readonly DOC: readonly number[];
}>;
export declare const EXECUTABLE_SIGNATURES: readonly [readonly number[], readonly number[], readonly number[]];
export declare const MALICIOUS_PATTERNS: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
//# sourceMappingURL=constants.d.ts.map