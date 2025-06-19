"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { clientsApi } from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Edit, Trash2, ArrowLeft, MessageCircle } from "lucide-react"
import LoadingScreen from "../components/LoadingScreen"
import { Plus, Eye, Calendar } from "lucide-react"
import { Link } from "react-router-dom"

const formatDate = (dateString) => {
  if (!dateString) return "Data non impostata"
  const date = new Date(dateString)
  return date.toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const ClientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        console.log("Fetching client with ID:", id)
        const response = await clientsApi.getById(id)
        console.log("Client API response:", response)
        setClient(response.data)
      } catch (error) {
        console.error("Errore nel caricamento del cliente:", error)
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
        toast({
          title: "Errore",
          description: error.response?.data?.message || "Impossibile caricare i dati del cliente",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchClient()
    }
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await clientsApi.delete(id)
      toast({
        title: "Cliente eliminato",
        description: "Il cliente è stato eliminato con successo",
      })
      navigate("/clients")
    } catch (error) {
      console.error("Errore nell'eliminazione del cliente:", error)
      toast({
        title: "Errore",
        description: "Impossibile eliminare il cliente",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleSendMessage = () => {
    // Naviga alla pagina messaggi con il clientId (non userId!)
    navigate(`/messages?clientId=${client.id}`)
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-2">Cliente non trovato</h2>
        <p className="text-muted-foreground mb-4">Il cliente richiesto non esiste o è stato eliminato</p>
        <Button onClick={() => navigate("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla lista clienti
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Dettaglio Cliente</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSendMessage}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Invia Messaggio
          </Button>
          <Button variant="outline" onClick={() => navigate(`/clients/edit/${client.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.user?.avatar || "/placeholder.svg"} alt={client.user?.name || "Cliente"} />
              <AvatarFallback className="text-lg">
                {client.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "CL"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{client.user?.name || "Nome non disponibile"}</CardTitle>
              <CardDescription>{client.user?.email || "Email non disponibile"}</CardDescription>
              <Badge className="mt-2">Cliente attivo</Badge>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleSendMessage}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Invia Messaggio
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informazioni</TabsTrigger>
          <TabsTrigger value="workouts">Allenamenti</TabsTrigger>
          <TabsTrigger value="progress">Progressi</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Personali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Altezza</label>
                  <p className="text-lg">{client.height ? `${client.height} cm` : "Non specificata"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Peso</label>
                  <p className="text-lg">{client.weight ? `${client.weight} kg` : "Non specificato"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Obiettivo Fitness</label>
                <p className="text-lg">{client.fitnessGoal || "Non specificato"}</p>
              </div>
              {client.healthIssues && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Problemi di Salute</label>
                  <p className="text-lg">{client.healthIssues}</p>
                </div>
              )}
              {client.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Note</label>
                  <p className="text-lg">{client.notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate(`/clients/edit/${client.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifica informazioni
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Piani di Allenamento</CardTitle>
                  <CardDescription>Gestisci i piani di allenamento del cliente</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/workout-plans/create?clientId=${client.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi piano
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {client.workoutPlans && client.workoutPlans.length > 0 ? (
                <div className="space-y-4">
                  {client.workoutPlans.map((plan) => (
                    <Card key={`plan-${plan.id}`} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{plan.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {plan.description || "Nessuna descrizione"}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(plan.startDate)}
                            </div>
                            <Badge
                              variant="secondary"
                              className={
                                plan.status === "ACTIVE"
                                  ? "bg-green-500"
                                  : plan.status === "COMPLETED"
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                              }
                            >
                              {plan.status === "ACTIVE"
                                ? "Attiva"
                                : plan.status === "COMPLETED"
                                  ? "Completata"
                                  : "Archiviata"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/workout-plans/${plan.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/workout-plans/edit/${plan.id}`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Nessun piano di allenamento disponibile per questo cliente.
                  </p>
                  <Button variant="outline" onClick={() => navigate(`/workout-plans/create?clientId=${client.id}`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi piano di allenamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progressi</CardTitle>
              <CardDescription>Monitora i progressi del cliente nel tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Nessun dato sui progressi disponibile.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Aggiungi registrazione progressi</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Verranno eliminati tutti i dati del cliente, inclusi i piani di
              allenamento e i progressi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminazione in corso..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ClientDetail
