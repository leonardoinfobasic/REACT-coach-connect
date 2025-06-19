import axios from "axios";
import { toast } from "@/components/ui/use-toast";

// Crea un'istanza di axios con la base URL dell'API
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor per aggiungere il token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor per errori globali
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Si è verificato un errore";

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    toast({
      title: "Errore",
      description: message,
      variant: "destructive",
    });

    return Promise.reject(error);
  }
);

// ============ API SERVICES ============

// Utenti
export const usersApi = {
  getById: (id) => api.get(`/users/${id}`),
  search: (query) => api.get(`/users/search?query=${query}`),
  updateProfile: (data) => api.put("/users/me", data),
  getCurrent: () => api.get("/users/me"),
};

// Clienti
export const clientsApi = {
  getAll: () => api.get("/clients"),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post("/clients", data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  search: (query) => api.get(`/clients/search?query=${query}`),
};

// Piani di allenamento
export const workoutPlansApi = {
  getAll: () => api.get("/workout-plans"),
  getById: (id) => api.get(`/workout-plans/${id}`),
  getByClientId: (clientId) => api.get(`/workout-plans/client/${clientId}`),
  create: (data) => api.post("/workout-plans", data),
  update: (id, data) => api.put(`/workout-plans/${id}`, data),
  delete: (id) => api.delete(`/workout-plans/${id}`),
  getClientPlan: () => api.get("/workout-plans/client/me"),
};

// Messaggi
export const messagesApi = {
  getConversations: () => api.get(`/messages/conversations`),
  getConversation: (userId) => api.get(`/messages/conversations/${userId}`),
  sendMessage: (data) => api.post("/messages", data),
  markAsRead: (userId) => api.post(`/messages/messages/${userId}/read`),
};

// Notifiche
export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete("/notifications"),
};

// Autenticazione
export const authApi = {
  forgotPassword: (email, newPassword) =>
    api.post("/auth/forgot-password", { email, newPassword }),

  resetPasswordByEmail: (email, newPassword) =>
    api.post("/auth/reset-password", { email, newPassword }),
};

// ============ EXPORT GLOBALE ============

export default {
  api,
  users: usersApi,
  clients: clientsApi,
  workoutPlans: workoutPlansApi,
  messages: messagesApi,
  notifications: notificationsApi,
  auth: authApi,
};
