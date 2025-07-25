const fs = require('fs');
const pdfParse = require('./portfolio-backend/node_modules/pdf-parse');

async function fullExtract() {
  try {
    const dataBuffer = fs.readFileSync('Stephen_Blanchard-Resume.pdf');
    const data = await pdfParse(dataBuffer);
    
    // Write to file to avoid console truncation
    fs.writeFileSync('resume-text.txt', data.text);
    console.log('Resume text extracted to resume-text.txt');
    console.log('Text length:', data.text.length);
    
    // Also show first part
    console.log('\n=== FIRST 2000 CHARACTERS ===');
    console.log(data.text.substring(0, 2000));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fullExtract();
