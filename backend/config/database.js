// Simple JSON file database for persistent storage
const fs = require('fs');
const path = require('path');

class SimpleDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.transactionsFile = path.join(this.dataDir, 'transactions.json');
    this.messagesFile = path.join(this.dataDir, 'messages.json');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Initialize files if they don't exist
    this.initializeFiles();
  }
  
  initializeFiles() {
    if (!fs.existsSync(this.usersFile)) {
      fs.writeFileSync(this.usersFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.transactionsFile)) {
      fs.writeFileSync(this.transactionsFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(this.messagesFile)) {
      fs.writeFileSync(this.messagesFile, JSON.stringify([], null, 2));
    }
  }
  
  readData(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return [];
    }
  }
  
  writeData(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
      return false;
    }
  }
  
  // User methods
  async findAllUsers() {
    return this.readData(this.usersFile);
  }
  
  async findUserByEmail(email) {
    const users = this.readData(this.usersFile);
    return users.find(user => user.email === email);
  }
  
  async findUserById(id) {
    const users = this.readData(this.usersFile);
    return users.find(user => user.id === id);
  }
  
  async createUser(userData) {
    const users = this.readData(this.usersFile);
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    this.writeData(this.usersFile, users);
    return newUser;
  }
  
  async updateUser(id, userData) {
    const users = this.readData(this.usersFile);
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    this.writeData(this.usersFile, users);
    return users[userIndex];
  }
  
  async deleteUser(id) {
    const users = this.readData(this.usersFile);
    const filteredUsers = users.filter(user => user.id !== id);
    this.writeData(this.usersFile, filteredUsers);
    return true;
  }
  
  // Transaction methods
  async findAllTransactions() {
    const transactions = this.readData(this.transactionsFile);
    const users = this.readData(this.usersFile);
    
    return transactions.map(tx => ({
      ...tx,
      user: users.find(user => user.id === tx.userId)
    }));
  }
  
  async createTransaction(transactionData) {
    const transactions = this.readData(this.transactionsFile);
    const newTransaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      ...transactionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    this.writeData(this.transactionsFile, transactions);
    return newTransaction;
  }
  
  async updateTransaction(id, transactionData) {
    const transactions = this.readData(this.transactionsFile);
    const transactionIndex = transactions.findIndex(tx => tx.id === id);
    if (transactionIndex === -1) return null;
    
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      ...transactionData,
      updatedAt: new Date().toISOString()
    };
    this.writeData(this.transactionsFile, transactions);
    return transactions[transactionIndex];
  }
  
  async deleteTransaction(id) {
    const transactions = this.readData(this.transactionsFile);
    const filteredTransactions = transactions.filter(tx => tx.id !== id);
    this.writeData(this.transactionsFile, filteredTransactions);
    return true;
  }
  
  // Message methods
  async createMessage(messageData) {
    const messages = this.readData(this.messagesFile);
    const newMessage = {
      id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
      ...messageData,
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    this.writeData(this.messagesFile, messages);
    return newMessage;
  }
  
  async countUsers() {
    const users = this.readData(this.usersFile);
    return users.length;
  }
  
  async countTransactions() {
    const transactions = this.readData(this.transactionsFile);
    return transactions.length;
  }
  
  async countMessages() {
    const messages = this.readData(this.messagesFile);
    return messages.length;
  }
}

module.exports = new SimpleDatabase(); 