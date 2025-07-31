"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const portfolio_1 = require("./routes/portfolio");
const upload_1 = require("./routes/upload");
const auth_1 = __importDefault(require("./routes/auth"));
const serviceCache_1 = require("./utils/serviceCache");
// import { setupSwagger } from './config/swagger'; // Uncomment after installing swagger dependencies
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0'; // Railway requires binding to 0.0.0.0
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'https://swb-portfolio.netlify.app',
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    ],
    credentials: true
}));
// Add size limits for better performance and security
app.use(express_1.default.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Routes
app.use('/api/portfolio', portfolio_1.portfolioRouter);
app.use('/api/upload', upload_1.uploadRouter);
app.use('/api/auth', auth_1.default);
// Setup Swagger API documentation
// setupSwagger(app); // Uncomment after installing swagger dependencies
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
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Initialize default portfolio on startup
const initializeDefaultPortfolio = async () => {
    try {
        const resumePath = path_1.default.join(__dirname, '../Stephen_Blanchard-Resume.pdf');
        // Check if resume file exists
        if (fs_1.default.existsSync(resumePath)) {
            console.log('📄 Found default resume file, parsing...');
            // Use cached services for better performance
            const resumeParser = serviceCache_1.serviceCache.getResumeParser();
            const portfolioService = serviceCache_1.serviceCache.getPortfolioService();
            // Read the resume file
            const resumeBuffer = fs_1.default.readFileSync(resumePath);
            // Parse the resume and create portfolio
            const parsedData = await resumeParser.parseBuffer(resumeBuffer, 'application/pdf');
            await portfolioService.updatePortfolioFromResume(parsedData);
            console.log('✅ Default portfolio initialized successfully');
        }
        else {
            console.log('⚠️  Default resume file not found at:', resumePath);
        }
    }
    catch (error) {
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
        }
        catch (error) {
            console.warn('⚠️ Portfolio initialization failed, but server is still running:', error);
        }
    }, 1000);
});
exports.default = app;
//# sourceMappingURL=server.js.map