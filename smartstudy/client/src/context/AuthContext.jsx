import { createContext, useContext, useEffect, useState } from 'react'
import { loginApi, signupApi } from '../api/auth'

const Ctx = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if(storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password)
      const { token, user } = response
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      setToken(token)
      setUser(user)
      return true
    } catch(e) {
      console.error('Login error:', e.response?.data || e)
      alert(e.response?.data?.error || 'Login failed')
      return false
    }
  }

  const signup = async (name, email, password) => {
    try {
      const response = await signupApi(name, email, password)
      const { token, user } = response
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      setToken(token)
      setUser(user)
      return true
    } catch(e) {
      console.error('Signup error:', e.response?.data || e)
      
      // Handle validation errors
      if (e.response?.data?.errors && Array.isArray(e.response.data.errors)) {
        const errorMessages = e.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join('\n')
        alert('Validation Error:\n' + errorMessages)
      } else {
        alert(e.response?.data?.error || 'Signup failed')
      }
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </Ctx.Provider>
  )
}

function useAuth() {
  return useContext(Ctx)
}

export { useAuth }
