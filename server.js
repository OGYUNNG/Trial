// server.js

// 1. Import express
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const cors = require('cors');
// 2. set up cors
app.use(cors());


// Middleware to serve static files

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Optional: Redirect root to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});
// 4. Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
