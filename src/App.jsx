import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { NotificationProvider } from "./contexts/NotificationContext" // ✅ METTILO QUI
import Layout from "./layouts/Layout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ClientsList from "./pages/ClientsList"
import ClientDetail from "./pages/ClientDetail"
import CreateClient from "./pages/CreateClient"
import LinkClient from "./pages/LinkClient"
import EditClient from "./pages/EditClient"
import WorkoutPlans from "./pages/WorkoutPlans"
import CreateWorkoutPlan from "./pages/CreateWorkoutPlan"
import WorkoutPlanDetail from "./pages/WorkoutPlanDetail"
import EditWorkoutPlan from "./pages/EditWorkoutPlan"
import Messages from "./pages/Messages"
import Settings from "./pages/Settings"
import Notifications from "./pages/Notifications"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import ClientWorkoutPlans from "./pages/ClientWorkoutPlan"
import Profile from "./pages/Profile"
import ForgotPassword from "./pages/ForgotPassword"

function App() {
  return (
    <AuthProvider>
      <NotificationProvider> {/* ✅ SPOSATO QUI */}
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Area protetta */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<ClientsList />} />
                <Route path="/clients/new" element={<CreateClient />} />
                <Route path="/clients/link" element={<LinkClient />} />
                <Route path="/clients/edit/:id" element={<EditClient />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
                <Route path="/workout-plans" element={<WorkoutPlans />} />
                <Route path="/workout-plans/new" element={<CreateWorkoutPlan />} />
                <Route path="/workout-plans/create" element={<CreateWorkoutPlan />} />
                <Route path="/workout-plans/edit/:id" element={<EditWorkoutPlan />} />
                <Route path="/workout-plans/:id" element={<WorkoutPlanDetail />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/client/workout-plan" element={<ClientWorkoutPlans />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Pagina 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
