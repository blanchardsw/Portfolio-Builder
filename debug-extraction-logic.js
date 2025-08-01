// Test the exact extraction logic with the actual resume line
const testLine = "First American Title — Senior Software Engineer | August 2021 – Present";

console.log('=== TESTING EXTRACTION LOGIC ===');
console.log(`Test line: "${testLine}"`);

// Test job title pattern
const jobTitlePattern = /\b(engineer|developer|manager|director|analyst|specialist|coordinator|assistant|lead|senior|junior|consultant|architect|designer|programmer|administrator|supervisor|executive|officer)\b/i;
const jobTitleMatch = jobTitlePattern.test(testLine);
console.log(`Job title pattern match: ${jobTitleMatch}`);

// Test company pattern  
const companyPattern = /\b(inc|llc|corp|corporation|company|ltd|limited|group|systems|solutions|technologies|consulting|services|bank|financial|insurance|healthcare|medical|hospital|clinic|university|college|school|institute)\b/i;
const companyMatch = companyPattern.test(testLine);
console.log(`Company pattern match: ${companyMatch}`);

// Test date pattern
const datePattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\s*[-–—−]\s*(present|current)|\d{4}\s*[-–—−]\s*\d{4}|\d{4}\s*[-–—−]\s*(present|current)/i;
const dateMatch = datePattern.test(testLine);
console.log(`Date pattern match: ${dateMatch}`);

// Test bullet point detection
const isBulletPoint = testLine.startsWith('●') || testLine.startsWith('•') || testLine.startsWith('*') || testLine.startsWith('-');
console.log(`Is bullet point: ${isBulletPoint}`);

// Test pure date line
const isPureDateLine = datePattern.test(testLine) && testLine.length < 30;
console.log(`Is pure date line: ${isPureDateLine}`);

// Test the main condition for job title detection
const isJobTitle = jobTitlePattern.test(testLine) || (testLine.length > 5 && testLine.length < 80 && !testLine.includes('@') && !isBulletPoint && !isPureDateLine && !companyPattern.test(testLine));
console.log(`Would be detected as job title: ${isJobTitle}`);

console.log('\n=== DETAILED ANALYSIS ===');
console.log(`Line length: ${testLine.length}`);
console.log(`Contains @: ${testLine.includes('@')}`);
console.log(`Length > 5: ${testLine.length > 5}`);
console.log(`Length < 80: ${testLine.length < 80}`);
console.log(`NOT bullet point: ${!isBulletPoint}`);
console.log(`NOT pure date line: ${!isPureDateLine}`);
console.log(`NOT company pattern: ${!companyPattern.test(testLine)}`);

// Test the logic step by step
console.log('\n=== STEP BY STEP LOGIC ===');
if (isBulletPoint) {
  console.log('Would be processed as: BULLET POINT');
} else if (isPureDateLine) {
  console.log('Would be processed as: PURE DATE LINE');
} else if (companyPattern.test(testLine)) {
  console.log('Would be processed as: COMPANY NAME');
} else if (jobTitlePattern.test(testLine) || (testLine.length > 5 && testLine.length < 80 && !testLine.includes('@') && !isBulletPoint && !isPureDateLine && !companyPattern.test(testLine))) {
  console.log('Would be processed as: JOB TITLE');
} else {
  console.log('Would be processed as: IGNORED');
}
