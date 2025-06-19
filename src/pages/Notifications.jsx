"use client"
import { useNotifications } from "../contexts/NotificationContext"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Trash2, CheckCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog"
import { notificationsApi } from "../services/api"
import { useToast } from "../components/ui/use-toast"

const Notifications = () => {
  const { notifications, loadNotifications, markAsRead, unreadCount } = useNotifications()
  const { toast } = useToast()

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId)
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationsApi.delete(notificationId)
      toast({
        title: "Notifica eliminata",
        description: "La notifica è stata eliminata con successo.",
      })
      loadNotifications()
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione della notifica.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAllNotifications = async () => {
    try {
      await notificationsApi.deleteAll()
      toast({
        title: "Notifiche eliminate",
        description: "Tutte le notifiche sono state eliminate con successo.",
      })
      loadNotifications()
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione delle notifiche.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      toast({
        title: "Notifiche lette",
        description: "Tutte le notifiche sono state segnate come lette.",
      })
      loadNotifications()
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento delle notifiche.",
        variant: "destructive",
      })
    }
  }

  // Formatta la data della notifica
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifiche</h1>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Segna tutte come lette
            </Button>
          )}
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina tutte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione eliminerà tutte le notifiche e non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllNotifications}>Elimina</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Non hai notifiche.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={`notification-${notification.id || Math.random()}`} className={`p-4 ${!notification.read ? "border-l-4 border-blue-500" : ""}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className={`${!notification.read ? "font-medium" : ""}`}>{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatNotificationDate(notification.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteNotification(notification.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
