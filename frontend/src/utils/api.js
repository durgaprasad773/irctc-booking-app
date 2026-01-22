const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
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

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const auth = {
  signup: (userData) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
};

export const trains = {
  search: (source, destination, date) => 
    apiCall(`/trains/search?source=${source}&destination=${destination}&date=${date}`),
  
  getAll: () => apiCall('/trains/all'),
  
  add: (trainData) => apiCall('/trains/add', {
    method: 'POST',
    body: JSON.stringify(trainData)
  }),
  
  delete: (id) => apiCall(`/trains/delete/${id}`, {
    method: 'DELETE'
  })
};

export const bookings = {
  create: (bookingData) => apiCall('/bookings/create', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  
  getUserBookings: () => apiCall('/bookings/user'),
  
  cancel: (id) => apiCall(`/bookings/cancel/${id}`, {
    method: 'PUT'
  })
};

export default { auth, trains, bookings };
