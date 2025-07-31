const { User, Transaction } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: Transaction,
        as: 'transactions',
        attributes: ['amount'],
        required: false
      }]
    });

    // Calculate balance for each user based on transactions
    const usersWithBalance = users.map(user => {
      const userData = user.toJSON();
      const balance = userData.transactions ? 
        userData.transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0) : 0;
      
      return {
        ...userData,
        balance: parseFloat(balance).toFixed(2),
        transactions: undefined // Remove transactions from response
      };
    });

    res.json(usersWithBalance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, account, role, balance = 0 } = req.body;
    const hash = await bcrypt.hash(password, 10);
    
    const user = await User.create({ 
      name, 
      email, 
      password: hash, 
      account, 
      role,
      balance: parseFloat(balance || 0)
    });

    // If initial balance is provided, create an initial transaction
    if (balance && parseFloat(balance) > 0) {
      await Transaction.create({
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        description: 'Initial deposit',
        category: 'Deposit',
        amount: parseFloat(balance),
        status: 'completed'
      });
    }

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, email, password, account, role, balance } = req.body;
    const updateData = { name, email, account, role };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (balance !== undefined) {
      updateData.balance = parseFloat(balance);
    }
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update(updateData);
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user balance by calculating from transactions
exports.getBalance = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    const transactions = await Transaction.findAll({
      where: { userId },
      attributes: ['amount']
    });

    const balance = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    
    res.json({ balance: parseFloat(balance).toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 