"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useAuth } from "../contexts/AuthContext"

export const useSocket = (url) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { currentUser } = useAuth()

  useEffect(() => {
    // Non connettere se non c'è un utente autenticato
    if (!currentUser) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      return
    }

    // Crea una nuova connessione Socket.io
    const socketInstance = io(url || import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
  withCredentials: true,
  auth: { token },
})

    // Gestisci gli eventi di connessione
    socketInstance.on("connect", () => {
      console.log("Socket.io connesso")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket.io disconnesso")
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Errore di connessione Socket.io:", error.message)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    // Pulisci alla disconnessione
    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [currentUser, url])

  return { socket, isConnected }
}

// Esportiamo solo come esportazione nominata
export default useSocket
