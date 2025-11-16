import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

const api = axios.create({ 
  baseURL,
  withCredentials: true
})

// Request interceptor - add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if(token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle API error responses
    if (error.response?.data?.error) {
      console.error('API Error:', error.response.data.error)
    }
    
    // Handle validation errors
    if (error.response?.status === 400 && error.response?.data?.errors) {
      console.error('Validation Errors:', error.response.data.errors)
    }
    
    // Handle authentication errors - clear token and redirect to login
    if (error.response?.status === 401) {
      console.error('Authentication failed - clearing token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api
