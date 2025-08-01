const fs = require('fs');
const path = require('path');

// Simple test to check if resume files exist and are accessible
console.log('🧪 Testing Resume File Access...\n');

const oldResumePath = path.join(__dirname, 'portfolio-backend', 'Stephen_Blanchard-Resume.pdf');
const newResumePath = path.join(__dirname, 'Stephen_Blanchard-Resume (new).pdf');

console.log('📄 Checking OLD resume format:', oldResumePath);
if (fs.existsSync(oldResumePath)) {
  const stats = fs.statSync(oldResumePath);
  console.log('✅ Old resume file exists:', stats.size, 'bytes');
} else {
  console.log('❌ Old resume file not found');
}

console.log('\n📄 Checking NEW resume format:', newResumePath);
if (fs.existsSync(newResumePath)) {
  const stats = fs.statSync(newResumePath);
  console.log('✅ New resume file exists:', stats.size, 'bytes');
} else {
  console.log('❌ New resume file not found');
}

console.log('\n🔧 Backend server should be running on http://localhost:3001');
console.log('📋 You can test resume parsing by uploading files through the frontend or API');
console.log('🎯 The enhanced parser now supports:');
console.log('   - Skill groups with headers (Languages:, Testing:, etc.)');
console.log('   - Granular skill categorization');
console.log('   - Both old and new resume formats');
