"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { workoutPlansApi, clientsApi } from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Plus, Trash2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import LoadingScreen from "../components/LoadingScreen"

const CreateWorkoutPlan = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [error, setError] = useState("")

  // Ottieni il clientId dall'URL se presente
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const clientIdFromUrl = queryParams.get("clientId")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: clientIdFromUrl || "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  })

  const [exercises, setExercises] = useState([])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientsApi.getAll()
        setClients(response.data)
      } catch (error) {
        console.error("Errore nel caricamento dei clienti:", error)
        setError("Impossibile caricare la lista dei clienti")
      } finally {
        setLoadingClients(false)
      }
    }

    fetchClients()
  }, [])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleExerciseChange = (index, field, value) => {
    setExercises((prev) => prev.map((exercise, i) => (i === index ? { ...exercise, [field]: value } : exercise)))
  }

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        day: 1,
        exerciseName: "",
        sets: "",
        reps: "",
        weight: "",
        restTime: "",
        notes: "",
        exerciseOrder: prev.length + 1,
      },
    ])
  }

  const removeExercise = (index) => {
    setExercises((prev) => {
      const newExercises = prev.filter((_, i) => i !== index)
      // Riordina gli exerciseOrder
      return newExercises.map((exercise, i) => ({
        ...exercise,
        exerciseOrder: i + 1,
      }))
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validazione lato client
      if (!formData.title.trim()) {
        setError("Il titolo è obbligatorio")
        setLoading(false)
        return
      }

      // Filtra e prepara gli esercizi
      const validExercises = exercises
        .filter((ex) => ex.exerciseName && ex.exerciseName.trim() !== "")
        .map((exercise, index) => ({
  day: Number(exercise.day) || 1,
  exerciseName: exercise.exerciseName.trim(),
  sets: exercise.sets ? Number(exercise.sets) : null,
  reps: exercise.reps ? String(exercise.reps) : null,
  weight: exercise.weight || null,
  restTime: exercise.restTime ? String(exercise.restTime) : null,
  notes: exercise.notes || null,
  exerciseOrder: index + 1,
}))

      const workoutPlanData = {
  title: formData.title.trim(),
  description: formData.description.trim() || null,
  clientId:
    formData.clientId && formData.clientId !== "none"
      ? parseInt(formData.clientId)  // 👈 CONVERSIONE QUI
      : null,
  startDate: formData.startDate || null,
  endDate: formData.endDate || null,
  status: formData.status || "ACTIVE",
  exercises: validExercises,
}

      console.log("Dati da inviare:", JSON.stringify(workoutPlanData, null, 2))

      const response = await workoutPlansApi.create(workoutPlanData)
      console.log("Risposta del server:", response.data)

      toast({
        title: "Scheda creata",
        description: "La scheda di allenamento è stata creata con successo.",
      })

      // Naviga alla lista delle schede invece che al dettaglio
      navigate("/workout-plans")
    } catch (err) {
      console.error("Errore completo:", err)
      console.error("Response status:", err.response?.status)
      console.error("Response data:", err.response?.data)
      console.error("Request data:", err.config?.data)

      const errorMessage = err.response?.data?.message || err.message || "Errore durante la creazione della scheda"
      setError(errorMessage)

      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const groupedExercises = exercises.reduce((acc, exercise, index) => {
    const day = exercise.day
    if (!acc[day]) acc[day] = []
    acc[day].push({ ...exercise, index })
    return acc
  }, {})

  if (loadingClients) {
    return <LoadingScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/workout-plans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuova Scheda di Allenamento</h1>
          <p className="text-muted-foreground">Crea una nuova scheda di allenamento per i tuoi clienti</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Generali</CardTitle>
            <CardDescription>Inserisci le informazioni base della scheda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Es. Piano di tonificazione"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleChange("clientId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un cliente (opzionale)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessun cliente specifico</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descrivi gli obiettivi e le caratteristiche della scheda..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data inizio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data fine</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Stato</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Attiva</SelectItem>
                    <SelectItem value="COMPLETED">Completata</SelectItem>
                    <SelectItem value="ARCHIVED">Archiviata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Esercizi</CardTitle>
                <CardDescription>Aggiungi gli esercizi organizzati per giorni (opzionale)</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addExercise}>
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Esercizio
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="1" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <TabsTrigger key={day} value={day.toString()}>
                    Giorno {day}
                  </TabsTrigger>
                ))}
              </TabsList>

              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <TabsContent key={day} value={day.toString()} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Giorno {day}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newExercise = {
                          day,
                          exerciseName: "",
                          sets: "",
                          reps: "",
                          weight: "",
                          restTime: "",
                          notes: "",
                          exerciseOrder: exercises.filter((ex) => ex.day === day).length + 1,
                        }
                        setExercises((prev) => [...prev, newExercise])
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Aggiungi esercizio
                    </Button>
                  </div>

                  {groupedExercises[day]?.length > 0 ? (
                    <div className="space-y-4">
                      {groupedExercises[day].map((exercise) => (
                        <Card key={exercise.index} className="p-4">
                          <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-2">
                              <Label>Nome esercizio *</Label>
                              <Input
                                value={exercise.exerciseName}
                                onChange={(e) => handleExerciseChange(exercise.index, "exerciseName", e.target.value)}
                                placeholder="Es. Squat"
                              />
                            </div>
                            <div>
                              <Label>Serie</Label>
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => handleExerciseChange(exercise.index, "sets", e.target.value)}
                                placeholder="3"
                                min="1"
                              />
                            </div>
                            <div>
                              <Label>Ripetizioni</Label>
                              <Input
                                value={exercise.reps}
                                onChange={(e) => handleExerciseChange(exercise.index, "reps", e.target.value)}
                                placeholder="12-15"
                              />
                            </div>
                            <div>
                              <Label>Peso</Label>
                              <Input
                                value={exercise.weight}
                                onChange={(e) => handleExerciseChange(exercise.index, "weight", e.target.value)}
                                placeholder="20kg"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeExercise(exercise.index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <Label>Recupero</Label>
                              <Input
                                value={exercise.restTime}
                                onChange={(e) => handleExerciseChange(exercise.index, "restTime", e.target.value)}
                                placeholder="60s"
                              />
                            </div>
                            <div>
                              <Label>Note</Label>
                              <Input
                                value={exercise.notes}
                                onChange={(e) => handleExerciseChange(exercise.index, "notes", e.target.value)}
                                placeholder="Note aggiuntive..."
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nessun esercizio per questo giorno
                      <br />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const newExercise = {
                            day,
                            exerciseName: "",
                            sets: "",
                            reps: "",
                            weight: "",
                            restTime: "",
                            notes: "",
                            exerciseOrder: exercises.filter((ex) => ex.day === day).length + 1,
                          }
                          setExercises((prev) => [...prev, newExercise])
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Aggiungi primo esercizio
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/workout-plans")}>
            Annulla
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creazione in corso...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Crea Scheda
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateWorkoutPlan
