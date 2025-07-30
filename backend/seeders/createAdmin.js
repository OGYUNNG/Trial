const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@frosstbank.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user with default credentials
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@frosstbank.com',
      password: hashedPassword,
      role: 'admin',
      account: 'ADMIN001',
      balance: 0
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      account: adminUser.account
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

module.exports = createAdminUser; 