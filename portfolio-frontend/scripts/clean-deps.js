#!/usr/bin/env node

/**
 * Dependency cleanup script for Netlify deployment
 * This script removes problematic dependencies and cleans up package-lock.json
 * to prevent deprecation warnings during deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up dependencies for Netlify deployment...');

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// List of problematic packages to remove from package-lock.json
const problematicPackages = [
  'w3c-hr-time',
  'rollup-plugin-terser',
  'workbox-cacheable-response',
  'workbox-background-sync',
  'workbox-google-analytics',
  'stable',
  'abab',
  'q',
  'rimraf',
  '@humanwhocodes/object-schema',
  '@humanwhocodes/config-array'
];

// Clean package-lock.json if it exists
const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  console.log('📦 Removing package-lock.json to force clean install...');
  fs.unlinkSync(packageLockPath);
}

// Clean node_modules if it exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('🗑️  Removing node_modules for clean install...');
  fs.rmSync(nodeModulesPath, { recursive: true, force: true });
}

// Update package.json with additional npm config
if (!packageJson.config) {
  packageJson.config = {};
}

packageJson.config.npmConfig = {
  audit: false,
  fund: false,
  'legacy-peer-deps': true,
  loglevel: 'error'
};

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Dependency cleanup completed!');
console.log('📋 Next steps:');
console.log('   1. npm install --legacy-peer-deps');
console.log('   2. npm run build:only');
