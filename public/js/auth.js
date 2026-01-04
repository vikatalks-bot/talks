// Authentication handling

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  if (user) {
    updateNavForAuth(user);
  }
});

// Update navigation for authenticated users
const updateNavForAuth = (user) => {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  // Remove existing auth links
  const existingAuth = navLinks.querySelector('.auth-links');
  if (existingAuth) {
    existingAuth.remove();
  }

  // Add user menu
  const authLinks = document.createElement('div');
  authLinks.className = 'auth-links';
  authLinks.style.display = 'flex';
  authLinks.style.gap = '1rem';
  authLinks.style.alignItems = 'center';

  authLinks.innerHTML = `
    <span>Hello, ${user.name}</span>
    <a href="/dashboard.html" class="btn btn-outline">Dashboard</a>
    ${user.role === 'admin' ? '<a href="/admin/admin.html" class="btn btn-outline">Admin</a>' : ''}
    <button class="btn btn-primary" onclick="handleLogout()">Logout</button>
  `;

  navLinks.appendChild(authLinks);
};

// Handle registration
const handleRegister = async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  try {
    const result = await authAPI.register(name, email, password);
    setToken(result.token);
    setUser(result.user);
    showSuccess('Registration successful! Redirecting...');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);
  } catch (error) {
    showError(error.message || 'Registration failed');
  }
};

// Handle login
const handleLogin = async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const result = await authAPI.login(email, password);
    setToken(result.token);
    setUser(result.user);
    showSuccess('Login successful! Redirecting...');
    setTimeout(() => {
      if (result.user.role === 'admin') {
        window.location.href = '/admin/admin.html';
      } else {
        window.location.href = '/dashboard.html';
      }
    }, 1500);
  } catch (error) {
    showError(error.message || 'Login failed');
  }
};

// Handle logout
const handleLogout = () => {
  authAPI.logout();
};

// Show error message
const showError = (message) => {
  const errorDiv = document.getElementById('error-message') || createMessageDiv('error-message', 'error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
};

// Show success message
const showSuccess = (message) => {
  const successDiv = document.getElementById('success-message') || createMessageDiv('success-message', 'success');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  setTimeout(() => {
    successDiv.style.display = 'none';
  }, 5000);
};

// Create message div if it doesn't exist
const createMessageDiv = (id, type) => {
  const div = document.createElement('div');
  div.id = id;
  div.className = `alert alert-${type}`;
  const form = document.querySelector('form');
  if (form) {
    form.insertBefore(div, form.firstChild);
  }
  return div;
};

// Make functions globally available
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;


