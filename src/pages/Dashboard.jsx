"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { clientsApi, workoutPlansApi, messagesApi } from "../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Dumbbell,
  Calendar,
  TrendingUp,
  Activity,
  Target,
  Award,
  Clock,
} from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";

const Dashboard = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const formatTimeAgo = (date) => {
    const diff = (new Date() - new Date(date)) / 1000;
    if (diff < 60) return `${Math.floor(diff)} sec fa`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ore fa`;
    return new Date(date).toLocaleDateString();
  };

  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeWorkoutPlans: 0,
    upcomingWorkouts: 0,
    clientProgress: [],
  });

  useEffect(() => {
    const isWithinNext7Days = (dateString) => {
      if (!dateString) return false;
      const today = new Date();
      const date = new Date(dateString);
      const diffTime = date.getTime() - today.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    };

    const fetchDashboardData = async () => {
      try {
        if (!currentUser) {
          setLoading(false);
          return;
        }

        if (currentUser.role === "TRAINER") {
          const [clientsResponse, workoutPlansResponse, messagesResponse] =
            await Promise.all([
              clientsApi.getAll(),
              workoutPlansApi.getAll(),
              messagesApi.getConversations(),
            ]);
          console.log("Workout Plans ricevuti:", workoutPlansResponse.data);
          console.log("currentUser:", currentUser);

          const clients = clientsResponse.data || [];
          const workoutPlans = workoutPlansResponse.data || [];
          const messages = messagesResponse.data || [];

          const totalClients = clients.length;
          const activeWorkoutPlans = workoutPlans.filter(
            (plan) => plan.status === "ACTIVE"
          ).length;
          const upcomingWorkouts = workoutPlans.filter((plan) =>
            isWithinNext7Days(plan.startDate)
          ).length;

          setStats({
            totalClients,
            activeWorkoutPlans,
            upcomingWorkouts,
            clientProgress: [],
          });

          // 🔽 Qui costruiamo le attività reali
          const recentClients = clients.map((client) => ({
            id: `client-${client.id}`,
            type: "client",
            text: `Hai aggiunto ${client.user?.name || "un cliente"}`,
            createdAt: client.createdAt,
          }));

          const recentWorkouts = workoutPlans.map((plan) => ({
            id: `workout-${plan.id}`,
            type: "workout",
            text: `Scheda creata: ${plan.title}`,
            createdAt: plan.createdAt,
          }));

          const recentMessages = messages.map((conv, index) => ({
            id: `message-${conv.id ?? `fallback-${index}`}`,
            type: "message",
            text: `Messaggio da ${conv.user?.name || "cliente"}`,
            createdAt: conv.lastMessage?.createdAt || conv.updatedAt,
          }));

          const allActivities = [
            ...recentClients,
            ...recentWorkouts,
            ...recentMessages,
          ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setRecentActivities(allActivities.slice(0, 5));
        } else if (currentUser.role === "CLIENT") {
          // Recupero i piani di allenamento
          const response = await workoutPlansApi.getAll();
          const plans = response.data || [];

          // 🔍 Filtro solo le schede assegnate al cliente attuale
          const clientPlans = plans.filter(
            (plan) => plan.client?.user?.id === currentUser.id
          );

          const activeWorkoutPlans = clientPlans.filter(
            (plan) => plan.status === "ACTIVE"
          ).length;

          const upcomingWorkouts = clientPlans.filter((plan) =>
            isWithinNext7Days(plan.startDate)
          ).length;

          setStats({
            totalClients: 0,
            activeWorkoutPlans,
            upcomingWorkouts,
            clientProgress: [], // da riempire con dati reali
          });

          const recentWorkouts = clientPlans.map((plan) => ({
            id: `workout-${plan.id}`,
            type: "workout",
            text: `Hai ricevuto una nuova scheda: ${plan.title}`,
            createdAt: plan.createdAt,
          }));

          setRecentActivities(recentWorkouts.slice(0, 5));
        }
      } catch (error) {
        console.error(
          "Errore nel caricamento dei dati della dashboard:",
          error
        );
        setStats({
          totalClients: 0,
          activeWorkoutPlans: 0,
          upcomingWorkouts: 0,
          clientProgress: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">
          Benvenuto, {currentUser?.name}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          {currentUser?.role === "TRAINER"
            ? "Gestisci i tuoi clienti e monitora i loro progressi"
            : "Monitora i tuoi allenamenti e raggiungi i tuoi obiettivi"}
        </p>
      </div>

      {/* Cards statistiche con colori vivaci */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {currentUser?.role === "TRAINER" ? (
          <>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-100">
                  Clienti Totali
                </CardTitle>
                <Users className="h-6 w-6 text-emerald-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-emerald-200">+2 nell'ultimo mese</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">
                  Schede Attive
                </CardTitle>
                <Dumbbell className="h-6 w-6 text-blue-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.activeWorkoutPlans}
                </div>
                <p className="text-xs text-blue-200">Per tutti i clienti</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-100">
                  Prossimi Allenamenti
                </CardTitle>
                <Calendar className="h-6 w-6 text-orange-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.upcomingWorkouts}
                </div>
                <p className="text-xs text-orange-200">Nei prossimi 7 giorni</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">
                  Progressi
                </CardTitle>
                <TrendingUp className="h-6 w-6 text-purple-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">+12%</div>
                <p className="text-xs text-purple-200">
                  Rispetto al mese scorso
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-100">
                  Le Mie Schede
                </CardTitle>
                <Target className="h-6 w-6 text-cyan-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.activeWorkoutPlans}
                </div>
                <p className="text-xs text-cyan-200">Schede in corso</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-100">
                  Prossimi Allenamenti
                </CardTitle>
                <Clock className="h-6 w-6 text-indigo-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.upcomingWorkouts}
                </div>
                <p className="text-xs text-indigo-200">Nei prossimi 7 giorni</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">
                  Allenamenti Completati
                </CardTitle>
                <Award className="h-6 w-6 text-green-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">15</div>
                <p className="text-xs text-green-200">Questo mese</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-pink-100">
                  Progressi
                </CardTitle>
                <Activity className="h-6 w-6 text-pink-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">+8%</div>
                <p className="text-xs text-pink-200">Rispetto al mese scorso</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs con stile migliorato */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <Tabs defaultValue="overview" className="space-y-6 p-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              📊 Panoramica
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              📈 Analisi
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              📋 Rapporti
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-0">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  🚀 Attività Recenti
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Le tue attività più recenti sulla piattaforma.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nessuna attività recente
                    </p>
                  ) : (
                    recentActivities
                    .filter((a) => a.id)
                    .map((activity) => (
                      <div
                        key={`activity-${activity.id}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "message"
                              ? "bg-green-500"
                              : activity.type === "workout"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                          }`}
                        ></div>
                        <p className="text-sm text-gray-700">{activity.text}</p>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  📊 Analisi dei Progressi
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Visualizza i progressi nel tempo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">
                      Obiettivi raggiunti
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">12h</div>
                    <div className="text-sm text-gray-600">
                      Ore di allenamento
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">
                      4.8
                    </div>
                    <div className="text-sm text-gray-600">
                      Valutazione media
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-0">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  📋 Rapporti
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Visualizza e scarica i rapporti.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div>
                      <div className="font-medium text-gray-800">
                        Rapporto Mensile
                      </div>
                      <div className="text-sm text-gray-600">Gennaio 2024</div>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Scarica
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div>
                      <div className="font-medium text-gray-800">
                        Progressi Clienti
                      </div>
                      <div className="text-sm text-gray-600">
                        Ultimo trimestre
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Scarica
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Dashboard;
