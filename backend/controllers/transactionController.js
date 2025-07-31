const { Transaction, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const transactions = await Transaction.findAll({
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'account']
        }]
      });
      res.json(transactions);
    } else {
      const transactions = await Transaction.findAll({
        where: { userId: req.user.id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'account']
        }]
      });
      res.json(transactions);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.body.userId || req.user.id
    };
    
    const transaction = await Transaction.create(transactionData);
    
    // Update user balance
    await updateUserBalance(transaction.userId);
    
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const oldAmount = transaction.amount;
    await transaction.update(req.body);
    
    // Update user balance if amount changed
    if (oldAmount !== transaction.amount) {
      await updateUserBalance(transaction.userId);
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const userId = transaction.userId;
    await transaction.destroy();
    
    // Update user balance
    await updateUserBalance(userId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update user balance based on transactions
async function updateUserBalance(userId) {
  try {
    const transactions = await Transaction.findAll({
      where: { userId },
      attributes: ['amount']
    });

    const balance = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    
    await User.update(
      { balance: parseFloat(balance).toFixed(2) },
      { where: { id: userId } }
    );
  } catch (error) {
    console.error('Error updating user balance:', error);
  }
} 