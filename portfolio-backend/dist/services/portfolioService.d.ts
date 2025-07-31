import { Portfolio, ParsedResumeData } from '../types/portfolio';
import { IPortfolioService } from '../interfaces/services';
/**
 * Portfolio service implementing the IPortfolioService interface.
 *
 * This service is the core business logic layer for portfolio data management.
 * It implements several important patterns and practices:
 *
 * **Dependency Injection**: Constructor accepts dependencies for better testability
 * **Interface Implementation**: Follows IPortfolioService contract for consistency
 * **Error Handling**: Uses custom error classes for structured error management
 * **Data Validation**: Runtime validation of portfolio structure integrity
 * **Backup System**: Creates backups before data modifications
 * **Async Operations**: Non-blocking file I/O for better performance
 * **Environment Integration**: Fallbacks to environment variables for missing data
 *
 * Key responsibilities:
 * - Reading and writing portfolio JSON data
 * - Parsing and integrating resume data
 * - Validating data structure and content
 * - Managing LinkedIn profile photo integration
 * - Creating data backups for safety
 * - Handling errors gracefully with proper logging
 *
 * @implements {IPortfolioService}
 */
export declare class PortfolioService implements IPortfolioService {
    /** Absolute path to the portfolio JSON data file */
    private readonly dataPath;
    /**
     * Creates a new PortfolioService instance with dependency injection.
     *
     * The constructor uses dependency injection to allow for:
     * - Easy unit testing with mock dependencies
     * - Flexible configuration of data storage location
     * - Swappable LinkedIn photo service implementations
     *
     * @param {string} [dataPath] - Path to portfolio JSON file (defaults to ../../data/portfolio.json)
     *
     * @example
     * ```typescript
     * // Default configuration
     * const service = new PortfolioService();
     *
     * // Custom data path for testing
     * const testService = new PortfolioService('/tmp/test-portfolio.json');
     *
     * // Custom data path for testing
     * const testService = new PortfolioService('/tmp/test-portfolio.json');
     * ```
     */
    constructor(dataPath?: string);
    private ensureDataDirectory;
    /**
     * Retrieves the complete portfolio data from the JSON file with validation.
     *
     * This method implements several safety measures:
     * 1. Uses async file I/O to prevent blocking the event loop
     * 2. Handles file not found gracefully (returns null for new portfolios)
     * 3. Validates the JSON structure to ensure data integrity
     * 4. Throws structured errors for debugging and error handling
     *
     * The validation ensures the portfolio has all required fields and proper structure,
     * preventing runtime errors when the data is used by other parts of the application.
     *
     * @returns {Promise<Portfolio | null>} Complete portfolio data, or null if file doesn't exist
     * @throws {InternalServerError} When file exists but cannot be read or parsed
     * @throws {ValidationError} When portfolio structure is invalid (thrown by validatePortfolioStructure)
     *
     * @example
     * ```typescript
     * const portfolio = await portfolioService.getPortfolio();
     * if (portfolio) {
     *   console.log(`Portfolio for ${portfolio.personalInfo.name}`);
     *   console.log(`${portfolio.workExperience.length} jobs listed`);
     * } else {
     *   console.log('No portfolio found - this is a new user');
     * }
     * ```
     */
    getPortfolio(): Promise<Portfolio | null>;
    private validatePortfolioStructure;
    updatePortfolioFromResume(parsedData: ParsedResumeData): Promise<Portfolio>;
    savePortfolio(portfolio: Portfolio): Promise<void>;
    private createBackupIfExists;
    updatePortfolio(updates: Partial<Portfolio>): Promise<Portfolio>;
}
//# sourceMappingURL=portfolioService.d.ts.map