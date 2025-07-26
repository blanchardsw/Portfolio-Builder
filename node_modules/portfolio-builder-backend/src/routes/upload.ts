import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { serviceCache } from '../utils/serviceCache';

const router = express.Router();
// Use cached services for better performance
const resumeParser = serviceCache.getResumeParser();
const portfolioService = serviceCache.getPortfolioService();
const fileSecurityService = serviceCache.getFileSecurityService();

/**
 * Multer configuration for secure file uploads.
 * 
 * This configuration implements the first layer of our multi-layered security approach:
 * 
 * **File Size Limits**: Prevents DoS attacks through large file uploads
 * - Maximum size defined in limits (typically 5MB)
 * - Protects server disk space and memory usage
 * 
 * **MIME Type Filtering**: Basic file type validation at upload time
 * - Only allows PDF, DOCX, DOC, and TXT files
 * - Prevents obvious malicious file types (executables, scripts)
 * - Note: This is just the first check - deeper validation happens later
 * 
 * **Temporary Storage**: Files are stored in 'uploads/' directory temporarily
 * - Files are processed and then cleaned up
 * - Prevents accumulation of uploaded files on disk
 * 
 * Additional security layers are applied after upload:
 * 1. File signature validation (magic number checking)
 * 2. Content scanning for malicious patterns
 * 3. Resume parsing and validation
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `resume_${timestamp}${ext}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handling middleware for multer
router.use('/resume', (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer error:', error.message);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  } else if (error) {
    console.error('❌ File filter error:', error.message);
    return res.status(400).json({ error: error.message });
  }
  next();
});

/**
 * Resume upload and processing endpoint.
 * 
 * This endpoint implements a comprehensive multi-stage pipeline for secure resume processing:
 * 
 * **Stage 1: File Upload Validation (Multer)**
 * - MIME type validation (PDF, DOCX, DOC, TXT only)
 * - File size limits (5MB maximum)
 * - Temporary file storage with unique naming
 * 
 * **Stage 2: Security Scanning**
 * - File signature validation (magic number verification)
 * - Content scanning for malicious patterns (scripts, executables, macros)
 * - Threat detection and quarantine system
 * - File integrity verification with hash calculation
 * 
 * **Stage 3: Resume Parsing**
 * - Content extraction from supported formats
 * - Structured data parsing (personal info, experience, education, skills)
 * - Data validation and normalization
 * 
 * **Stage 4: Portfolio Integration**
 * - Merging parsed data with existing portfolio
 * - LinkedIn profile photo fetching
 * - Environment variable fallbacks for missing data
 * - Data backup and atomic updates
 * 
 * **Error Handling**
 * - Detailed logging for debugging
 * - User-friendly error messages
 * - Automatic file cleanup on errors
 * - Structured error responses with threat details
 * 
 * @route POST /api/upload/resume
 * @param {Express.Multer.File} resume - Resume file (PDF, DOCX, DOC, or TXT)
 * @returns {Object} Success response with updated portfolio data
 * @returns {Object} Error response with details for debugging
 * 
 * @example
 * ```javascript
 * // Frontend usage
 * const formData = new FormData();
 * formData.append('resume', file);
 * 
 * const response = await fetch('/api/upload/resume', {
 *   method: 'POST',
 *   body: formData
 * });
 * 
 * if (response.ok) {
 *   const result = await response.json();
 *   console.log('Portfolio updated:', result.portfolio);
 * } else {
 *   const error = await response.json();
 *   console.error('Upload failed:', error.error);
 * }
 * ```
 */
router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('📋 Request headers:', req.headers);
    console.log('📁 Multer file info:', req.file ? 'File received' : 'No file');
    
    if (!req.file) {
      console.error('❌ No file uploaded - multer did not process any file');
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
    const defaultResumePath = path.join(__dirname, '../../Stephen_Blanchard-Resume.pdf');
    try {
      // Copy uploaded file to default resume location
      fs.copyFileSync(req.file.path, defaultResumePath);
      console.log('📄 Default resume file updated successfully');
    } catch (error) {
      console.warn('⚠️ Could not update default resume file:', error);
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
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

  } catch (error) {
    console.error('❌ Error processing resume:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
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

export { router as uploadRouter };
