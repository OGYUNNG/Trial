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
  socket.emit('join', { userId: currentUser._id || currentUser.id });

  // Listen for incoming messages
  socket.on('message', (message) => {
    if (message.from !== (currentUser._id || currentUser.id)) {
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
  setupTransferFlow();
});

// Setup the main transfer flow
function setupTransferFlow() {
  const transferForm = document.querySelector('.transfer-form');
  const continueBtn = transferForm.querySelector('button[type="submit"]');
  
  if (continueBtn) {
    continueBtn.addEventListener('click', function(e) {
      e.preventDefault();
      handleContinueClick();
    });
  }
}

// Handle Continue button click
function handleContinueClick() {
  // Validate form
  const amount = parseFloat(document.getElementById('amount').value);
  const recipient = document.getElementById('recipient').value;
  const memo = document.getElementById('memo').value;
  
  if (!amount || amount <= 0) {
    alert('Please enter a valid amount.');
    return;
  }
  
  if (!recipient) {
    alert('Please select a recipient type.');
    return;
  }
  
  // Check if specific recipient is selected
  if (recipient === 'users') {
    const userRecipient = document.getElementById('user-recipient').value;
    if (!userRecipient) {
      alert('Please select a recipient user.');
      return;
    }
  } else if (recipient === 'external') {
    const bankName = document.getElementById('bank-name').value;
    const accountNumber = document.getElementById('account-number').value;
    const routingNumber = document.getElementById('routing-number').value;
    
    if (!bankName || !accountNumber || !routingNumber) {
      alert('Please fill in all external transfer details.');
      return;
    }
  }
  
  // Update summary with current values
  updateTransferSummary();
  
  // Show review step
  showReviewStep();
}

// Update transfer summary with current form values
function updateTransferSummary() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const amount = parseFloat(document.getElementById('amount').value) || 0;
  const recipient = document.getElementById('recipient').value;
  const memo = document.getElementById('memo').value;
  
  // Update summary display
  const summaryFrom = document.querySelector('.summary-value');
  if (summaryFrom) {
    summaryFrom.textContent = `Primary Checking •••• ${userInfo.account.slice(-4)}`;
  }
  
  // Update amount in summary
  const summaryAmounts = document.querySelectorAll('.summary-value');
  summaryAmounts.forEach(element => {
    if (element.textContent.includes('$0.00') || element.textContent.includes('$')) {
      element.textContent = `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
  });
  
  // Update review step values
  const reviewFrom = document.getElementById('reviewFrom');
  const reviewTo = document.getElementById('reviewTo');
  const reviewAmount = document.getElementById('reviewAmount');
  const reviewDate = document.getElementById('reviewDate');
  const reviewMemo = document.getElementById('reviewMemo');
  
  if (reviewFrom) reviewFrom.textContent = `Primary Checking •••• ${userInfo.account.slice(-4)}`;
  if (reviewAmount) reviewAmount.textContent = `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (reviewDate) reviewDate.textContent = 'Today';
  if (reviewMemo) reviewMemo.textContent = memo || '-';
  
  // Set recipient info
  if (recipient === 'users') {
    const userRecipient = document.getElementById('user-recipient');
    const selectedOption = userRecipient.options[userRecipient.selectedIndex];
    if (reviewTo) reviewTo.textContent = selectedOption ? selectedOption.textContent : 'User not selected';
  } else if (recipient === 'external') {
    const bankName = document.getElementById('bank-name').value;
    if (reviewTo) reviewTo.textContent = `${bankName} (External Transfer)`;
  } else {
    if (reviewTo) reviewTo.textContent = 'Recipient not selected';
  }
}

// Show review step
function showReviewStep() {
  // Hide transfer form
  document.getElementById('transferForm').style.display = 'none';
  
  // Show review step
  document.getElementById('reviewStep').style.display = 'block';
  
  // Update step indicator
  updateStepIndicator(2);
}

// Go back to form
function goBackToForm() {
  // Hide review step
  document.getElementById('reviewStep').style.display = 'none';
  
  // Show transfer form
  document.getElementById('transferForm').style.display = 'block';
  
  // Update step indicator
  updateStepIndicator(1);
}

// Update step indicator
function updateStepIndicator(step) {
  const steps = document.querySelectorAll('.step');
  steps.forEach((stepElement, index) => {
    if (index < step) {
      stepElement.classList.add('active');
    } else {
      stepElement.classList.remove('active');
    }
  });
}

// Confirm transfer and show live chat
function confirmTransfer() {
  // Generate transfer ID
  const transferId = 'TRX-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3);
  
  // Hide review step
  document.getElementById('reviewStep').style.display = 'none';
  
  // Show pending step
  document.getElementById('pendingStep').style.display = 'block';
  
  // Update transfer ID in the pending step
  const transferIdElement = document.getElementById('transferId');
  if (transferIdElement) {
    transferIdElement.textContent = transferId;
  }
  
  // Update step indicator
  updateStepIndicator(3);
  
  // Initialize live chat
  initializeLiveChat();
  
  // Notify admin of transfer chat
  notifyAdminOfTransferChat(transferId);
  
  // Show live chat section
  const liveChatSection = document.querySelector('.live-chat-section');
  if (liveChatSection) {
    liveChatSection.style.display = 'block';
  }
}

// Initialize live chat
function initializeLiveChat() {
  // Add initial message
  addChatMessage('Transfer initiated. A support agent will assist you shortly.', 'system');
  
  // Start checking for admin responses
  setInterval(checkForAdminTransferResponse, 2000);
}

// Add chat message
function addChatMessage(message, sender) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;
  
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

// Send chat message
function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  
  if (message === "") return;

  // Add user message to chat
  addChatMessage(message, 'user');

  // Send message via Socket.io
  if (socket && socket.connected) {
    socket.emit('message', {
      from: currentUser._id || currentUser.id,
      to: 'admin',
      content: message,
      timestamp: new Date().toISOString(),
      transferId: document.getElementById('transferId')?.textContent || 'TRX-UNKNOWN'
    });
  } else {
    // Fallback to localStorage
    sendTransferMessageToAdmin(message);
  }

  input.value = "";
}

// Notify admin of transfer chat
function notifyAdminOfTransferChat(transferId) {
  console.log('Notifying admin of transfer chat...');
  console.log('Socket connected:', socket && socket.connected);
  console.log('Current user:', currentUser);
  
  // Send notification to admin via Socket.io
  if (socket && socket.connected) {
    const notification = {
      type: 'transfer',
      userId: currentUser._id || currentUser.id,
      userName: currentUser.name,
      userAccount: currentUser.account,
      transferId: transferId,
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending chat notification:', notification);
    socket.emit('chatNotification', notification);
    console.log('Chat notification sent via Socket.io');
  } else {
    console.log('Socket.io not connected, using localStorage fallback');
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
    console.log('Chat notification saved to localStorage');
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

// Check for admin responses
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
      <div class="account-option active" data-account-id="${user._id || user.id}">
        <div class="account-type">Primary Checking</div>
        <div class="account-number">•••• ${user.account.slice(-4)}</div>
        <div class="account-balance">$${parseFloat(user.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
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
      (user._id || user.id) !== (currentUser._id || currentUser.id) && user.role !== 'admin'
    );

    const userRecipientSelect = document.getElementById('user-recipient');
    if (userRecipientSelect) {
      userRecipientSelect.innerHTML = '<option value="">Select a user</option>';
      
      otherUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user._id || user.id;
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

  if (recipientSelect) {
    recipientSelect.addEventListener('change', function() {
      const selectedValue = this.value;
      
      // Hide all selection divs
      if (usersSelection) usersSelection.style.display = 'none';
      if (bankSelection) bankSelection.style.display = 'none';
      
      // Show appropriate selection based on choice
      if (selectedValue === 'users' && usersSelection) {
        usersSelection.style.display = 'block';
      } else if (selectedValue === 'external' && bankSelection) {
        bankSelection.style.display = 'block';
      }
    });
  }

  // Setup quick amount buttons
  const quickAmountButtons = document.querySelectorAll('.quick-amount');
  const amountInput = document.getElementById('amount');
  
  quickAmountButtons.forEach(button => {
    button.addEventListener('click', function() {
      const amount = this.textContent.replace('$', '').replace(',', '');
      if (amountInput) {
        amountInput.value = amount;
      }
    });
  });
}

// Navigation functions
function goToDashboard() {
  window.location.href = 'dashboard.html';
}

function viewTransferHistory() {
  window.location.href = 'activity.html';
}

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
