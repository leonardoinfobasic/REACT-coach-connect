"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { clientsApi } from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import LoadingScreen from "../components/LoadingScreen"

const EditClient = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [client, setClient] = useState(null)

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    fitnessGoal: "",
    healthIssues: "",
    notes: "",
  })

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await clientsApi.getById(id)
        setClient(response.data)

        // Inizializza il form con i dati del cliente
        setFormData({
          height: response.data.height || "",
          weight: response.data.weight || "",
          fitnessGoal: response.data.fitnessGoal || "",
          healthIssues: response.data.healthIssues || "",
          notes: response.data.notes || "",
        })
      } catch (error) {
        console.error("Errore nel caricamento del cliente:", error)
        setError("Impossibile caricare i dati del cliente")
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [id])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const clientData = {
        height: formData.height ? Number.parseFloat(formData.height) : null,
        weight: formData.weight ? Number.parseFloat(formData.weight) : null,
        fitnessGoal: formData.fitnessGoal,
        healthIssues: formData.healthIssues,
        notes: formData.notes,
      }

      await clientsApi.update(id, clientData)

      toast({
        title: "Cliente aggiornato",
        description: "Le informazioni del cliente sono state aggiornate con successo.",
      })

      navigate(`/clients/${id}`)
    } catch (err) {
      console.error("Errore durante l'aggiornamento del cliente:", err)
      setError(err.response?.data?.message || "Errore durante l'aggiornamento del cliente")
    } finally {
      setSaving(false)
    }
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
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Cliente</h1>
          <p className="text-muted-foreground">Modifica le informazioni di {client.user.name}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informazioni Cliente</CardTitle>
          <CardDescription>Aggiorna i dati del cliente</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Altezza (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  placeholder="175"
                  min="100"
                  max="250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  placeholder="70"
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fitnessGoal">Obiettivo Fitness</Label>
              <Select value={formData.fitnessGoal} onValueChange={(value) => handleChange("fitnessGoal", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un obiettivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perdere peso">Perdere peso</SelectItem>
                  <SelectItem value="Aumentare massa muscolare">Aumentare massa muscolare</SelectItem>
                  <SelectItem value="Tonificare">Tonificare</SelectItem>
                  <SelectItem value="Migliorare resistenza">Migliorare resistenza</SelectItem>
                  <SelectItem value="Aumentare forza">Aumentare forza</SelectItem>
                  <SelectItem value="Benessere generale">Benessere generale</SelectItem>
                  <SelectItem value="Riabilitazione">Riabilitazione</SelectItem>
                  <SelectItem value="Altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthIssues">Problemi di salute o limitazioni</Label>
              <Textarea
                id="healthIssues"
                value={formData.healthIssues}
                onChange={(e) => handleChange("healthIssues", e.target.value)}
                placeholder="Descrivi eventuali problemi di salute, infortuni o limitazioni..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note aggiuntive</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Note aggiuntive sul cliente..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate(`/clients/${id}`)}>
                Annulla
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio in corso...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva modifiche
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditClient
