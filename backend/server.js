require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const app = express();

// 1.setup cors
app.use(cors(
  {origin: 'https://trial-2-5mv8.onrender.com'
  , methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  }
));

// Import database
const db = require('./config/database');

// Import models (using the simple database)
const User = {
  findOne: async ({ where }) => {
    return await db.findUserByEmail(where.email);
  },
  create: async (userData) => {
    return await db.createUser(userData);
  },
  findAll: async () => {
    return await db.findAllUsers();
  },
  findByPk: async (id) => {
    return await db.findUserById(id);
  },
  count: async () => {
    return await db.countUsers();
  }
};

const Transaction = {
  findAll: async () => {
    return await db.findAllTransactions();
  },
  create: async (transactionData) => {
    return await db.createTransaction(transactionData);
  },
  findByPk: async (id) => {
    const transactions = await db.findAllTransactions();
    return transactions.find(tx => tx.id === id);
  },
  count: async () => {
    return await db.countTransactions();
  }
};

const Message = {
  create: async (messageData) => {
    return await db.createMessage(messageData);
  },
  count: async () => {
    return await db.countMessages();
  }
};

const sequelize = {
  authenticate: async () => {
    return Promise.resolve();
  }
};

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'https://trial-2-5mv8.onrender.com'
  , methods: ['GET', 'POST', 'PUT', 'DELETE'] } });

// CORS configuration for production

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database initialization
async function initializeDatabase() {
  try {
    console.log('Database connection established successfully.');
    console.log('Database files initialized.');

    // Create default admin user
    await createDefaultAdmin();
    console.log('Database initialization complete.');

  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  }
}

// Create default admin user
async function createDefaultAdmin() {
  try {
    console.log('Checking for existing admin user...');
    
    // Check if admin already exists
    const existingAdmin = await db.findUserByEmail('admin@frosstbank.com');

    if (!existingAdmin) {
      console.log('No admin user found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = await db.createUser({
        name: 'Admin User',
        email: 'admin@frosstbank.com',
        password: hashedPassword,
        role: 'admin',
        account: 'ADMIN001',
        balance: 0,
        profilePicture: 'https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff&size=40'
      });
      console.log('✅ Default admin user created successfully');
      console.log('📧 Email: admin@frosstbank.com');
      console.log('🔑 Password: admin123');
      console.log('🆔 Admin ID:', adminUser.id);
    } else {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@frosstbank.com');
      console.log('🆔 Admin ID:', existingAdmin.id);
    }
    
    // Verify admin user can be found
    const verifyAdmin = await db.findUserByEmail('admin@frosstbank.com');
    if (verifyAdmin) {
      console.log('✅ Admin user verification successful');
    } else {
      console.log('❌ Admin user verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    // Try to create admin user with basic data as fallback
    try {
      console.log('🔄 Attempting fallback admin creation...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.createUser({
        name: 'Admin User',
        email: 'admin@frosstbank.com',
        password: hashedPassword,
        role: 'admin',
        account: 'ADMIN001',
        balance: 0
      });
      console.log('✅ Fallback admin user created successfully');
    } catch (fallbackError) {
      console.error('❌ Fallback admin creation also failed:', fallbackError);
    }
  }
}

// Initialize database
initializeDatabase();

// Manual admin creation endpoint (for debugging)
app.post('/api/admin/create', async (req, res) => {
  try {
    console.log('Manual admin creation requested');
    await createDefaultAdmin();
    const admin = await db.findUserByEmail('admin@frosstbank.com');
    if (admin) {
      res.json({ 
        success: true, 
        message: 'Admin user created/verified successfully',
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to create admin user' });
    }
  } catch (error) {
    console.error('Manual admin creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check admin status endpoint
app.get('/api/admin/status', async (req, res) => {
  try {
    const admin = await db.findUserByEmail('admin@frosstbank.com');
    if (admin) {
      res.json({ 
        success: true, 
        adminExists: true,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      });
    } else {
      res.json({ 
        success: true, 
        adminExists: false,
        message: 'Admin user does not exist'
      });
    }
  } catch (error) {
    console.error('Admin status check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production', 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        _id: user.id,
        name: user.name, 
        role: user.role, 
        account: user.account,
        balance: user.balance || 0
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, account } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hash,
      role: 'user',
      account,
      balance: 0,
              profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${getRandomColor()}&color=fff&size=40`
    });
    
    res.json({ 
      success: true, 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'account', 'balance', 'profilePicture']
    });
    
    const userList = users.map(user => ({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      account: user.account,
      balance: user.balance,
      profilePicture: user.profilePicture
    }));
    
    res.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, account, role = 'user', profilePicture } = req.body;
    
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hash,
      role,
      account,
      balance: 0,
              profilePicture: profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${getRandomColor()}&color=fff&size=40`
    });
    
    res.json({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      account: newUser.account,
      balance: newUser.balance,
      profilePicture: newUser.profilePicture
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user endpoint
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, account, profilePicture } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.account = account || user.account;
    user.profilePicture = profilePicture || user.profilePicture;
    
    await user.save();
    
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      account: user.account,
      balance: user.balance,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete user endpoint
app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Transaction routes
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'account']
      }]
    });
    
    const transactionList = transactions.map(tx => ({
      _id: tx.id,
      user: tx.user,
      date: tx.date,
      time: tx.time,
      description: tx.description,
      category: tx.category,
      amount: tx.amount,
      status: tx.status
    }));
    
    res.json(transactionList);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { user, date, time, description, category, amount, status = 'completed' } = req.body;
    
    const newTransaction = await Transaction.create({
      userId: user,
      date,
      time,
      description,
      category,
      amount,
      status
    });
    
    res.json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update transaction endpoint
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const { user, date, time, description, category, amount, status } = req.body;
    
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Update transaction fields
    if (user !== undefined) transaction.userId = user;
    if (date !== undefined) transaction.date = date;
    if (time !== undefined) transaction.time = time;
    if (description !== undefined) transaction.description = description;
    if (category !== undefined) transaction.category = category;
    if (amount !== undefined) transaction.amount = amount;
    if (status !== undefined) transaction.status = status;
    
    await transaction.save();
    
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete transaction endpoint
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await transaction.destroy();
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(400).json({ error: error.message });
  }
});

// Helper function
function getRandomColor() {
  const colors = ['4F46E5', '059669', 'DC2626', '7C3AED', 'EA580C', 'BE185D', '0891B2', '16A34A'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Socket.io for live chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (data) => {
    socket.join(data.userId);
    console.log(`User ${data.userId} joined their room`);
  });
  
  socket.on('message', async (message) => {
    try {
      // Store message in database
      await Message.create({
        fromId: message.from,
        toId: message.to,
        content: message.content,
        timestamp: message.timestamp
      });
      
      // Broadcast to recipient
      socket.to(message.to).emit('message', message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    const userCount = await User.count();
    const transactionCount = await Transaction.count();
    const messageCount = await Message.count();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'sqlite-persistent',
      environment: process.env.NODE_ENV || 'development',
      users: userCount,
      transactions: transactionCount,
      messages: messageCount
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`Database: ${path.join(__dirname, 'data/database.sqlite')}`);
  console.log('Default admin credentials:');
  console.log('Email: admin@frosstbank.com');
  console.log('Password: admin123');
}); 
