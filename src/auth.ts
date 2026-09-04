import { ref } from 'vue'

export const isAuthenticated = ref(false)

export const login = (username: string, password: string) => {
  isAuthenticated.value = username === 'admin' && password === 'password123'
  return isAuthenticated.value
}

export const logout = () => {
  isAuthenticated.value = false
}
