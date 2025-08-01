const fs = require('fs');
const path = require('path');

// Simple work experience extraction test
function extractWorkExperience(text, lines) {
  const experiences = [];
  const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience', 'work', 'career', 'professional background'];
  
  let inExperienceSection = false;
  let currentExperience = null;
  
  console.log('=== DEBUGGING WORK EXPERIENCE EXTRACTION ===');
  console.log(`Total lines to process: ${lines.length}`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    // Check if we're entering an experience section
    if (!inExperienceSection && experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
      inExperienceSection = true;
      console.log(`[DEBUG] Found experience section at line ${i}: "${line}"`);
      continue;
    }
    
    // Check if we're leaving the experience section
    if (inExperienceSection && (lowerLine.includes('education') || lowerLine.includes('skills') || 
        lowerLine.includes('projects') || lowerLine.includes('certifications') ||
        lowerLine.includes('awards') || lowerLine.includes('publications'))) {
      if (currentExperience && isValidExperience(currentExperience)) {
        experiences.push(currentExperience);
        console.log(`[DEBUG] Added experience before section end: ${currentExperience.position} at ${currentExperience.company}`);
      }
      console.log(`[DEBUG] Leaving experience section at line ${i}: "${line}"`);
      break;
    }
    
    if (inExperienceSection && line.length > 0) {
      console.log(`[DEBUG] Processing line ${i}: "${line}"`);
      
      // Look for job titles (usually contain job-related keywords)
      const jobTitlePattern = /\b(engineer|developer|manager|director|analyst|specialist|coordinator|assistant|lead|senior|junior|consultant|architect|designer|programmer|administrator|supervisor|executive|officer)\b/i;
      
      // Look for company names (usually contain company indicators)
      const companyPattern = /\b(inc|llc|corp|corporation|company|ltd|limited|group|systems|solutions|technologies|consulting|services|bank|financial|insurance|healthcare|medical|hospital|clinic|university|college|school|institute)\b/i;
      
      // Look for date ranges
      const datePattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(present|current)|\d{4}\s*[-–—−]\s*\d{4}|\d{4}\s*[-–—−]\s*(present|current)/i;
      
      // Check if this is a bullet point or description
      const isBulletPoint = line.startsWith('●') || line.startsWith('•') || line.startsWith('*') || line.startsWith('-');
      
      // Check if this is purely a date line
      const isPureDateLine = datePattern.test(line) && line.length < 30;
      
      if (isBulletPoint && currentExperience) {
        // This is a description bullet point
        if (!currentExperience.description) currentExperience.description = [];
        currentExperience.description.push(line.replace(/^[●•*-]\s*/, '').trim());
        console.log(`[DEBUG] Added description: "${line.substring(0, 50)}..."`);
        
      } else if (isPureDateLine && currentExperience && !currentExperience.startDate) {
        // This is a date range line
        extractDates(line, currentExperience);
        console.log(`[DEBUG] Found dates: ${currentExperience.startDate} - ${currentExperience.endDate || 'Present'}`);
        
      } else if (companyPattern.test(line) && currentExperience && !currentExperience.company) {
        // This looks like a company name
        currentExperience.company = line;
        console.log(`[DEBUG] Found company: "${currentExperience.company}"`);
        
      } else if (jobTitlePattern.test(line) || (line.length > 5 && line.length < 80 && !line.includes('@') && !isBulletPoint && !isPureDateLine && !companyPattern.test(line))) {
        // This looks like a job title - start new experience
        if (currentExperience && isValidExperience(currentExperience)) {
          experiences.push(currentExperience);
          console.log(`[DEBUG] Added experience: ${currentExperience.position} at ${currentExperience.company}`);
        }
        
        currentExperience = {
          id: `exp_${experiences.length + 1}`,
          company: '',
          position: cleanPositionFromDates(line),
          description: [],
          current: false,
          startDate: '',
          endDate: ''
        };
        
        // Extract dates if present in the same line
        extractDates(line, currentExperience);
        console.log(`[DEBUG] Found job title: "${currentExperience.position}"`);
      }
    }
  }
  
  // Add the last experience if valid
  if (currentExperience && isValidExperience(currentExperience)) {
    experiences.push(currentExperience);
    console.log(`[DEBUG] Added final experience: ${currentExperience.position} at ${currentExperience.company}`);
  }
  
  console.log(`[DEBUG] Extracted ${experiences.length} work experiences`);
  return experiences;
}

function isValidExperience(exp) {
  const hasPosition = exp.position && exp.position.length > 2;
  const hasCompany = exp.company && exp.company.length > 2;
  const hasDate = exp.startDate && exp.startDate.length > 0;
  
  console.log(`[DEBUG] Validating experience: position="${exp.position}" company="${exp.company}" startDate="${exp.startDate}"`);
  console.log(`[DEBUG] Validation: hasPosition=${hasPosition}, hasCompany=${hasCompany}, hasDate=${hasDate}`);
  
  return hasPosition || hasCompany || hasDate;
}

function cleanPositionFromDates(line) {
  // Remove date patterns from position
  return line.replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(present|current)|\d{4}\s*[-–—−]\s*\d{4}|\d{4}\s*[-–—−]\s*(present|current)/gi, '').trim();
}

function extractDates(line, experience) {
  const datePattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(present|current)|\d{4}\s*[-–—−]\s*\d{4}|\d{4}\s*[-–—−]\s*(present|current)/gi;
  
  const matches = line.match(datePattern);
  if (matches && matches.length > 0) {
    const dateRange = matches[0];
    const parts = dateRange.split(/[-–—−]/);
    if (parts.length >= 2) {
      experience.startDate = parts[0].trim();
      const endPart = parts[1].trim().toLowerCase();
      if (endPart === 'present' || endPart === 'current') {
        experience.current = true;
        experience.endDate = '';
      } else {
        experience.endDate = parts[1].trim();
      }
    }
  }
}

// Test with sample resume text
function testWithSampleText() {
  const sampleText = `
PROFESSIONAL EXPERIENCE

Senior Software Engineer
Acme Technologies Inc
March 2020 - Present
• Developed and maintained web applications using React and Node.js
• Led a team of 5 developers on multiple projects
• Implemented CI/CD pipelines and improved deployment processes

Software Developer
Tech Solutions LLC
June 2018 - February 2020
• Built REST APIs using Python and Django
• Collaborated with cross-functional teams
• Optimized database queries and improved performance

EDUCATION
Bachelor of Science in Computer Science
University of Technology
2014 - 2018
`;

  const lines = sampleText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('=== TESTING WITH SAMPLE TEXT ===');
  console.log('Lines:', lines);
  console.log('\n');
  
  const experiences = extractWorkExperience(sampleText, lines);
  
  console.log('\n=== RESULTS ===');
  console.log(`Found ${experiences.length} experiences:`);
  experiences.forEach((exp, index) => {
    console.log(`\nExperience ${index + 1}:`);
    console.log(`  Position: ${exp.position}`);
    console.log(`  Company: ${exp.company}`);
    console.log(`  Start Date: ${exp.startDate}`);
    console.log(`  End Date: ${exp.endDate || (exp.current ? 'Present' : 'Not specified')}`);
    console.log(`  Current: ${exp.current}`);
    console.log(`  Description: ${exp.description ? exp.description.length + ' items' : 'None'}`);
  });
}

// Run the test
testWithSampleText();
