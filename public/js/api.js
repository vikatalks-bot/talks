// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('token');
};

// Get user from localStorage
const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user in localStorage
const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user from localStorage
const removeUser = () => {
  localStorage.removeItem('user');
};

// API Request Helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
const authAPI = {
  register: async (name, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },

  logout: () => {
    removeToken();
    removeUser();
    window.location.href = '/login.html';
  }
};

// Lessons API
const lessonsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/lessons${queryParams ? '?' + queryParams : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/lessons/${id}`);
  }
};

// Payments API
const paymentsAPI = {
  createStripeIntent: async (type, itemId, amount) => {
    return apiRequest('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ type, itemId, amount })
    });
  },

  confirmStripe: async (paymentIntentId, type, itemId) => {
    return apiRequest('/payments/confirm-stripe', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, type, itemId })
    });
  },

  createPayPal: async (type, itemId, amount) => {
    return apiRequest('/payments/create-paypal', {
      method: 'POST',
      body: JSON.stringify({ type, itemId, amount })
    });
  },

  getHistory: async () => {
    return apiRequest('/payments/history');
  }
};

// Subscriptions API
const subscriptionsAPI = {
  getPlans: async () => {
    return apiRequest('/subscriptions/plans');
  },

  create: async (type, price) => {
    return apiRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ type, price })
    });
  },

  getMySubscriptions: async () => {
    return apiRequest('/subscriptions/my-subscriptions');
  },

  cancel: async (id) => {
    return apiRequest(`/subscriptions/${id}/cancel`, {
      method: 'PUT'
    });
  }
};

// Bookings API
const bookingsAPI = {
  getAll: async () => {
    return apiRequest('/bookings');
  },

  create: async (subscriptionId, classDate, classTime) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({ subscriptionId, classDate, classTime })
    });
  },

  cancel: async (id) => {
    return apiRequest(`/bookings/${id}/cancel`, {
      method: 'PUT'
    });
  }
};

// Lesson Requests API
const lessonRequestsAPI = {
  create: async (lessonId, requestedDate, requestedTime, message) => {
    return apiRequest('/lesson-requests', {
      method: 'POST',
      body: JSON.stringify({ lessonId, requestedDate, requestedTime, message })
    });
  },

  getMyRequests: async () => {
    return apiRequest('/lesson-requests/my-requests');
  },

  getPending: async () => {
    return apiRequest('/lesson-requests/pending');
  },

  getAll: async (status) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/lesson-requests${query}`);
  },

  getById: async (id) => {
    return apiRequest(`/lesson-requests/${id}`);
  },

  approve: async (id, teacherResponse) => {
    return apiRequest(`/lesson-requests/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ teacherResponse })
    });
  },

  reject: async (id, teacherResponse) => {
    return apiRequest(`/lesson-requests/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ teacherResponse })
    });
  },

  cancel: async (id) => {
    return apiRequest(`/lesson-requests/${id}/cancel`, {
      method: 'PUT'
    });
  }
};

// Admin API
const adminAPI = {
  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  getPayments: async () => {
    return apiRequest('/admin/payments');
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getToken();
};

// Check if user is admin
const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

// Redirect if not authenticated
const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
};

// Redirect if not admin
const requireAdmin = () => {
  if (!requireAuth()) return false;
  if (!isAdmin()) {
    window.location.href = '/dashboard.html';
    return false;
  }
  return true;
};


