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
    
    await transaction.update(req.body);
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
    
    await transaction.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 