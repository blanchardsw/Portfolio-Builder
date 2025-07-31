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
// import { setupSwagger } from './config/swagger'; // Uncomment after installing swagger dependencies

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

// API Documentation endpoint (simple version)
app.get('/api/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Portfolio Builder API Documentation</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        h2 { color: #007acc; margin-top: 30px; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007acc; }
        .method { font-weight: bold; color: #28a745; }
        .url { font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
        .description { margin-top: 8px; color: #666; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Portfolio Builder API</h1>
        <p>A comprehensive API for portfolio generation and resume processing</p>
        
        <h2>📋 Available Endpoints</h2>
        
        <div class="endpoint">
          <div><span class="method">GET</span> <span class="url">/api/portfolio</span></div>
          <div class="description">Retrieve complete portfolio data including personal info, experience, education, and skills</div>
        </div>
        
        <div class="endpoint">
          <div><span class="method">POST</span> <span class="url">/api/upload/resume</span></div>
          <div class="description">Upload and parse resume files (PDF, DOCX, DOC, TXT). Includes security validation and content analysis.</div>
        </div>
        
        <div class="endpoint">
          <div><span class="method">GET</span> <span class="url">/api/health</span></div>
          <div class="description">Health check endpoint for monitoring server status</div>
        </div>
        
        <div class="endpoint">
          <div><span class="method">POST</span> <span class="url">/api/auth/check-owner/:key</span></div>
          <div class="description">Validate owner access key for administrative functions</div>
        </div>
        
        <h2>📊 Example Responses</h2>
        
        <h3>Portfolio Data (GET /api/portfolio)</h3>
        <pre>{
  "personalInfo": {
    "name": "Stephen Blanchard",
    "title": "Full Stack Developer",
    "email": "stephen@example.com",
    "phone": "+1 (555) 123-4567",
    "location": "San Francisco, CA"
  },
  "experience": [...],
  "education": [...],
  "skills": [...]
}</pre>
        
        <h3>File Upload (POST /api/upload/resume)</h3>
        <pre>{
  "success": true,
  "filename": "resume_20240131_123456.pdf",
  "originalName": "Stephen_Blanchard_Resume.pdf",
  "size": 108746,
  "analysis": {
    "extractedText": "Stephen Blanchard\\nFull Stack Developer...",
    "wordCount": 450
  }
}</pre>
        
        <h2>🔒 Security Features</h2>
        <ul>
          <li>File signature validation</li>
          <li>Content scanning for malicious patterns</li>
          <li>Size limits (100 bytes - 10MB)</li>
          <li>Quarantine system for suspicious files</li>
          <li>CORS protection</li>
        </ul>
        
        <p style="margin-top: 40px; text-align: center; color: #666;">
          <strong>Portfolio Builder API v1.0.0</strong><br>
          Built with TypeScript, Express.js, and Node.js
        </p>
      </div>
    </body>
    </html>
  `);
});

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
