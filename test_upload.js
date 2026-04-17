const fs = require('fs');
const path = require('path');

async function testUpload() {
  const FormData = require('form-data');
  const form = new FormData();
  
  // create dummy image file
  const testImagePath = path.join(__dirname, 'test.png');
  fs.writeFileSync(testImagePath, 'fake image content');
  
  // Register or Login to get token
  let token = 'mock';
  
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Uploader',
        email: `test_uploader_${Date.now()}@example.com`,
        password: 'password123',
        role: 'worker'
      })
    });
    const authData = await res.json();
    token = authData.token;
    
    // Now test upload
    form.append('image', fs.createReadStream(testImagePath));
    
    const uploadRes = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form // node-fetch handles form-data correctly
    });
    
    const uploadData = await uploadRes.json();
    console.log("Upload Status:", uploadRes.status);
    console.log("Upload Response:", uploadData);
    
  } catch(e) {
    console.error(e);
  }
}

testUpload();
