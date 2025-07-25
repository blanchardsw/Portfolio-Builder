const fs = require('fs');
const pdfParse = require('./portfolio-backend/node_modules/pdf-parse');

async function extractText() {
  try {
    const dataBuffer = fs.readFileSync('Stephen_Blanchard-Resume.pdf');
    const data = await pdfParse(dataBuffer);
    
    console.log('=== RAW PDF TEXT ===');
    console.log(data.text);
    console.log('\n=== TEXT LINES ===');
    const lines = data.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    lines.forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
  } catch (error) {
    console.error('Error extracting text:', error);
  }
}

extractText();
