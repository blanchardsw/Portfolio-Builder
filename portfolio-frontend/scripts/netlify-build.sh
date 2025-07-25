#!/bin/bash

# Netlify-specific build script to handle deprecation warnings
# This script ensures a clean build by suppressing non-critical warnings

set -e  # Exit on any error

echo "🚀 Starting Netlify-optimized build process..."

# Set environment variables to suppress warnings
export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_FUND=false
export NPM_CONFIG_LOGLEVEL=error
export CI=false
export GENERATE_SOURCEMAP=false

# Clean any existing build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf build/
rm -rf node_modules/.cache/

# Install dependencies with legacy peer deps to avoid conflicts
echo "📦 Installing dependencies with legacy peer deps..."
npm ci --legacy-peer-deps --silent --no-audit --no-fund 2>/dev/null || {
    echo "⚠️  npm ci failed, trying npm install..."
    npm install --legacy-peer-deps --silent --no-audit --no-fund 2>/dev/null
}

# Skip tests for Netlify build (they run in CI)
echo "🏗️  Building React application..."
npm run build:only 2>/dev/null || {
    echo "⚠️  Standard build failed, trying with error suppression..."
    NODE_OPTIONS="--max-old-space-size=4096" npm run build:only
}

# Verify build output
if [ -d "build" ] && [ -f "build/index.html" ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build size: $(du -sh build | cut -f1)"
    echo "📁 Build contents:"
    ls -la build/
else
    echo "❌ Build failed - no build directory or index.html found"
    exit 1
fi

echo "🎉 Netlify build process completed!"
