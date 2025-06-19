"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { clientsApi, api } from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, UserPlus, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "../contexts/AuthContext"

const LinkClient = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    fitnessGoal: "",
    healthIssues: "",
    notes: "",
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      console.log("Searching for users with query:", searchQuery)
      const response = await api.get(`/clients/search?query=${encodeURIComponent(searchQuery.trim())}`)
      console.log("Search results:", response.data)
      setSearchResults(response.data)
    } catch (err) {
      console.error("Errore nella ricerca utenti:", err)
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      })

      // Non mostrare toast per errori di ricerca, solo log
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers()
    }, 500) // Aumentato il delay per ridurre le chiamate

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedUser) {
      setError("Seleziona un utente da collegare come cliente")
      return
    }

    setLoading(true)
    setError("")

    try {
      const clientData = {
        userId: selectedUser.id,
        height: formData.height ? Number.parseFloat(formData.height) : null,
        weight: formData.weight ? Number.parseFloat(formData.weight) : null,
        fitnessGoal: formData.fitnessGoal,
        healthIssues: formData.healthIssues,
        notes: formData.notes,
      }

      console.log("Creating client with data:", clientData)
      await clientsApi.create(clientData)

      toast({
        title: "Cliente collegato",
        description: `${selectedUser.name} è stato collegato come cliente con successo.`,
      })

      navigate("/clients")
    } catch (err) {
      console.error("Errore durante il collegamento del cliente:", err)
      setError(err.response?.data?.message || "Errore durante il collegamento del cliente")
    } finally {
      setLoading(false)
    }
  }

  // Verifica che l'utente sia un trainer
  if (!currentUser || currentUser.role !== "TRAINER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <AlertDescription>Accesso negato: solo i trainer possono collegare clienti.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collega Cliente Esistente</h1>
          <p className="text-muted-foreground">Collega un utente esistente come tuo cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ricerca Utenti */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Cerca Utente
            </CardTitle>
            <CardDescription>Cerca un utente esistente per collegarlo come cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cerca per nome o email (minimo 2 caratteri)</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Inserisci nome o email..."
              />
            </div>

            {searchLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Risultati della ricerca:</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">Nessun utente trovato per "{searchQuery}"</div>
            )}

            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <div className="text-center py-4 text-muted-foreground">Inserisci almeno 2 caratteri per cercare</div>
            )}

            {selectedUser && (
              <Alert>
                <AlertDescription>
                  <strong>Utente selezionato:</strong> {selectedUser.name} ({selectedUser.email})
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Form Informazioni Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Informazioni Cliente
            </CardTitle>
            <CardDescription>Inserisci le informazioni aggiuntive del cliente</CardDescription>
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
                <Button type="button" variant="outline" onClick={() => navigate("/clients")}>
                  Annulla
                </Button>
                <Button type="submit" disabled={loading || !selectedUser}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Collegamento in corso...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Collega Cliente
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LinkClient
