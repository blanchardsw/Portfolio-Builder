#!/bin/bash

# Portfolio Builder - Build Script with Test Integration
# This script runs tests and builds both backend and frontend with proper error handling

set -e  # Exit on any error

echo "🚀 Starting Portfolio Builder Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if directory exists
check_directory() {
    if [ ! -d "$1" ]; then
        print_error "Directory $1 not found!"
        exit 1
    fi
}

# Function to run command with error handling
run_command() {
    local cmd="$1"
    local desc="$2"
    
    print_status "$desc"
    if eval "$cmd"; then
        print_success "$desc completed"
    else
        print_error "$desc failed"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the portfolio-builder root directory"
    exit 1
fi

# Check required directories
check_directory "portfolio-backend"
check_directory "portfolio-frontend"

print_status "Starting build process with integrated testing..."

# Step 1: Install dependencies if needed
print_status "Checking dependencies..."
if [ ! -d "portfolio-backend/node_modules" ]; then
    run_command "cd portfolio-backend && npm install" "Installing backend dependencies"
fi

if [ ! -d "portfolio-frontend/node_modules" ]; then
    run_command "cd portfolio-frontend && npm install" "Installing frontend dependencies"
fi

# Step 2: Run backend tests with coverage
print_status "Running backend tests with coverage..."
run_command "cd portfolio-backend && npm run test:ci" "Backend tests"

# Step 3: Run frontend tests with coverage
print_status "Running frontend tests with coverage..."
run_command "cd portfolio-frontend && npm run test:ci" "Frontend tests"

# Step 4: Build backend
print_status "Building backend..."
run_command "cd portfolio-backend && npm run build:compile" "Backend compilation"

# Step 5: Build frontend
print_status "Building frontend..."
run_command "cd portfolio-frontend && npm run build:only" "Frontend build"

# Step 6: Generate build report
print_status "Generating build report..."

echo ""
echo "📊 BUILD REPORT"
echo "==============="

# Backend coverage report
if [ -f "portfolio-backend/coverage/coverage-summary.json" ]; then
    print_success "Backend test coverage generated"
    echo "   Coverage report: portfolio-backend/coverage/lcov-report/index.html"
else
    print_warning "Backend coverage report not found"
fi

# Frontend coverage report
if [ -f "portfolio-frontend/coverage/coverage-summary.json" ]; then
    print_success "Frontend test coverage generated"
    echo "   Coverage report: portfolio-frontend/coverage/lcov-report/index.html"
else
    print_warning "Frontend coverage report not found"
fi

# Backend build artifacts
if [ -d "portfolio-backend/dist" ]; then
    print_success "Backend compiled successfully"
    echo "   Build output: portfolio-backend/dist/"
else
    print_warning "Backend dist directory not found"
fi

# Frontend build artifacts
if [ -d "portfolio-frontend/build" ]; then
    print_success "Frontend built successfully"
    echo "   Build output: portfolio-frontend/build/"
    
    # Show build size
    if command -v du &> /dev/null; then
        BUILD_SIZE=$(du -sh portfolio-frontend/build | cut -f1)
        echo "   Build size: $BUILD_SIZE"
    fi
else
    print_warning "Frontend build directory not found"
fi

echo ""
print_success "🎉 Build completed successfully!"
print_status "Both backend and frontend passed all tests and built successfully."

# Optional: Run a quick smoke test
if [ "$1" = "--smoke-test" ]; then
    print_status "Running smoke test..."
    
    # Start backend in background
    cd portfolio-backend && npm start &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 5
    
    # Test backend health
    if curl -f http://localhost:3001/api/portfolio > /dev/null 2>&1; then
        print_success "Backend smoke test passed"
    else
        print_warning "Backend smoke test failed"
    fi
    
    # Clean up
    kill $BACKEND_PID 2>/dev/null || true
fi

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "  • Review test coverage reports"
echo "  • Deploy backend: portfolio-backend/dist/"
echo "  • Deploy frontend: portfolio-frontend/build/"
echo "  • Set up production environment variables"
echo ""
