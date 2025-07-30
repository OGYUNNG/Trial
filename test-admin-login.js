const fetch = require('node-fetch');

async function testAdminLogin() {
    console.log('Testing admin login...');
    
    try {
        // Test health endpoint first
        console.log('1. Testing server health...');
        const healthResponse = await fetch('http://localhost:4000/health');
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Server is healthy:', healthData.status);
        } else {
            console.log('❌ Server health check failed');
            return;
        }
        
        // Test admin login
        console.log('2. Testing admin login...');
        const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@frosstbank.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginData.token) {
            console.log('✅ Admin login successful!');
            console.log('   Role:', loginData.user.role);
            console.log('   Name:', loginData.user.name);
            console.log('   Account:', loginData.user.account);
            console.log('   Token:', loginData.token.substring(0, 20) + '...');
        } else {
            console.log('❌ Admin login failed:', loginData.error);
        }
        
    } catch (error) {
        console.log('❌ Error testing admin login:', error.message);
        console.log('Make sure the backend server is running on port 4000');
    }
}

testAdminLogin(); 