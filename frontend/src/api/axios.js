import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ascendra_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.data instanceof FormData) {
    if (typeof config.headers.setContentType === 'function') {
      config.headers.setContentType(undefined)
    } else {
      delete config.headers['Content-Type']
    }
  }

  return config
})

export default api
