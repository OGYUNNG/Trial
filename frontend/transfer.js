// Socket.io connection
let socket;
let currentUser;

// Initialize Socket.io connection
function initializeSocket() {
  // Get user info from localStorage (set during login)
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    console.log('No user info found, using fallback chat');
    return;
  }

  currentUser = JSON.parse(userInfo);
  
  // Connect to Socket.io server
  const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://trial-1-sq1y.onrender.com';
socket = io(backendUrl, {
    auth: {
      token: localStorage.getItem('jwtToken')
    }
  });

  // Join user's personal room
  socket.emit('join', { userId: currentUser.id });

  // Listen for incoming messages
  socket.on('message', (message) => {
    if (message.from !== currentUser.id) {
      addChatMessage(message.content, 'admin');
    }
  });

  // Listen for connection status
  socket.on('connect', () => {
    console.log('Connected to chat server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from chat server');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    console.log('Falling back to localStorage chat');
  });
}

// Initialize Socket.io on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeSocket();
  loadUserAccounts();
  loadAllUsers();
  setupTransferForm();
});

// Bank selection functionality
document.addEventListener('DOMContentLoaded', function() {
    const bankSelection = document.getElementById('bank-selection');
    const quickAmountButtons = document.querySelectorAll('.quick-amount');
    const amountInput = document.getElementById('amount');
    const summaryAmount = document.getElementById('summaryAmount');
    const summaryBank = document.getElementById('summaryBank');
    const summaryAccount = document.getElementById('summaryAccount');

    // Update summary when bank is selected
    bankSelection.addEventListener('change', updateSummary);

    // Update summary when amount is changed
    amountInput.addEventListener('input', updateSummary);

    // Quick amount buttons
    quickAmountButtons.forEach(button => {
        button.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            amountInput.value = amount;
            updateSummary();
        });
    });

    function updateSummary() {
        const selectedBank = bankSelection.value;
        const amount = amountInput.value;
        const accountNumber = document.getElementById('accountNumber').value;

        if (summaryAmount) summaryAmount.textContent = amount ? `$${parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2})}` : '$0.00';
        if (summaryBank) summaryBank.textContent = selectedBank || 'Not selected';
        if (summaryAccount) summaryAccount.textContent = accountNumber || 'Not entered';
    }

    // Tab switching functionality
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    function switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });

        // Remove active class from all tabs
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Show target tab content
        const targetContent = document.querySelector(`[data-tab-content="${tabName}"]`);
        if (targetContent) {
            targetContent.style.display = 'block';
        }

        // Add active class to clicked tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    // Form submission
    const transferForm = document.getElementById('transferForm');
    transferForm.addEventListener('submit', function(e) {
      e.preventDefault();
        
        // Validate form
        const amount = parseFloat(amountInput.value);
        const selectedBank = bankSelection.value;
        const accountNumber = document.getElementById('accountNumber').value;
        const description = document.getElementById('description').value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        if (!selectedBank) {
            alert('Please select a bank.');
            return;
        }

        if (!accountNumber) {
            alert('Please enter the account number.');
            return;
        }

        if (!description) {
            alert('Please enter a description.');
            return;
        }

        // Show review step
        showReviewStep();
    });
  });

function showReviewStep() {
    switchTab('review');
}

function goBackToForm() {
    switchTab('form');
}

function confirmTransfer() {
    // Generate transfer ID
    const transferId = 'TXN' + Date.now();
    document.getElementById('transferId').textContent = transferId;

    // Switch to pending step
    switchTab('pending');

    // Initialize live chat
    initializeLiveChat();

    // Notify admin of transfer chat
    notifyAdminOfTransferChat();
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function viewTransferHistory() {
    window.location.href = 'activity.html';
}

function initializeLiveChat() {
    const chatSection = document.querySelector('.live-chat-section');
    if (chatSection) {
        chatSection.style.display = 'block';
    }

    // Add initial message
    addChatMessage('Transfer initiated. A support agent will assist you shortly.', 'system');
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById("chatMessages");
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    
    let senderName = 'You';
    if (sender === 'admin') senderName = 'Support Agent';
    if (sender === 'system') senderName = 'System';

    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${senderName}:</strong> ${message}
        </div>
        <div class="message-time">${currentTime}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    
    if (message === "") return;

    // Add user message to chat
    addChatMessage(message, 'user');

    // Send message via Socket.io
    if (socket && socket.connected) {
        socket.emit('message', {
            from: currentUser._id,
            to: 'admin',
            content: message,
            timestamp: new Date().toISOString(),
            transferId: document.getElementById('transferId').textContent
        });
    } else {
        // Fallback to localStorage
        sendTransferMessageToAdmin(message);
    }

    input.value = "";
}

function notifyAdminOfTransferChat() {
    const transferId = document.getElementById('transferId').textContent;
    
    // Send notification to admin via Socket.io
    if (socket && socket.connected) {
        socket.emit('chatNotification', {
            type: 'transfer',
            userId: currentUser.id,
            userName: currentUser.name,
            userAccount: currentUser.account,
            transferId: transferId,
            timestamp: new Date().toISOString()
        });
    } else {
        // Fallback to localStorage
        const transferChatSession = {
            id: 'transfer-' + Date.now(),
            source: 'transfer',
            timestamp: new Date().toISOString(),
            status: 'active',
            transferId: transferId
        };
        localStorage.setItem('currentTransferChat', JSON.stringify(transferChatSession));
        localStorage.setItem('newTransferChat', 'true');
    }
}

// Fallback localStorage functions (for when Socket.io is not available)
function sendTransferMessageToAdmin(message) {
    const chatMessages = JSON.parse(localStorage.getItem('transferChatMessages') || '[]');
    chatMessages.push({
        from: 'user',
        message: message,
        timestamp: new Date().toISOString(),
        source: 'transfer'
    });
    localStorage.setItem('transferChatMessages', JSON.stringify(chatMessages));
    localStorage.setItem('newTransferMessage', 'true');
}

    function checkForAdminTransferResponse() {
      const adminResponse = localStorage.getItem('adminResponseToTransferChat');
      if (adminResponse) {
        const response = JSON.parse(adminResponse);
        addChatMessage(response.message, 'admin');
        localStorage.removeItem('adminResponseToTransferChat');
      }
    }

    // Load current user's accounts
    async function loadUserAccounts() {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
          console.error('No user info found');
          return;
        }

        const user = JSON.parse(userInfo);
        const accountSelector = document.getElementById('accountSelector');
        
        if (!accountSelector) return;

        // Create account options for the current user
        const accountHTML = `
          <div class="account-option active" data-account-id="${user.id}">
            <div class="account-type">Primary Checking</div>
            <div class="account-number">•••• ${user.account.slice(-4)}</div>
            <div class="account-balance">$${(user.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
        `;
        
        accountSelector.innerHTML = accountHTML;
        
        // Add click handlers for account selection
        const accountOptions = accountSelector.querySelectorAll('.account-option');
        accountOptions.forEach(option => {
          option.addEventListener('click', function() {
            accountOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
          });
        });
        
      } catch (error) {
        console.error('Error loading user accounts:', error);
      }
    }

    // Load all users for internal transfers
    async function loadAllUsers() {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://trial-1-sq1y.onrender.com';
        const response = await fetch(`${backendUrl}/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        const currentUser = JSON.parse(localStorage.getItem('userInfo'));
        
        // Filter out the current user and admin users
        const otherUsers = users.filter(user => 
          user.id !== currentUser.id && user.role !== 'admin'
        );

        const userRecipientSelect = document.getElementById('user-recipient');
        if (userRecipientSelect) {
          userRecipientSelect.innerHTML = '<option value="">Select a user</option>';
          
          otherUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (•••• ${user.account.slice(-4)})`;
            userRecipientSelect.appendChild(option);
          });
        }
        
      } catch (error) {
        console.error('Error loading users:', error);
      }
    }

    // Setup transfer form functionality
    function setupTransferForm() {
      const recipientSelect = document.getElementById('recipient');
      const usersSelection = document.getElementById('users-selection');
      const bankSelection = document.getElementById('bank-selection');
      const transferForm = document.querySelector('.transfer-form');

      if (recipientSelect) {
        recipientSelect.addEventListener('change', function() {
          const selectedValue = this.value;
          
          // Hide all selection divs
          usersSelection.style.display = 'none';
          bankSelection.style.display = 'none';
          
          // Show appropriate selection based on choice
          if (selectedValue === 'users') {
            usersSelection.style.display = 'block';
          } else if (selectedValue === 'external') {
            bankSelection.style.display = 'block';
          }
        });
      }

      if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
          e.preventDefault();
          handleTransferSubmission();
        });
      }
    }

    // Handle transfer form submission
    async function handleTransferSubmission() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const recipientType = document.getElementById('recipient').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const memo = document.getElementById('memo').value;
        
        if (!amount || amount <= 0) {
          alert('Please enter a valid amount');
          return;
        }

        if (userInfo.balance < amount) {
          alert('Insufficient funds');
          return;
        }

        let transferData = {
          fromUserId: userInfo.id,
          amount: amount,
          memo: memo,
          date: new Date().toISOString(),
          status: 'pending'
        };

        if (recipientType === 'users') {
          const selectedUserId = document.getElementById('user-recipient').value;
          if (!selectedUserId) {
            alert('Please select a recipient');
            return;
          }
          transferData.toUserId = selectedUserId;
          transferData.type = 'internal';
        } else if (recipientType === 'external') {
          const bankName = document.getElementById('bank-name').value;
          const accountNumber = document.getElementById('account-number').value;
          const routingNumber = document.getElementById('routing-number').value;
          
          if (!bankName || !accountNumber || !routingNumber) {
            alert('Please fill in all external transfer details');
            return;
          }
          
          transferData.type = 'external';
          transferData.bankName = bankName;
          transferData.accountNumber = accountNumber;
          transferData.routingNumber = routingNumber;
        } else {
          alert('Please select a recipient type');
          return;
        }

        // Send transfer request to backend
        const token = localStorage.getItem('jwtToken');
        const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://trial-1-sq1y.onrender.com';
        
        const response = await fetch(`${backendUrl}/api/transfers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transferData)
        });

        if (response.ok) {
          const result = await response.json();
          alert('Transfer submitted successfully! Transfer ID: ' + result.transferId);
          
          // Notify admin of transfer request
          notifyAdminOfTransferChat();
          
          // Reset form
          document.querySelector('.transfer-form').reset();
          document.getElementById('users-selection').style.display = 'none';
          document.getElementById('bank-selection').style.display = 'none';
          
        } else {
          const error = await response.json();
          alert('Transfer failed: ' + (error.message || 'Unknown error'));
        }
        
      } catch (error) {
        console.error('Error submitting transfer:', error);
        alert('Transfer failed. Please try again.');
      }
    }

// Check for admin responses every 2 seconds (fallback)
setInterval(checkForAdminTransferResponse, 2000);

// Handle Enter key in chat
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById("chatInput");
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
});
