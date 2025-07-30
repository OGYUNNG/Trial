// Toggle password visibility
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('click', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  togglePassword.innerHTML = type === 'password'
    ? '<i class="fas fa-eye"></i>'
    : '<i class="fas fa-eye-slash"></i>';
});

// Handle form submission
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = passwordInput.value.trim();
  const rememberMe = document.getElementById('remember').checked;

  // Clear any previous error message
  errorMessage.textContent = "";

  // Validate username (email format or just not empty)
  if (!username) {
    errorMessage.textContent = "Please enter your Online ID.";
    return;
  }

  // Optional: Check if username looks like an email (you can skip if not needed)
  const isEmailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
  if (!isEmailLike && username.includes("@")) {
    errorMessage.textContent = "Please enter a valid email format.";
    return;
  }

  // Validate password
  if (!password) {
    errorMessage.textContent = "Please enter your password.";
    return;
  }

  if (password.length < 6) {
    errorMessage.textContent = "Password must be at least 6 characters long.";
    return;
  }

  // Send login data to backend API
  const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://frosstbank-backend.onrender.com';
  fetch(`${backendUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      // Store JWT token and user info
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      errorMessage.textContent = data.error || 'Login failed';
    }
  })
  .catch(err => {
    console.error(err);
    errorMessage.textContent = "Something went wrong. Please try again.";
  });

  // Remember Online ID if checked
  if (rememberMe) {
    localStorage.setItem('savedUsername', username);
  } else {
    localStorage.removeItem('savedUsername');
  }
});

// Optional: Pre-fill username if remembered
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('savedUsername');
  if (saved) {
    document.getElementById('username').value = saved;
    document.getElementById('remember').checked = true;
  }
});
