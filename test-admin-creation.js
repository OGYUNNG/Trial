// Test script to verify admin user creation and login
const fetch = require('node-fetch');

const BACKEND_URL = 'https://frosstbank-backend.onrender.com';

async function testAdminCreation() {
  console.log('🔍 Testing admin user creation...\n');
  
  try {
    // Step 1: Check admin status
    console.log('1. Checking admin status...');
    const statusResponse = await fetch(`${BACKEND_URL}/api/admin/status`);
    const statusData = await statusResponse.json();
    console.log('Status:', statusData);
    
    // Step 2: Create admin if it doesn't exist
    if (!statusData.adminExists) {
      console.log('\n2. Creating admin user...');
      const createResponse = await fetch(`${BACKEND_URL}/api/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const createData = await createResponse.json();
      console.log('Create result:', createData);
    } else {
      console.log('\n2. Admin user already exists');
    }
    
    // Step 3: Test login
    console.log('\n3. Testing admin login...');
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
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
      console.log('🎫 Token received:', loginData.token.substring(0, 20) + '...');
    } else {
      console.log('\n❌ FAILED: Admin login failed');
      console.log('Error:', loginData.error);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

// Run the test
testAdminCreation(); 