"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api" // ✅ CORRETTO
import io from "socket.io-client"
import { toast } from "../components/ui/use-toast"
import { useAuth } from "../contexts/AuthContext"

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)

  // Connessione socket
  useEffect(() => {
    if (!currentUser) return

    const token = localStorage.getItem("token")
    if (!token) return

    const socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    })

    socketInstance.on("connect", () => {
      console.log("✅ Connected to socket server")
    })

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from socket server")
    })

    socketInstance.on("connect_error", (error) => {
      console.error("🚨 Errore connessione socket:", error.message)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [currentUser])

  // Carica notifiche iniziali
  useEffect(() => {
    if (currentUser) {
      fetchNotifications()
    }
  }, [currentUser])

  // Eventi socket
  useEffect(() => {
    if (!socket) return

    socket.on("notification:new", (notification) => {
      console.log("📥 Nuova notifica:", notification)
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      toast({
        title: "Nuova notifica",
        description: notification.message,
        duration: 5000,
      })
    })

    socket.on("notification:read", (notificationId) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
      updateUnreadCount()
    })

    socket.on("notification:delete", (notificationId) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      updateUnreadCount()
    })

    return () => {
      socket.off("notification:new")
      socket.off("notification:read")
      socket.off("notification:delete")
    }
  }, [socket])

  // Funzione per recuperare notifiche
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.notifications.getAll()
      if (response?.data) {
        setNotifications(response.data)
        const unread = response.data.filter((n) => !n.read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Errore nel recupero notifiche:", error)
    } finally {
      setLoading(false)
    }
  }

  // Funzione per segnare una notifica come letta (o tutte)
  const markAsRead = async (id) => {
    try {
      if (!id) {
        await markAllAsRead()
        return
      }

      await api.notifications.markAsRead(id)

      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )

      setNotifications(updated)
      setUnreadCount(updated.filter((n) => !n.read).length)
    } catch (error) {
      console.error("Errore nel segnare come letta:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Errore nel segnare tutte come lette:", error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.notifications.delete(id)
      const updated = notifications.filter((n) => n.id !== id)
      setNotifications(updated)
      setUnreadCount(updated.filter((n) => !n.read).length)
    } catch (error) {
      console.error("Errore nell'eliminazione:", error)
    }
  }

  const deleteAllNotifications = async () => {
    try {
      await api.notifications.deleteAll()
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error("Errore nell'eliminazione di tutte le notifiche:", error)
    }
  }

  const updateUnreadCount = () => {
    const unread = notifications.filter((n) => !n.read).length
    setUnreadCount(unread)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
