import { apiFetch } from '@/utils/apiFetch'

// 🔐 Login Service
export const loginService = async (email: string, password: string) => {
  const response = await apiFetch.post('/auth/login', { email, password }, { auth: false })

  if (!response || !response.token) {
    throw new Error(response?.message || 'Login failed')
  }

  return response
}

// 📝 Register Service
export const registerService = async (userData: any) => {
  const response = await apiFetch.post('/auth/register', userData, { auth: false })

  if (!response || !response.token) {
    throw new Error(response?.message || 'Registration failed')
  }

  return response
}

// ✅ Token Verification Service
export const verifyTokenService = async () => {
  // Token is already handled globally in apiFetch
  return await apiFetch.get('/auth/verify')
}
