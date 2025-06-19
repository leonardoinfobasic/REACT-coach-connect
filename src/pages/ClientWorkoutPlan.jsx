// Versione "cliente" del componente WorkoutPlans, adattata e coerente

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dumbbell, Calendar, User } from "lucide-react"
import { workoutPlansApi } from "../services/api"
import LoadingScreen from "../components/LoadingScreen"
import { useAuth } from "../contexts/AuthContext"

const ClientWorkoutPlans = () => {
  const { currentUser } = useAuth()
  const [plans, setPlanS] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await workoutPlansApi.getClientPlan()
        setPlanS(response.data)
      } catch (err) {
        setError("Nessun piano di allenamento assegnato.")
      } finally {
        setLoading(false)
      }
    }

    if (currentUser?.role === "CLIENT") {
      fetchPlan()
    }
  }, [currentUser])

  const formatDate = (dateStr) => {
    if (!dateStr) return "Non specificata"
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500 text-white">Attiva</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-500 text-white">Completata</Badge>
      case "ARCHIVED":
        return <Badge className="bg-gray-500 text-white">Archiviata</Badge>
      default:
        return <Badge>Sconosciuto</Badge>
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <div className="bg-gradient-to-r from-orange-500 to-purple-600 dark:from-orange-600 dark:to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold">🏋️ La tua scheda di allenamento</h1>
        <p className="text-orange-100 dark:text-orange-200 mt-2">
          Qui puoi consultare la scheda assegnata dal tuo trainer
        </p>
      </div>

      {error ? (
  <Card className="text-red-800 dark:text-red-200 border-red-300 bg-red-100 dark:bg-red-900/10">
    <CardHeader>
      <CardTitle>⚠️ Nessuna scheda trovata</CardTitle>
    </CardHeader>
    <CardContent>{error}</CardContent>
  </Card>
) : (
  plans.map((plan) => (
    <Card
  key={plan.id}
  className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md"
>
  <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg">
    <CardTitle>{plan.title}</CardTitle>
    <CardDescription>{plan.description}</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4 p-6">
    <div className="flex items-center space-x-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {formatDate(plan.createdAt)}
      </span>
    </div>

    <div className="flex items-center space-x-2">
      <Dumbbell className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {plan.exercises?.length ?? 0} esercizi assegnati
      </span>
    </div>

    <div>{getStatusBadge(plan.status)}</div>

    {/* BOTTONE VISUALIZZA */}
    <div className="pt-4">
      <a
        href={`/workout-plans/${plan.id}`}
        className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        Visualizza dettagli
      </a>
    </div>
  </CardContent>
</Card>
  ))
)}
    </div>
  )
}

export default ClientWorkoutPlans