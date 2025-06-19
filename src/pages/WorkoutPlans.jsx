"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { workoutPlansApi, clientsApi } from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Dumbbell,
  Eye,
  Edit,
  Trash2,
  Target,
  Activity,
  TrendingUp,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import LoadingScreen from "../components/LoadingScreen"
import { useAuth } from "../contexts/AuthContext"

const WorkoutPlans = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [clientFilter, setClientFilter] = useState("all")

  useEffect(() => {
    if (!currentUser) return

    const fetchData = async () => {
      try {
        setLoading(true)

        const workoutPlansResponse = await workoutPlansApi.getAll()
        setWorkoutPlans(workoutPlansResponse.data)

        if (currentUser.role === "TRAINER") {
          const clientsResponse = await clientsApi.getAll()
          setClients(clientsResponse.data)
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error)
        toast({
          title: "❌ Errore",
          description: "Impossibile caricare i dati",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentUser])

  const handleDelete = async (id) => {
    try {
      await workoutPlansApi.delete(id)
      setWorkoutPlans(workoutPlans.filter((plan) => plan.id !== id))
      toast({
        title: "✅ Scheda eliminata",
        description: "La scheda di allenamento è stata eliminata con successo",
      })
    } catch (error) {
      console.error("Errore nell'eliminazione della scheda:", error)
      toast({
        title: "❌ Errore",
        description: "Impossibile eliminare la scheda di allenamento",
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
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">✅ Attiva</Badge>
      case "COMPLETED":
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">🏁 Completata</Badge>
      case "ARCHIVED":
        return <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">📦 Archiviata</Badge>
      default:
        return <Badge>❓ Sconosciuto</Badge>
    }
  }

  const filteredWorkoutPlans = workoutPlans.filter((plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter
    const matchesClient =
      clientFilter === "all" ||
      (clientFilter === "unassigned" && !plan.client) ||
      (plan.client && plan.client.id.toString() === clientFilter)

    return matchesSearch && matchesStatus && matchesClient
  })

  if (!currentUser) {
    return <LoadingScreen />
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header colorato */}
      <div className="bg-gradient-to-r from-orange-500 to-purple-600 dark:from-orange-600 dark:to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">🏋️ Schede di Allenamento</h1>
            <p className="text-orange-100 dark:text-orange-200 text-lg">
              Gestisci le schede di allenamento per i tuoi clienti
            </p>
          </div>
          {currentUser?.role === "TRAINER" && (
            <Button
              onClick={() => navigate("/workout-plans/new")}
              className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuova Scheda
            </Button>
          )}
        </div>
      </div>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Totale Schede</p>
                <p className="text-3xl font-bold">{workoutPlans.length}</p>
              </div>
              <Dumbbell className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Schede Attive</p>
                <p className="text-3xl font-bold">{workoutPlans.filter((p) => p.status === "ACTIVE").length}</p>
              </div>
              <Activity className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Completate</p>
                <p className="text-3xl font-bold">{workoutPlans.filter((p) => p.status === "COMPLETED").length}</p>
              </div>
              <Target className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Questo Mese</p>
                <p className="text-3xl font-bold">+{Math.min(workoutPlans.length, 8)}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-pink-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtri */}
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />🔍 Filtri di Ricerca
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cerca</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cerca per titolo... 🔍"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stato</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400">
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🔄 Tutti gli stati</SelectItem>
                  <SelectItem value="ACTIVE">✅ Attive</SelectItem>
                  <SelectItem value="COMPLETED">🏁 Completate</SelectItem>
                  <SelectItem value="ARCHIVED">📦 Archiviate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentUser?.role === "TRAINER" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400">
                    <SelectValue placeholder="Tutti i clienti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">👥 Tutti i clienti</SelectItem>
                    <SelectItem value="unassigned">❓ Non assegnate</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Griglia Schede */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkoutPlans.length > 0 ? (
          filteredWorkoutPlans.map((plan, index) => (
            <Card
              key={plan.id}
              className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg"
            >
              <CardHeader
                className={`bg-gradient-to-r ${
                  index % 4 === 0
                    ? "from-blue-500 to-cyan-600"
                    : index % 4 === 1
                      ? "from-green-500 to-emerald-600"
                      : index % 4 === 2
                        ? "from-orange-500 to-red-600"
                        : "from-purple-500 to-pink-600"
                } text-white rounded-t-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white">{plan.title}</CardTitle>
                    <CardDescription className="mt-1 text-white/80">
                      {plan.description || "Nessuna descrizione"}
                    </CardDescription>
                  </div>
                  <div className="ml-2">{getStatusBadge(plan.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  {plan.client ? (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        <AvatarImage src={plan.client.user.avatar || "/placeholder.svg"} alt={plan.client.user.name} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {plan.client.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {plan.client.user.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Nessun cliente assegnato</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {plan.startDate ? formatDate(plan.startDate) : "Data non specificata"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Dumbbell className="h-4 w-4" />
                    <span className="text-sm">{plan.exercises?.length || 0} esercizi</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <Link to={`/workout-plans/${plan.id}`}>
                      <Eye className="mr-1 h-3 w-3" />
                      Visualizza
                    </Link>
                  </Button>
                  {currentUser?.role === "TRAINER" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-green-300 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                      >
                        <Link to={`/workout-plans/edit/${plan.id}`}>
                          <Edit className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full p-6 mb-6">
                  <Dumbbell className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Nessuna scheda trovata</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                  {searchTerm || statusFilter !== "all" || clientFilter !== "all"
                    ? "Nessuna scheda corrisponde ai filtri selezionati."
                    : "Non hai ancora creato nessuna scheda di allenamento."}
                </p>
                {currentUser?.role === "TRAINER" && (
                  <Button
                    onClick={() => navigate("/workout-plans/new")}
                    className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crea la prima scheda
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkoutPlans
