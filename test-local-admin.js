// Test script for local backend admin functionality
const fetch = require('node-fetch');

const LOCAL_BACKEND_URL = 'http://localhost:4000';

async function testLocalAdmin() {
  console.log('🔍 Testing local backend admin functionality...\n');
  
  try {
    // Step 1: Check if server is running
    console.log('1. Checking if server is running...');
    try {
      const response = await fetch(`${LOCAL_BACKEND_URL}/api/admin/status`);
      const data = await response.json();
      console.log('✅ Server is running');
      console.log('Status:', data);
    } catch (error) {
      console.log('❌ Server not running or endpoint not found');
      console.log('Error:', error.message);
      return;
    }
    
    // Step 2: Test admin creation
    console.log('\n2. Testing admin creation...');
    try {
      const createResponse = await fetch(`${LOCAL_BACKEND_URL}/api/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const createData = await createResponse.json();
      console.log('Create result:', createData);
    } catch (error) {
      console.log('❌ Admin creation failed:', error.message);
    }
    
    // Step 3: Test login
    console.log('\n3. Testing admin login...');
    try {
      const loginResponse = await fetch(`${LOCAL_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@frosstbank.com',
          password: 'admin123'
        })
      });
      const loginData = await loginResponse.json();
      console.log('Login result:', loginData);
      
      if (loginData.token) {
        console.log('\n✅ SUCCESS: Admin login works!');
        console.log('📧 Email: admin@frosstbank.com');
        console.log('🔑 Password: admin123');
      } else {
        console.log('\n❌ FAILED: Admin login failed');
        console.log('Error:', loginData.error);
      }
    } catch (error) {
      console.log('❌ Login test failed:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

// Run the test
testLocalAdmin(); 