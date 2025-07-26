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
const resumeParser_1 = require("./services/resumeParser");
const portfolioService_1 = require("./services/portfolioService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/portfolio', portfolio_1.portfolioRouter);
app.use('/api/upload', upload_1.uploadRouter);
app.use('/api/auth', auth_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Initialize default portfolio on startup
const initializeDefaultPortfolio = async () => {
    try {
        const resumePath = path_1.default.join(__dirname, '../../Stephen_Blanchard-Resume.pdf');
        // Check if resume file exists
        if (fs_1.default.existsSync(resumePath)) {
            console.log('📄 Found default resume file, parsing...');
            const resumeParser = new resumeParser_1.ResumeParser();
            const portfolioService = new portfolioService_1.PortfolioService();
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
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // Initialize default portfolio after server starts
    await initializeDefaultPortfolio();
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
exports.default = app;
//# sourceMappingURL=server.js.map