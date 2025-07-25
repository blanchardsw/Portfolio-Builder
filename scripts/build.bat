@echo off
REM Portfolio Builder - Build Script with Test Integration (Windows)
REM This script runs tests and builds both backend and frontend with proper error handling

setlocal enabledelayedexpansion

echo 🚀 Starting Portfolio Builder Build Process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the portfolio-builder root directory
    exit /b 1
)

REM Check required directories
if not exist "portfolio-backend" (
    echo [ERROR] Directory portfolio-backend not found!
    exit /b 1
)

if not exist "portfolio-frontend" (
    echo [ERROR] Directory portfolio-frontend not found!
    exit /b 1
)

echo [INFO] Starting build process with integrated testing...

REM Step 1: Install dependencies if needed
echo [INFO] Checking dependencies...
if not exist "portfolio-backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd portfolio-backend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Backend dependency installation failed
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Backend dependencies installed
)

if not exist "portfolio-frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd portfolio-frontend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Frontend dependency installation failed
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Frontend dependencies installed
)

REM Step 2: Run backend tests with coverage
echo [INFO] Running backend tests with coverage...
cd portfolio-backend
call npm run test:ci
if errorlevel 1 (
    echo [ERROR] Backend tests failed
    exit /b 1
)
cd ..
echo [SUCCESS] Backend tests completed

REM Step 3: Run frontend tests with coverage
echo [INFO] Running frontend tests with coverage...
cd portfolio-frontend
call npm run test:ci
if errorlevel 1 (
    echo [ERROR] Frontend tests failed
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend tests completed

REM Step 4: Build backend
echo [INFO] Building backend...
cd portfolio-backend
call npm run build:compile
if errorlevel 1 (
    echo [ERROR] Backend build failed
    exit /b 1
)
cd ..
echo [SUCCESS] Backend compilation completed

REM Step 5: Build frontend
echo [INFO] Building frontend...
cd portfolio-frontend
call npm run build:only
if errorlevel 1 (
    echo [ERROR] Frontend build failed
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend build completed

REM Step 6: Generate build report
echo [INFO] Generating build report...
echo.
echo 📊 BUILD REPORT
echo ===============

REM Backend coverage report
if exist "portfolio-backend\coverage\coverage-summary.json" (
    echo [SUCCESS] Backend test coverage generated
    echo    Coverage report: portfolio-backend\coverage\lcov-report\index.html
) else (
    echo [WARNING] Backend coverage report not found
)

REM Frontend coverage report
if exist "portfolio-frontend\coverage\coverage-summary.json" (
    echo [SUCCESS] Frontend test coverage generated
    echo    Coverage report: portfolio-frontend\coverage\lcov-report\index.html
) else (
    echo [WARNING] Frontend coverage report not found
)

REM Backend build artifacts
if exist "portfolio-backend\dist" (
    echo [SUCCESS] Backend compiled successfully
    echo    Build output: portfolio-backend\dist\
) else (
    echo [WARNING] Backend dist directory not found
)

REM Frontend build artifacts
if exist "portfolio-frontend\build" (
    echo [SUCCESS] Frontend built successfully
    echo    Build output: portfolio-frontend\build\
) else (
    echo [WARNING] Frontend build directory not found
)

echo.
echo [SUCCESS] 🎉 Build completed successfully!
echo [INFO] Both backend and frontend passed all tests and built successfully.
echo.
echo 🚀 Ready for deployment!
echo.
echo Next steps:
echo   • Review test coverage reports
echo   • Deploy backend: portfolio-backend\dist\
echo   • Deploy frontend: portfolio-frontend\build\
echo   • Set up production environment variables
echo.

endlocal
