import api from './axios'

export async function registerUser({ username, email, password }) {
  const { data } = await api.post('/auth/register', {
    username,
    email,
    password,
  })
  return data
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data
}
