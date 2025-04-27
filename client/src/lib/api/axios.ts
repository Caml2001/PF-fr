import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000', // Your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  // You might want to add withCredentials: true if you use cookies for sessions
  // withCredentials: true, 
});

// Add a request interceptor to include the auth token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error here
    return Promise.reject(error);
  }
);

export default apiClient;
