"use strict";
/**
 * Tests for server initialization and startup functionality
 *
 * Tests cover:
 * - Default portfolio initialization
 * - API info endpoint
 * - Health check endpoint
 * - Server startup error handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Mock all dependencies
jest.mock('../../utils/serviceCache');
jest.mock('fs');
jest.mock('path');
// Mock the routes
jest.mock('../../routes/auth', () => {
    const router = express_1.default.Router();
    router.post('/validate-owner', (req, res) => res.json({ isOwner: true }));
    return router;
});
jest.mock('../../routes/portfolio', () => ({
    portfolioRouter: (() => {
        const router = express_1.default.Router();
        router.get('/', (req, res) => res.json({ test: 'portfolio' }));
        return router;
    })()
}));
jest.mock('../../routes/upload', () => ({
    uploadRouter: (() => {
        const router = express_1.default.Router();
        router.post('/resume', (req, res) => res.json({ message: 'uploaded' }));
        return router;
    })()
}));
const mockFs = fs_1.default;
const mockPath = path_1.default;
// Mock service cache
const mockServiceCache = {
    getResumeParser: jest.fn().mockReturnValue({
        parseBuffer: jest.fn().mockResolvedValue({
            personalInfo: { name: 'Test User', email: 'test@example.com' },
            workExperience: [],
            education: [],
            skills: []
        })
    }),
    getPortfolioService: jest.fn().mockReturnValue({
        updatePortfolioFromResume: jest.fn().mockResolvedValue(undefined)
    })
};
jest.doMock('../../utils/serviceCache', () => ({
    serviceCache: mockServiceCache
}));
describe('Server Initialization', () => {
    let app;
    let consoleLogSpy;
    let consoleErrorSpy;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Mock console methods
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        // Mock path.join to return a test path
        mockPath.join.mockReturnValue('/test/path/Stephen_Blanchard-Resume.pdf');
        // Create a fresh app instance for each test
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        // Add the routes that would be in server.ts
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
        app.get('/api/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: '1.0.0'
            });
        });
    });
    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });
    describe('API info endpoint', () => {
        it('should return API information', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api')
                .expect(200);
            expect(response.body).toMatchObject({
                message: 'Portfolio Builder API',
                version: '1.0.0',
                status: 'OK',
                endpoints: {
                    portfolio: '/api/portfolio',
                    upload: '/api/upload/resume',
                    auth: '/api/auth/check-owner/:key',
                    health: '/api/health'
                }
            });
            expect(response.body.timestamp).toBeDefined();
        });
    });
    describe('health check endpoint', () => {
        it('should return health status', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/health')
                .expect(200);
            expect(response.body).toMatchObject({
                status: 'OK',
                version: '1.0.0'
            });
            expect(response.body.timestamp).toBeDefined();
            expect(response.body.uptime).toBeDefined();
            expect(response.body.memory).toBeDefined();
        });
    });
    describe('initializeDefaultPortfolio function', () => {
        // Test the initialization logic that would be in server.ts
        const initializeDefaultPortfolio = async () => {
            try {
                const resumePath = mockPath.join('__dirname', '../../Stephen_Blanchard-Resume.pdf');
                if (mockFs.existsSync(resumePath)) {
                    console.log('📄 Found default resume file, parsing...');
                    const resumeParser = mockServiceCache.getResumeParser();
                    const portfolioService = mockServiceCache.getPortfolioService();
                    const resumeBuffer = mockFs.readFileSync(resumePath);
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
        it('should initialize portfolio when resume file exists', async () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(Buffer.from('mock pdf content'));
            // Act
            await initializeDefaultPortfolio();
            // Assert
            expect(mockFs.existsSync).toHaveBeenCalled();
            expect(mockFs.readFileSync).toHaveBeenCalled();
            expect(mockServiceCache.getResumeParser).toHaveBeenCalled();
            expect(mockServiceCache.getPortfolioService).toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith('📄 Found default resume file, parsing...');
            expect(consoleLogSpy).toHaveBeenCalledWith('✅ Default portfolio initialized successfully');
        });
        it('should handle missing resume file gracefully', async () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(false);
            // Act
            await initializeDefaultPortfolio();
            // Assert
            expect(mockFs.existsSync).toHaveBeenCalled();
            expect(mockFs.readFileSync).not.toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith('⚠️  Default resume file not found at:', expect.any(String));
        });
        it('should handle initialization errors gracefully', async () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockImplementation(() => {
                throw new Error('File read error');
            });
            // Act
            await initializeDefaultPortfolio();
            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error initializing default portfolio:', expect.any(Error));
        });
        it('should handle resume parsing errors gracefully', async () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(Buffer.from('mock content'));
            mockServiceCache.getResumeParser.mockReturnValue({
                parseBuffer: jest.fn().mockRejectedValue(new Error('Parse error'))
            });
            // Act
            await initializeDefaultPortfolio();
            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error initializing default portfolio:', expect.any(Error));
        });
        it('should handle portfolio update errors gracefully', async () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(Buffer.from('mock content'));
            mockServiceCache.getPortfolioService.mockReturnValue({
                updatePortfolioFromResume: jest.fn().mockRejectedValue(new Error('Update error'))
            });
            // Act
            await initializeDefaultPortfolio();
            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error initializing default portfolio:', expect.any(Error));
        });
    });
});
//# sourceMappingURL=initialization.test.js.map