"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  user: { username: string; name: string } | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<{ username: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify")
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          const storedUsername = localStorage.getItem("admin_username")
          if (storedUsername) {
            setUser({ username: storedUsername, name: storedUsername })
            setIsAuthenticated(true)
            setIsAdmin(true)
          }
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    if (!username || !password) {
      throw new Error("Username and password are required")
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Invalid credentials")
    }

    const data = await response.json()
    localStorage.setItem("admin_username", data.username)

    setUser({ username: data.username, name: data.username })
    setIsAuthenticated(true)
    setIsAdmin(true)
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("admin_username")
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
