const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const FormData = require('form-data');
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    console.log("Starting upload test...");
    
    // Create form data using the generated worker avatar
    const form = new FormData();
    const imagePath = 'C:\\Users\\AlaaSaleh\\.gemini\\antigravity\\brain\\b9f6e150-8340-40a1-97ed-c928560ae249\\worker_avatar_1775273901587.png';
    const fileStream = fs.createReadStream(imagePath);
    form.append('image', fileStream);

    // Mock an authorization token if hitting the protected endpoint
    // Actually, we need a valid token. Let's just create a dummy one or grab one from the DB using jwt.
    const jwt = require('jsonwebtoken');
    require('dotenv').config({ path: './backend/.env' });
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'my_super_secret_key_12345', { expiresIn: '30d' });

    console.log("Uploading file via API...");
    // Let's assume the server is running on localhost:5000
    // Using native http instead of fetch to avoid module issues
    const http = require('http');

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status code: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        
        // Assertions
        if (res.statusCode === 201 && JSON.parse(data).url) {
           console.log("✅ Upload test PASSED! File stored locally at: " + JSON.parse(data).url);
        } else {
           console.log("❌ Upload test FAILED!");
        }
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
    });

    form.pipe(req);

  } catch (err) {
    console.error("Test execution failed: ", err);
  }
}

run();
