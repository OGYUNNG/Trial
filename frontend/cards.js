// Check if user is authenticated
function checkAuth() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }
  return token;
}

// Get user info from JWT token
function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    window.location.href = 'login.html';
    return null;
  }
  return JSON.parse(userInfo);
}

// API helper function
async function apiCall(endpoint, options = {}) {
  const token = checkAuth();
  if (!token) return null;

  const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://trial-1-sq1y.onrender.com';
  const response = await fetch(`${backendUrl}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  if (response.status === 401) {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userInfo');
    window.location.href = 'login.html';
    return null;
  }

  return response.json();
}

// Load user data and card information
async function loadUserData() {
  try {
    const user = getUserInfo();
    if (!user) return;

    // Update profile picture
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && user.profilePicture) {
      userAvatar.src = user.profilePicture;
      userAvatar.alt = `${user.name}'s Profile`;
    }

    // Update card information
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardHolder = document.getElementById('cardHolder');
    const cardBalance = document.getElementById('cardBalance');
    
    if (cardNumber) {
      cardNumber.textContent = `•••• •••• •••• ${user.account.slice(-4)}`;
    }
    
    if (cardExpiry) {
      // Generate expiry date (2 years from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      cardExpiry.textContent = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(-2)}`;
    }
    
    if (cardHolder) {
      cardHolder.textContent = user.name.toUpperCase();
    }
    
    if (cardBalance) {
      cardBalance.textContent = `$${(user.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    // Load card transactions
    await loadCardTransactions();
    
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Load card transactions
async function loadCardTransactions() {
  try {
    const transactions = await apiCall('/transactions') || [];
    const user = getUserInfo();
    
    // Filter transactions for current user (limit to 5 recent ones)
    const userTransactions = transactions
      .filter(tx => tx.user && tx.user.id === user.id)
      .slice(0, 5);

    renderCardTransactions(userTransactions);
    
  } catch (error) {
    console.error('Error loading card transactions:', error);
  }
}

// Render card transactions
function renderCardTransactions(transactions) {
  const tbody = document.querySelector('.transaction-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #666;">No recent transactions</td></tr>';
    return;
  }

  transactions.forEach(transaction => {
    const row = document.createElement('tr');
    const date = new Date(transaction.date);
    const isNegative = transaction.amount < 0;
    const amountClass = isNegative ? 'negative' : 'positive';
    const amountPrefix = isNegative ? '-' : '+';
    
    row.innerHTML = `
      <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
      <td>
        <div class="transaction-merchant">
          <div class="merchant-icon">💳</div>
          <div>${transaction.description}</div>
        </div>
      </td>
      <td class="transaction-amount ${amountClass}">${amountPrefix}$${Math.abs(transaction.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      <td><span class="status-badge status-${transaction.status}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span></td>
    `;
    
    tbody.appendChild(row);
  });
}

// --- Card Actions ---
const freezeBtn = document.querySelector('.btn-primary');
const virtualCardBtn = document.querySelector('.btn-outline');

freezeBtn.addEventListener('click', () => {
  alert('Your card has been frozen.');
  freezeBtn.textContent = 'Card Frozen';
  freezeBtn.disabled = true;
});

virtualCardBtn.addEventListener('click', () => {
  alert('A virtual card has been generated and sent to your email.');
});

// --- Transaction Filter ---
const filterButtons = document.querySelectorAll('.filter-btn');
const transactions = document.querySelectorAll('.transaction-table tbody tr');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.textContent;

    transactions.forEach(row => {
      const amount = row.querySelector('.transaction-amount').textContent;
      if (filter === 'All') {
        row.style.display = '';
      } else if (filter === 'Income' && amount.includes('+')) {
        row.style.display = '';
      } else if (filter === 'Expenses' && amount.includes('-')) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
});

// --- Progress Bar (Spent this month) ---
const spent = 1200; // example value
const limit = 10000; // example value
const percent = (spent / limit) * 100;
const progressBar = document.querySelector('.progress');

if (progressBar) {
  progressBar.style.width = `${percent}%`;
}

// --- Toggle Switches Feedback (Optional) ---
const toggles = document.querySelectorAll('.toggle-switch input');
toggles.forEach(toggle => {
  toggle.addEventListener('change', () => {
    const label = toggle.closest('.control-item')?.querySelector('.control-label')?.textContent;
    if (toggle.checked) {
      console.log(`${label} enabled`);
    } else {
      console.log(`${label} disabled`);
    }
  });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadUserData();
});
