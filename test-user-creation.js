const fetch = require('node-fetch');

async function testUserCreation() {
    console.log('Testing user creation functionality...');
    
    try {
        // First, login as admin to get a token
        console.log('1. Logging in as admin...');
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
        
        if (!loginData.token) {
            console.log('❌ Admin login failed:', loginData.error);
            return;
        }
        
        console.log('✅ Admin login successful');
        
        // Test creating a new user
        console.log('2. Creating a test user...');
        const testUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'testpass123',
            account: 'TEST001',
            role: 'user',
            profilePicture: 'https://via.placeholder.com/40/059669/FFFFFF?text=TU'
        };
        
        const createResponse = await fetch('http://localhost:4000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify(testUser)
        });
        
        const createData = await createResponse.json();
        
        if (createData._id) {
            console.log('✅ User created successfully!');
            console.log('   User ID:', createData._id);
            console.log('   Name:', createData.name);
            console.log('   Email:', createData.email);
            console.log('   Account:', createData.account);
        } else {
            console.log('❌ User creation failed:', createData.error);
        }
        
        // Test fetching all users
        console.log('3. Fetching all users...');
        const usersResponse = await fetch('http://localhost:4000/api/users', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        
        const usersData = await usersResponse.json();
        console.log(`✅ Found ${usersData.length} users in the system`);
        
        usersData.forEach(user => {
            console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
        });
        
    } catch (error) {
        console.log('❌ Error testing user creation:', error.message);
    }
}

testUserCreation(); 