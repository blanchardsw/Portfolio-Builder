import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ResumeParser } from '../services/resumeParser';
import { PortfolioService } from '../services/portfolioService';

const router = express.Router();
const resumeParser = new ResumeParser();
const portfolioService = new PortfolioService();

// Configure multer for file uploads
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

    // Parse the resume
    const parsedData = await resumeParser.parseFile(req.file.path, req.file.mimetype);
    console.log('✅ Resume parsed successfully');

    // Update portfolio with parsed data
    const portfolio = await portfolioService.updatePortfolioFromResume(parsedData);
    console.log('💾 Portfolio updated successfully');

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
