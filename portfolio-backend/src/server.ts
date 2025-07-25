import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { portfolioRouter } from './routes/portfolio';
import { uploadRouter } from './routes/upload';
import authRouter from './routes/auth';
import { ResumeParser } from './services/resumeParser';
import { PortfolioService } from './services/portfolioService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/portfolio', portfolioRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize default portfolio on startup
const initializeDefaultPortfolio = async () => {
  try {
    const resumePath = path.join(__dirname, '../../Stephen_Blanchard-Resume.pdf');
    
    // Check if resume file exists
    if (fs.existsSync(resumePath)) {
      console.log('📄 Found default resume file, parsing...');
      
      const resumeParser = new ResumeParser();
      const portfolioService = new PortfolioService();
      
      // Read the resume file
      const resumeBuffer = fs.readFileSync(resumePath);
      
      // Parse the resume and create portfolio
      const parsedData = await resumeParser.parseBuffer(resumeBuffer, 'application/pdf');
      await portfolioService.updatePortfolioFromResume(parsedData);
      
      console.log('✅ Default portfolio initialized successfully');
    } else {
      console.log('⚠️  Default resume file not found at:', resumePath);
    }
  } catch (error) {
    console.error('❌ Error initializing default portfolio:', error);
  }
};

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Initialize default portfolio after server starts
  await initializeDefaultPortfolio();
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
