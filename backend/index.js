// Entry point for Render deployment
// This file simply starts the main server
const path = require('path');

// Ensure we're in the right directory
console.log('Starting FrosstBank Backend...');
console.log('Current directory:', __dirname);
console.log('Server file path:', path.join(__dirname, 'server.js'));

// Start the server
require('./server.js'); 