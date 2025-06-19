// src/contexts/AuthContext.jsx

"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { api } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/me")
      setCurrentUser(response.data)
    } catch (err) {
      console.error("Errore nel recupero del profilo:", err)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const refreshUserProfile = async () => {
    if (!token) return
    try {
      const res = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setCurrentUser(res.data)
    } catch (err) {
      console.error("Errore durante il refresh del profilo:", err)
    }
  }

  const login = async (email, password) => {
    try {
      setError("")
      const response = await api.post("/auth/login", { email, password })
      const { token: newToken, user } = response.data

      localStorage.setItem("token", newToken)
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      setToken(newToken)
      setCurrentUser(user)
      return user
    } catch (err) {
      setError(err.response?.data?.message || "Errore durante il login")
      throw err
    }
  }

  const register = async (userData) => {
  try {
    setError("")
    const response = await api.post("/auth/register", userData)
    const { token, user } = response.data

    localStorage.setItem("token", token)
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setCurrentUser(user)

    return user
  } catch (err) {
    setError(err.response?.data?.message || "Errore durante la registrazione")
    throw err
  }
}

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setToken(null)
    setCurrentUser(null)
  }

  const value = {
    token,                // 💖 ora puoi accedere al token ovunque!
    currentUser,
    login,
    register,
    logout,
    refreshUserProfile,
    loading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
