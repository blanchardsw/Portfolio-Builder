"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const resumeParser_1 = require("../services/resumeParser");
const portfolioService_1 = require("../services/portfolioService");
const fileSecurityService_1 = require("../services/fileSecurityService");
const router = express_1.default.Router();
exports.uploadRouter = router;
const resumeParser = new resumeParser_1.ResumeParser();
const portfolioService = new portfolioService_1.PortfolioService();
const fileSecurityService = new fileSecurityService_1.FileSecurityService();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        cb(null, `resume_${timestamp}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'), false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
// Upload and parse resume endpoint
router.post('/resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log(`📄 Processing resume: ${req.file.originalname}`);
        console.log(`📁 File saved to: ${req.file.path}`);
        console.log(`📊 File size: ${req.file.size} bytes`);
        console.log(`🔍 MIME type: ${req.file.mimetype}`);
        // 🔒 SECURITY SCAN - Check for malicious content
        console.log('🔒 Starting security scan...');
        const securityScan = await fileSecurityService.scanFile(req.file.path, req.file.mimetype);
        if (!securityScan.isSecure) {
            // Quarantine the file and reject upload
            const quarantinePath = fileSecurityService.quarantineFile(req.file.path);
            console.error(`🚨 SECURITY THREAT DETECTED: ${securityScan.threats.join(', ')}`);
            return res.status(400).json({
                error: 'File upload rejected due to security concerns',
                threats: securityScan.threats,
                message: 'Please upload a clean resume file in PDF, DOCX, or TXT format'
            });
        }
        console.log('✅ Security scan passed - file is clean');
        console.log(`🔐 File hash: ${securityScan.fileInfo.hash}`);
        console.log(`📋 Validated file info:`, securityScan.fileInfo);
        // Parse the resume
        const parsedData = await resumeParser.parseFile(req.file.path, req.file.mimetype);
        console.log('✅ Resume parsed successfully');
        // Update portfolio with parsed data
        const portfolio = await portfolioService.updatePortfolioFromResume(parsedData);
        console.log('💾 Portfolio updated successfully');
        // Save as new default resume file (overwrite existing)
        const defaultResumePath = path_1.default.join(__dirname, '../../Stephen_Blanchard-Resume.pdf');
        try {
            // Copy uploaded file to default resume location
            fs_1.default.copyFileSync(req.file.path, defaultResumePath);
            console.log('📄 Default resume file updated successfully');
        }
        catch (error) {
            console.warn('⚠️ Could not update default resume file:', error);
        }
        // Clean up uploaded file
        fs_1.default.unlinkSync(req.file.path);
        console.log('🗑️ Temporary file cleaned up');
        res.json({
            message: 'Resume uploaded and processed successfully',
            portfolio,
            parsedData: {
                personalInfo: parsedData.personalInfo,
                workExperienceCount: parsedData.workExperience.length,
                educationCount: parsedData.education.length,
                skillsCount: parsedData.skills.length,
                projectsCount: parsedData.projects.length
            }
        });
    }
    catch (error) {
        console.error('❌ Error processing resume:', error);
        // Clean up file if it exists
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({
            error: 'Failed to process resume',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get upload status
router.get('/status', (req, res) => {
    res.json({
        status: 'ready',
        supportedFormats: ['PDF', 'DOCX', 'DOC', 'TXT'],
        maxFileSize: '5MB',
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=upload.js.map