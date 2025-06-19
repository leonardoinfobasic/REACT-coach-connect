"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/contexts/NotificationContext"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"

export function NotificationBadge() {
  const {
    unreadCount,
    notifications,
    markAsRead,
  } = useNotifications()

  const [open, setOpen] = useState(false)

  const handleOpenChange = async (nextOpen) => {
    setOpen(nextOpen)

    // Quando si apre il popover, segna tutte le notifiche come lette
    if (nextOpen) {
      await markAsRead(null) // Questo chiama markAllAsRead dal context
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    setOpen(false)
  }

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Adesso"
    } else if (diffInHours < 24) {
      return `${diffInHours} ore fa`
    } else {
      return date.toLocaleDateString("it-IT")
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">Notifiche</h3>
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification) => (
              <Card
                key={notification.id}
                className={`p-3 m-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  !notification.read ? "bg-gray-50 dark:bg-gray-900" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Nessuna notifica
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t text-center">
          <Link to="/notifications">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Vedi tutte
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
