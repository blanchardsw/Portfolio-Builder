import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { portfolioRouter } from './routes/portfolio';
import { uploadRouter } from './routes/upload';
import authRouter from './routes/auth';
import { serviceCache } from './utils/serviceCache';

dotenv.config();

const app: express.Application = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0'; // Railway requires binding to 0.0.0.0

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://swb-portfolio.netlify.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true
}));
// Add size limits for better performance and security
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/portfolio', portfolioRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRouter);

// Base API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Portfolio Builder API',
    version: '1.0.0',
    status: 'OK',
    endpoints: {
      portfolio: '/api/portfolio',
      upload: '/api/upload/resume',
      auth: '/api/auth/check-owner/:key',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint - must respond quickly for Railway
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'portfolio-backend',
    port: PORT
  });
});

// Root health check (Railway sometimes checks this)
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Portfolio Backend API',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize default portfolio on startup
const initializeDefaultPortfolio = async () => {
  try {
    const resumePath = path.join(__dirname, '../Stephen_Blanchard-Resume.pdf');
    
    // Check if resume file exists
    if (fs.existsSync(resumePath)) {
      console.log('📄 Found default resume file, parsing...');
      
      // Use cached services for better performance
      const resumeParser = serviceCache.getResumeParser();
      const portfolioService = serviceCache.getPortfolioService();
      
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

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
  console.log('✅ Server ready for health checks');
  
  // Initialize default portfolio in background (don't block server startup)
  setTimeout(async () => {
    try {
      await initializeDefaultPortfolio();
      console.log('✅ Portfolio initialization complete');
    } catch (error) {
      console.warn('⚠️ Portfolio initialization failed, but server is still running:', error);
    }
  }, 1000);
});

export default app;
