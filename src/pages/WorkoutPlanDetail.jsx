"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { workoutPlansApi } from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Trash2, Calendar, User, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import LoadingScreen from "../components/LoadingScreen"
import { useAuth } from "../contexts/AuthContext"

const WorkoutPlanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!id) {
        setError("ID scheda non valido")
        setLoading(false)
        return
      }

      try {
        console.log("Fetching workout plan with ID:", id)
        const response = await workoutPlansApi.getById(id)
        console.log("Workout plan data:", response.data)

        if (!response.data) {
          setError("Scheda non trovata")
          setLoading(false)
          return
        }

        setWorkoutPlan(response.data)
      } catch (error) {
        console.error("Errore nel caricamento della scheda:", error)
        toast({
          title: "Errore",
          description: "Impossibile caricare i dettagli della scheda",
          variant: "destructive",
        })
        setError("Impossibile caricare i dettagli della scheda")
      } finally {
        setLoading(false)
      }
    }

    fetchWorkoutPlan()
  }, [id])

  const handleDelete = async () => {
    try {
      await workoutPlansApi.delete(id)
      toast({
        title: "Scheda eliminata",
        description: "La scheda di allenamento è stata eliminata con successo.",
      })
      navigate("/workout-plans")
    } catch (error) {
      console.error("Errore durante l'eliminazione della scheda:", error)
      toast({
        title: "Errore",
        description: "Impossibile eliminare la scheda di allenamento.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Non specificata"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Attiva</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-500">Completata</Badge>
      case "ARCHIVED":
        return <Badge className="bg-gray-500">Archiviata</Badge>
      default:
        return <Badge>Sconosciuto</Badge>
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Errore</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => navigate("/workout-plans")}>Torna alle schede</Button>
      </div>
    )
  }

  if (!workoutPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Scheda non trovata</h2>
        <p className="text-muted-foreground mb-4">La scheda richiesta non esiste o è stata eliminata</p>
        <Button onClick={() => navigate("/workout-plans")}>Torna alle schede</Button>
      </div>
    )
  }

  // Verifica che exercises esista prima di usarlo
  const exercises = workoutPlan.exercises || []

  // Raggruppa gli esercizi per giorno
  const exercisesByDay = exercises.reduce((acc, exercise) => {
    const day = exercise.day
    if (!acc[day]) acc[day] = []
    acc[day].push(exercise)
    return acc
  }, {})

  // Ordina gli esercizi per exerciseOrder all'interno di ogni giorno
  Object.keys(exercisesByDay).forEach((day) => {
    exercisesByDay[day].sort((a, b) => a.exerciseOrder - b.exerciseOrder)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/workout-plans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{workoutPlan.title}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
            {getStatusBadge(workoutPlan.status)}
            {workoutPlan.client && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{workoutPlan.client.user?.name || "Cliente"}</span>
              </div>
            )}
          </div>
        </div>
        {currentUser?.role === "TRAINER" && (
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigate(`/workout-plans/edit/${id}`)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione non può essere annullata. La scheda di allenamento verrà eliminata permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Dettagli Scheda</CardTitle>
            <CardDescription>Informazioni dettagliate sulla scheda di allenamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workoutPlan.description && (
              <div>
                <h3 className="font-medium mb-1">Descrizione</h3>
                <p className="text-muted-foreground">{workoutPlan.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-1">Data inizio</h3>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(workoutPlan.startDate)}</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Data fine</h3>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(workoutPlan.endDate)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-1">Creata il</h3>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{new Date(workoutPlan.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Ultimo aggiornamento</h3>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{new Date(workoutPlan.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Trainer</h3>
              <p className="text-muted-foreground">{workoutPlan.trainer?.name || "Trainer"}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Cliente</h3>
              <p className="text-muted-foreground">
                {workoutPlan.client ? workoutPlan.client.user?.name || "Cliente" : "Nessun cliente assegnato"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Stato</h3>
              <div>{getStatusBadge(workoutPlan.status)}</div>
            </div>
            <div>
              <h3 className="font-medium mb-1">Giorni di allenamento</h3>
              <p className="text-muted-foreground">
                {Object.keys(exercisesByDay).length > 0
                  ? `${Object.keys(exercisesByDay).length} giorni (${Object.keys(exercisesByDay).join(", ")})`
                  : "Nessun giorno programmato"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Totale esercizi</h3>
              <p className="text-muted-foreground">{exercises.length} esercizi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programma di Allenamento</CardTitle>
          <CardDescription>Esercizi suddivisi per giorno</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(exercisesByDay).length > 0 ? (
            <Tabs defaultValue={Object.keys(exercisesByDay)[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                {Object.keys(exercisesByDay).map((day) => (
                  <TabsTrigger key={day} value={day}>
                    Giorno {day}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.keys(exercisesByDay).map((day) => (
                <TabsContent key={day} value={day} className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">#</th>
                          <th className="text-left py-2 px-4">Esercizio</th>
                          <th className="text-left py-2 px-4">Serie</th>
                          <th className="text-left py-2 px-4">Ripetizioni</th>
                          <th className="text-left py-2 px-4">Peso</th>
                          <th className="text-left py-2 px-4">Recupero</th>
                          <th className="text-left py-2 px-4">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exercisesByDay[day].map((exercise, index) => (
                          <tr key={exercise.id} className="border-b">
                            <td className="py-2 px-4">{index + 1}</td>
                            <td className="py-2 px-4 font-medium">{exercise.exerciseName}</td>
                            <td className="py-2 px-4">{exercise.sets || "-"}</td>
                            <td className="py-2 px-4">{exercise.reps || "-"}</td>
                            <td className="py-2 px-4">{exercise.weight || "-"}</td>
                            <td className="py-2 px-4">{exercise.restTime || "-"}</td>
                            <td className="py-2 px-4">{exercise.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Nessun esercizio presente in questa scheda</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WorkoutPlanDetail