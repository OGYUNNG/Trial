const User = require('./User');
const Transaction = require('./Transaction');
const Message = require('./Message');

// Define associations
User.hasMany(Transaction, { 
  foreignKey: 'userId', 
  as: 'transactions',
  onDelete: 'CASCADE' 
});
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Message associations - User can send and receive messages
User.hasMany(Message, { 
  foreignKey: 'fromId', 
  as: 'sentMessages',
  onDelete: 'CASCADE' 
});
User.hasMany(Message, { 
  foreignKey: 'toId', 
  as: 'receivedMessages',
  onDelete: 'CASCADE' 
});
Message.belongsTo(User, { foreignKey: 'fromId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'toId', as: 'receiver' });

module.exports = {
  User,
  Transaction,
  Message
}; 