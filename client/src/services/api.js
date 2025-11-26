// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
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

// Authentication API calls
export const authAPI = {
  // Email/Password Authentication
  register: async (name, email, password, mobile) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, mobile }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Mobile OTP Authentication
  sendMobileOTP: async (mobile) => {
    return apiRequest('/auth/mobile/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  },

  verifyMobileOTP: async (mobile, otp) => {
    return apiRequest('/auth/mobile/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  },

  // Google OAuth
  googleAuth: () => {
    // Redirect to Google OAuth
    window.location.href = `${API_URL}/auth/google`;
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  // Update current user
  updateCurrentUser: async (userData) => {
    return apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Helper function to save token
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Helper function to get token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to remove token
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Events API calls
export const eventsAPI = {
  // Get all events (upcoming only)
  getAllEvents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/events?${queryString}`);
  },

  // Get past events
  getPastEvents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/events/past?${queryString}`);
  },

  // Get event by ID
  getEventById: async (id) => {
    return apiRequest(`/events/${id}`);
  },

  // Mark event as interested
  markInterested: async (id) => {
    return apiRequest(`/events/${id}/interested`, {
      method: 'POST',
    });
  },

  // Book event
  bookEvent: async (id, bookingData) => {
    return apiRequest(`/events/${id}/book`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Get user bookings
  getUserBookings: async () => {
    return apiRequest('/events/bookings/my');
  },

  // Get interested events
  getInterestedEvents: async () => {
    return apiRequest('/events/interested/my');
  },

  // Remove from interested
  removeInterested: async (id) => {
    return apiRequest(`/events/${id}/interested`, {
      method: 'DELETE',
    });
  },
};

// Upload & Banner API calls
export const uploadAPI = {
  // Get banners
  getBanners: async (type = 'hero') => {
    const queryString = type ? `?type=${type}&active=true` : '?active=true';
    return apiRequest(`/upload/banners${queryString}`);
  },

  // Upload banner (requires FormData)
  uploadBanner: async (formData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/upload/banner`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  },

  // Update banner
  updateBanner: async (id, bannerData) => {
    return apiRequest(`/upload/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bannerData),
    });
  },

  // Delete banner
  deleteBanner: async (id) => {
    return apiRequest(`/upload/banners/${id}`, {
      method: 'DELETE',
    });
  },
};

// Payment API calls
export const paymentAPI = {
  // Create Cashfree payment session
  createPaymentSession: async (eventId, tickets) => {
    return apiRequest('/payments/create-session', {
      method: 'POST',
      body: JSON.stringify({ eventId, tickets }),
    });
  },

  // Verify Cashfree payment
  verifyPayment: async (orderId) => {
    return apiRequest(`/payments/verify/${orderId}`);
  },
};

export default apiRequest;


