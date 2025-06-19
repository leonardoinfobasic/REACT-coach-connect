"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { clientsApi } from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const CreateClient = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "password123", // Password predefinita per i nuovi clienti
    height: "",
    weight: "",
    fitnessGoal: "",
    healthIssues: "",
    notes: "",
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 1. Prima creiamo l'utente cliente
      const userResponse = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "CLIENT",
      })

      const newUserId = userResponse.data.user.id

      // 2. Poi creiamo il profilo cliente associato all'utente e al trainer corrente
      const clientData = {
        userId: newUserId,
        height: formData.height ? Number.parseFloat(formData.height) : null,
        weight: formData.weight ? Number.parseFloat(formData.weight) : null,
        fitnessGoal: formData.fitnessGoal,
        healthIssues: formData.healthIssues,
        notes: formData.notes,
      }

      await clientsApi.create(clientData)

      toast({
        title: "Cliente creato",
        description: "Il cliente è stato aggiunto con successo.",
      })

      navigate("/clients")
    } catch (err) {
      console.error("Errore durante la creazione del cliente:", err)
      setError(err.response?.data?.message || "Errore durante la creazione del cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aggiungi Nuovo Cliente</h1>
          <p className="text-muted-foreground">Crea un nuovo profilo cliente</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Informazioni Cliente
          </CardTitle>
          <CardDescription>Inserisci le informazioni del nuovo cliente</CardDescription>
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
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Mario Rossi"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="mario@esempio.com"
                  required
                />
              </div>
            </div>

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
              <Button type="button" variant="outline" onClick={() => navigate("/clients")}>
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
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crea Cliente
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

export default CreateClient