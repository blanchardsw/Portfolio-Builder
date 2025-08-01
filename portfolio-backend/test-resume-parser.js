const { ResumeParser } = require('./dist/services/resumeParser');
const path = require('path');

async function testResumeParser() {
  const parser = new ResumeParser();
  
  console.log('🧪 Testing Resume Parser with both formats...\n');
  
  // Test old resume format
  const oldResumePath = path.join(__dirname, 'Stephen_Blanchard-Resume.pdf');
  console.log('📄 Testing OLD resume format:', oldResumePath);
  
  try {
    const oldResult = await parser.parseFile(oldResumePath, 'application/pdf');
    console.log('✅ Old resume parsed successfully');
    console.log('Work Experience entries:', oldResult.workExperience.length);
    console.log('Skills entries:', oldResult.skills.length);
    console.log('Skills by category:');
    const skillsByCategory = {};
    oldResult.skills.forEach(skill => {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill.name);
    });
    Object.keys(skillsByCategory).forEach(category => {
      console.log(`  ${category}: ${skillsByCategory[category].join(', ')}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error parsing old resume:', error.message);
  }
  
  // Test new resume format
  const newResumePath = path.join(__dirname, '..', 'Stephen_Blanchard-Resume (new).pdf');
  console.log('📄 Testing NEW resume format:', newResumePath);
  
  try {
    const newResult = await parser.parseFile(newResumePath, 'application/pdf');
    console.log('✅ New resume parsed successfully');
    console.log('Work Experience entries:', newResult.workExperience.length);
    console.log('Skills entries:', newResult.skills.length);
    console.log('Skills by category:');
    const skillsByCategory = {};
    newResult.skills.forEach(skill => {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill.name);
    });
    Object.keys(skillsByCategory).forEach(category => {
      console.log(`  ${category}: ${skillsByCategory[category].join(', ')}`);
    });
    
    // Show work experience details for new format
    console.log('\nWork Experience details:');
    newResult.workExperience.forEach((exp, index) => {
      console.log(`  ${index + 1}. ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`);
    });
    
  } catch (error) {
    console.error('❌ Error parsing new resume:', error.message);
  }
}

testResumeParser().catch(console.error);
