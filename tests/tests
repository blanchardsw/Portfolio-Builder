// Test the new extraction logic with actual resume lines
const testLines = [
  "EXPERIENCE",
  "First American Title — Senior Software Engineer | August 2021 – Present",
  "● Spearheaded modernization of escrow systems by replacing legacy ASP/.NET with minimal APIs and AWS-backed services.",
  "● Designed and implemented secure CI/CD pipelines using GitHub Actions, SonarQube, and Veracode.",
  "Kaseya — Software Engineer | March 2017  – August 2021",
  "● Led design and rollout of SSO/OIDC system for global users, integrating with Auth0 and custom MFA flows.",
  "● Developed secure onboarding flows for VSA, IT Glue, and BMS platforms."
];

console.log('=== TESTING NEW EXTRACTION LOGIC ===');

function isJobExperienceLine(line) {
  // Check if line contains both job-related keywords and separators (—, |, -)
  const jobTitlePattern = /\b(engineer|developer|manager|director|analyst|specialist|coordinator|assistant|lead|senior|junior|consultant|architect|designer|programmer|administrator|supervisor|executive|officer)\b/i;
  const hasSeparator = line.includes('—') || line.includes('|') || line.includes(' - ');
  const hasJobKeyword = jobTitlePattern.test(line);
  const hasDatePattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\d{4}\s*[-–—−]\s*(present|current)/i.test(line);
  
  return hasJobKeyword && hasSeparator && hasDatePattern;
}

function parseJobExperienceLine(line, id) {
  try {
    // Parse lines like "First American Title — Senior Software Engineer | August 2021 – Present"
    let company = '';
    let position = '';
    let dateRange = '';
    
    // Split by common separators
    if (line.includes('—')) {
      const parts = line.split('—');
      if (parts.length >= 2) {
        company = parts[0].trim();
        const rightPart = parts[1].trim();
        
        // Check if right part has | separator for dates
        if (rightPart.includes('|')) {
          const subParts = rightPart.split('|');
          position = subParts[0].trim();
          dateRange = subParts[1].trim();
        } else {
          position = rightPart;
        }
      }
    } else if (line.includes('|')) {
      const parts = line.split('|');
      if (parts.length >= 2) {
        const leftPart = parts[0].trim();
        dateRange = parts[1].trim();
        
        // Try to split left part into company and position
        const jobTitlePattern = /\b(engineer|developer|manager|director|analyst|specialist|coordinator|assistant|lead|senior|junior|consultant|architect|designer|programmer|administrator|supervisor|executive|officer)\b/i;
        const words = leftPart.split(' ');
        
        // Find where job title starts
        let titleStartIndex = -1;
        for (let i = 0; i < words.length; i++) {
          if (jobTitlePattern.test(words[i])) {
            titleStartIndex = i;
            break;
          }
        }
        
        if (titleStartIndex > 0) {
          company = words.slice(0, titleStartIndex).join(' ');
          position = words.slice(titleStartIndex).join(' ');
        } else {
          position = leftPart;
        }
      }
    }
    
    const experience = {
      id: `exp_${id}`,
      company: company || '',
      position: position || '',
      description: [],
      current: false,
      startDate: '',
      endDate: ''
    };
    
    // Simple date extraction
    if (dateRange) {
      if (dateRange.toLowerCase().includes('present') || dateRange.toLowerCase().includes('current')) {
        experience.current = true;
      }
      const dateMatch = dateRange.match(/(\w+\s+\d{4})/);
      if (dateMatch) {
        experience.startDate = dateMatch[1];
      }
    }
    
    return experience;
  } catch (error) {
    console.error('Error parsing job experience line:', error);
    return null;
  }
}

// Test each line
testLines.forEach((line, index) => {
  console.log(`\nLine ${index}: "${line}"`);
  
  if (line === "EXPERIENCE") {
    console.log('  -> EXPERIENCE SECTION HEADER');
  } else if (line.startsWith('●')) {
    console.log('  -> BULLET POINT DESCRIPTION');
  } else if (isJobExperienceLine(line)) {
    console.log('  -> JOB EXPERIENCE LINE');
    const parsed = parseJobExperienceLine(line, index);
    if (parsed) {
      console.log(`     Company: "${parsed.company}"`);
      console.log(`     Position: "${parsed.position}"`);
      console.log(`     Start Date: "${parsed.startDate}"`);
      console.log(`     Current: ${parsed.current}`);
    }
  } else {
    console.log('  -> OTHER');
  }
});

console.log('\n=== SUMMARY ===');
const jobLines = testLines.filter(line => isJobExperienceLine(line));
console.log(`Found ${jobLines.length} job experience lines:`);
jobLines.forEach((line, index) => {
  const parsed = parseJobExperienceLine(line, index + 1);
  if (parsed) {
    console.log(`${index + 1}. ${parsed.position} at ${parsed.company} (${parsed.startDate}${parsed.current ? ' - Present' : ''})`);
  }
});
