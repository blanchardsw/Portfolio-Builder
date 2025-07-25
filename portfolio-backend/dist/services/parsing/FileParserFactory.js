"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileParserFactory = void 0;
const IFileParser_1 = require("./IFileParser");
const PdfParser_1 = require("./PdfParser");
const DocxParser_1 = require("./DocxParser");
const TextParser_1 = require("./TextParser");
/**
 * Factory for creating file parsers following Factory Pattern
 * Eliminates conditional logic from main parser class
 */
class FileParserFactory {
    constructor() {
        this.parsers = [
            new PdfParser_1.PdfParser(),
            new DocxParser_1.DocxParser(),
            new TextParser_1.TextParser()
        ];
    }
    createParser(mimeType) {
        const parser = this.parsers.find(p => p.canParse(mimeType));
        if (!parser) {
            throw new Error(`Unsupported file type: ${mimeType}`);
        }
        return parser;
    }
    getSupportedMimeTypes() {
        return Object.values(IFileParser_1.SupportedMimeTypes);
    }
}
exports.FileParserFactory = FileParserFactory;
//# sourceMappingURL=FileParserFactory.js.map