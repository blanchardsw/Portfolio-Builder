const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

async function testResumeUpload() {
  try {
    const resumePath = path.join(__dirname, 'portfolio-backend', 'Stephen_Blanchard-Resume.pdf');
    
    if (!fs.existsSync(resumePath)) {
      console.error('Resume file not found at:', resumePath);
      return;
    }

    console.log('📄 Found resume file, uploading to trigger parsing...');
    
    const form = new FormData();
    form.append('resume', fs.createReadStream(resumePath));

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/upload/resume',
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n=== UPLOAD RESPONSE ===');
        console.log(`Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          console.log('Upload successful!');
          console.log(`Work Experience Count: ${response.parsedData?.workExperienceCount || 0}`);
          console.log(`Skills Count: ${response.parsedData?.skillsCount || 0}`);
          console.log(`Education Count: ${response.parsedData?.educationCount || 0}`);
        } catch (error) {
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Upload error:', error);
    });

    form.pipe(req);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

console.log('Testing resume upload to trigger work experience extraction...');
testResumeUpload();
