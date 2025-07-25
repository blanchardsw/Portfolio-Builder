"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxParser = void 0;
const IFileParser_1 = require("./IFileParser");
const mammoth_1 = __importDefault(require("mammoth"));
/**
 * DOCX file parser following Single Responsibility Principle
 */
class DocxParser {
    canParse(mimeType) {
        return mimeType === IFileParser_1.SupportedMimeTypes.DOCX;
    }
    async parse(filePath) {
        const result = await mammoth_1.default.extractRawText({ path: filePath });
        return result.value;
    }
}
exports.DocxParser = DocxParser;
//# sourceMappingURL=DocxParser.js.map