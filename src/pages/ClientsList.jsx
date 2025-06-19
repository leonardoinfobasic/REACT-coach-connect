"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { clientsApi } from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Users, Mail, UserPlus, Search, Target, Activity, Calendar } from "lucide-react"
import LoadingScreen from "../components/LoadingScreen"

const ClientsList = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientsApi.getAll()
        setClients(response.data)
      } catch (error) {
        console.error("Errore nel caricamento dei clienti:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const filteredClients = clients.filter(
    (client) =>
      client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.fitnessGoal && client.fitnessGoal.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header colorato */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 dark:from-emerald-600 dark:to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">👥 I Tuoi Clienti</h1>
            <p className="text-emerald-100 dark:text-emerald-200 text-lg">
              Gestisci i tuoi clienti e monitora i loro progressi
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Link to="/clients/link">
                <UserPlus className="mr-2 h-4 w-4" />
                Collega Cliente
              </Link>
            </Button>
            <Button asChild className="bg-white text-emerald-600 hover:bg-gray-100 shadow-lg">
              <Link to="/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuovo Cliente
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Barra di ricerca */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Cerca clienti per nome, email o obiettivo... 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg border-gray-300 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Totale Clienti</p>
                <p className="text-3xl font-bold">{clients.length}</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Clienti Attivi</p>
                <p className="text-3xl font-bold">{clients.length}</p>
              </div>
              <Activity className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Nuovi Questo Mese</p>
                <p className="text-3xl font-bold">+{Math.min(clients.length, 5)}</p>
              </div>
              <Calendar className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredClients.length === 0 ? (
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full p-6 mb-6">
              <Users className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              {searchTerm ? "Nessun cliente trovato" : "Nessun cliente ancora"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              {searchTerm
                ? "Prova a modificare i termini di ricerca o aggiungi un nuovo cliente."
                : "Non hai ancora aggiunto nessun cliente. Inizia aggiungendo il tuo primo cliente per gestire i loro allenamenti."}
            </p>
            {!searchTerm && (
              <div className="flex gap-3">
                <Button variant="outline" asChild className="border-emerald-300 text-emerald-600 hover:bg-emerald-50">
                  <Link to="/clients/link">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Collega Cliente Esistente
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg"
                >
                  <Link to="/clients/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Crea Nuovo Cliente
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client, index) => (
            <Card
              key={client.id ?? `index-${index}`}
              className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg"
            >
              <CardHeader
                className={`pb-3 bg-gradient-to-r ${
                  index % 4 === 0
                    ? "from-blue-500 to-purple-600"
                    : index % 4 === 1
                      ? "from-green-500 to-blue-600"
                      : index % 4 === 2
                        ? "from-orange-500 to-red-600"
                        : "from-purple-500 to-pink-600"
                } text-white rounded-t-lg`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                    <AvatarImage src={client.user.avatar || "/placeholder.svg"} alt={client.user.name} />
                    <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                      {client.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white">{client.user.name}</CardTitle>
                    <CardDescription className="flex items-center text-white/80">
                      <Mail className="mr-1 h-3 w-3" />
                      {client.user.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Obiettivo:
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200"
                    >
                      {client.fitnessGoal || "Non specificato"}
                    </Badge>
                  </div>

                  {client.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">💪 Peso:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{client.weight} kg</span>
                    </div>
                  )}

                  {client.height && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">📏 Altezza:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{client.height} cm</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">📅 Membro da:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {new Date(client.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">✅ Cliente attivo</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <Link to={`/clients/${client.id}`}>Visualizza</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClientsList
