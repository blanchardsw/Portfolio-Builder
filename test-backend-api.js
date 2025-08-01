const http = require('http');

function testBackendAPI() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/portfolio?ownerAccess=true',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const portfolio = JSON.parse(data);
        console.log('=== BACKEND API RESPONSE ===');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response length: ${data.length} characters`);
        
        if (portfolio.workExperience) {
          console.log(`\nWork Experience entries: ${portfolio.workExperience.length}`);
          portfolio.workExperience.forEach((exp, index) => {
            console.log(`\nExperience ${index + 1}:`);
            console.log(`  Position: ${exp.position || 'N/A'}`);
            console.log(`  Company: ${exp.company || 'N/A'}`);
            console.log(`  Start Date: ${exp.startDate || 'N/A'}`);
            console.log(`  End Date: ${exp.endDate || (exp.current ? 'Present' : 'N/A')}`);
            console.log(`  Current: ${exp.current || false}`);
            console.log(`  Description: ${exp.description ? exp.description.length + ' items' : 'None'}`);
            if (exp.description && exp.description.length > 0) {
              exp.description.forEach((desc, i) => {
                console.log(`    - ${desc.substring(0, 80)}${desc.length > 80 ? '...' : ''}`);
              });
            }
          });
        } else {
          console.log('\n❌ No workExperience field found in response');
        }

        if (portfolio.skills) {
          console.log(`\nSkills entries: ${portfolio.skills.length}`);
        }

        if (portfolio.personalInfo) {
          console.log(`\nPersonal Info: ${portfolio.personalInfo.name || 'N/A'}`);
        }

        // Write full response to file for debugging
        const fs = require('fs');
        fs.writeFileSync('api-response.json', data, 'utf8');
        console.log('\n=== Full response written to api-response.json ===');
        
        // Show first 500 characters of raw response for debugging
        console.log('\n=== RAW RESPONSE (first 500 chars) ===');
        console.log(data.substring(0, 500));
        
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });

  req.end();
}

console.log('Testing backend API for work experience data...');
testBackendAPI();
