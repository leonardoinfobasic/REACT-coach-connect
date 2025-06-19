import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function Profile() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Errore nel recupero profilo")
        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchProfile()
  }, [token])

  if (!user) return <p className="p-6">⏳ Caricamento profilo...</p>

  const isTrainer = user.role === "TRAINER"
  const isClient = user.role === "CLIENT"

  // Controllo avatar: se manca http, aggiungilo
  const avatarUrl = user.avatar?.startsWith("http")
    ? user.avatar
    : user.avatar
    ? `http://localhost:3000/${user.avatar.replace(/^\/?/, "")}`
    : null

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="shadow-lg p-6 relative md:grid md:grid-cols-3 gap-8">
        {/* Bottone Modifica in alto a destra */}
        <Button
          onClick={() => navigate("/settings")}
          className="absolute top-4 right-4"
          variant="outline"
        >
          ✏️ Modifica
        </Button>

        {/* Colonna sinistra */}
        <div className="flex flex-col items-center text-center md:col-span-1">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-semibold">{user.name}</CardTitle>
          <p className="text-muted-foreground">{user.email}</p>
          <Badge variant="secondary" className="uppercase mt-2">{user.role}</Badge>
        </div>

        <Separator className="my-6 md:hidden" />

        {/* Colonna destra */}
        <div className="md:col-span-2 space-y-6">
          {isClient && (
            <>
              <div>
                <h4 className="text-lg font-semibold mb-2">🧑‍🏫 Personal Trainer</h4>
                <p>{user.clientProfile?.trainer?.name || "Nessun trainer assegnato"}</p>
              </div>

              {user.clientProfile?.workoutPlans?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">💪 Allenamenti assegnati</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {user.clientProfile.workoutPlans.map((plan) => (
                      <li key={plan.id}>{plan.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {isTrainer && (
            <>
              <div>
                <h4 className="text-lg font-semibold mb-2">👥 Clienti seguiti</h4>
                {user.trainedClients?.length > 0 ? (
                  <ul className="list-disc list-inside text-muted-foreground">
                    {user.trainedClients.map((client) => (
                      <li key={client.id}>{client.user?.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Nessun cliente al momento</p>
                )}
              </div>

              {user.createdWorkoutPlans?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">📋 Schede create</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {user.createdWorkoutPlans.map((plan) => (
                      <li key={plan.id}>{plan.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
