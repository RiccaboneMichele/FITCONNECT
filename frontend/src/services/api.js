// API Service - Axios client con interceptors per JWT
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Crea istanza axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Aggiungi JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Gestisci errori
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto o non valido
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const authAPI = {
  login: async (email, password) => {
    const formData = new FormData()
    formData.append('username', email) // OAuth2 usa 'username' field
    formData.append('password', password)
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// ============================================================================
// USERS
// ============================================================================

export const usersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/users', data)
    return response.data
  },
  
  getById: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },
  
  update: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data)
    return response.data
  },

  updateStatus: async (userId, isActive) => {
    const response = await api.put(`/users/${userId}`, { is_active: isActive })
    return response.data
  },
  
  delete: async (userId) => {
    const response = await api.delete(`/users/${userId}`)
    return response.data
  },
}

// ============================================================================
// CLIENTS
// ============================================================================

export const clientsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/clients', { params })
    return response.data
  },
  
  getById: async (clientId) => {
    const response = await api.get(`/clients/${clientId}`)
    return response.data
  },

  getMyProfile: async () => {
    const response = await api.get('/clients/profile/me')
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/clients', data)
    return response.data
  },
  
  update: async (clientId, data) => {
    const response = await api.put(`/clients/${clientId}`, data)
    return response.data
  },
}

// ============================================================================
// TRAINERS
// ============================================================================

export const trainersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/trainers', { params })
    return response.data
  },
  
  getById: async (trainerId) => {
    const response = await api.get(`/trainers/${trainerId}`)
    return response.data
  },

  getMyProfile: async () => {
    const response = await api.get('/trainers/profile/me')
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/trainers', data)
    return response.data
  },
  
  update: async (trainerId, data) => {
    const response = await api.put(`/trainers/${trainerId}`, data)
    return response.data
  },
  
  search: async (filters) => {
    const response = await api.get('/trainers', { params: filters })
    return response.data
  },

  getChatMessages: async (trainerId, params = {}) => {
    const response = await api.get(`/trainers/${trainerId}/chat`, { params })
    return response.data
  },

  sendChatMessage: async (trainerId, data) => {
    const response = await api.post(`/trainers/${trainerId}/chat`, data)
    return response.data
  },

  getMyChatConversations: async (params = {}) => {
    const response = await api.get('/trainers/me/chats', { params })
    return response.data
  },

  getMyChatMessages: async (clientId, params = {}) => {
    const response = await api.get(`/trainers/me/chats/${clientId}`, { params })
    return response.data
  },

  sendMyChatMessage: async (clientId, data) => {
    const response = await api.post(`/trainers/me/chats/${clientId}`, data)
    return response.data
  },
}

// ============================================================================
// SESSIONS
// ============================================================================

export const sessionsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/sessions', { params })
    return response.data
  },
  
  getById: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`)
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/sessions', data)
    return response.data
  },
  
  update: async (sessionId, data) => {
    const response = await api.put(`/sessions/${sessionId}`, data)
    return response.data
  },
  
  cancel: async (sessionId) => {
    const response = await api.delete(`/sessions/${sessionId}`)
    return response.data
  },
}

// ============================================================================
// SPECIALIZATIONS
// ============================================================================

export const specializationsAPI = {
  getAll: async () => {
    const response = await api.get('/specializations')
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/specializations', data)
    return response.data
  },
}

// ============================================================================
// CONTACTS
// ============================================================================

export const contactsAPI = {
  create: async (data) => {
    const response = await api.post('/contacts', data)
    return response.data
  },
}

// ============================================================================
// ADMIN
// ============================================================================

export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },
  
  getContacts: async (params = {}) => {
    const response = await api.get('/admin/contacts', { params })
    return response.data
  },
  
  markContactRead: async (contactId) => {
    const response = await api.put(`/admin/contacts/${contactId}/read`)
    return response.data
  },
  
  getGroups: async () => {
    const response = await api.get('/admin/groups')
    return response.data
  },
}

export default api
