import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!socketRef.current) {
      // Initialize socket connection
      const socket = io({
        path: "/api/socket",
        addTrailingSlash: false,
      })

      // Store socket instance
      socketRef.current = socket

      // Log connection status
      socket.on("connect", () => {
        console.log("WebSocket connected")
      })

      socket.on("disconnect", () => {
        console.log("WebSocket disconnected")
      })

      socket.on("error", (error) => {
        console.error("WebSocket error:", error)
      })
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  return socketRef.current
} 