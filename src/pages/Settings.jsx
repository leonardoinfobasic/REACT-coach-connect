"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Loader2,
  Camera,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usersApi } from "../services/api";

import { api } from "../services/api";
import { useTheme } from "@/components/theme-provider";

const Settings = () => {
  const { currentUser, logout, refreshUserProfile } = useAuth();
  console.log("🔍 currentUser:", currentUser);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || "");

  const { setTheme, theme } = useTheme();

  const [profile, setProfile] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    bio: currentUser?.bio || "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (currentUser) {
      console.log("currentUser:", currentUser);
      setProfile({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith("http")
        ? currentUser.avatar
        : `${import.meta.env.VITE_API_URL.replace("/api", "")}/${currentUser.avatar.replace(/^\/+/, "")}`;

      setAvatarPreview(avatarUrl);
    }
  }, [currentUser]);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Errore",
        description: "Le nuove password non coincidono",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Errore nel cambio password");
      }

      toast({ title: "Successo", description: data.message });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserProfile = async (updatedData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(
        err.message || "Errore durante l'aggiornamento del profilo"
      );
    }

    return res.json();
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await usersApi.updateProfile(profile);

      toast({
        title: "✅ Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo.",
      });
    } catch (error) {
      console.error("❌ Errore salvataggio profilo:", error);
      toast({
        title: "❌ Errore",
        description:
          error.message || "Impossibile salvare le modifiche. Riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result); // mostra anteprima locale
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload fallito");

      await refreshUserProfile(); // 🔁 ricarica utente aggiornato
      console.log("👤 currentUser dopo refresh:", currentUser);

      toast({
        title: "✅ Foto aggiornata",
        description:
          "La tua immagine del profilo è stata aggiornata con successo.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "❌ Errore",
        description: "Impossibile caricare la foto. Riprova.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast({
        title: "🔔 Preferenze salvate",
        description: "Le tue preferenze di notifica sono state aggiornate.",
      });
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile salvare le preferenze. Riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "❌ Errore",
        description: "Le password non coincidono.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: "❌ Errore",
        description: "La password deve essere di almeno 6 caratteri.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "🔒 Password cambiata",
        description: "La tua password è stata aggiornata con successo.",
      });
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile cambiare la password.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen">
      {/* Header colorato */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          ⚙️ Impostazioni
        </h1>
        <p className="text-indigo-100 text-lg">
          Gestisci le tue preferenze e impostazioni dell'account
        </p>
      </div>

      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <Tabs defaultValue="profile" className="space-y-6 p-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl h-14">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <User className="h-4 w-4" />
              Profilo
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Bell className="h-4 w-4" />
              Notifiche
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Shield className="h-4 w-4" />
              Sicurezza
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Palette className="h-4 w-4" />
              Aspetto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  👤 Informazioni Profilo
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Aggiorna le tue informazioni personali
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <input
                      type="file"
                      id="avatarInput"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={avatarPreview || "/placeholder.svg"}
                        alt={currentUser?.name}
                      />
                      <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getInitials(currentUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatarInput"
                      className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Foto Profilo
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      JPG, GIF o PNG. Massimo 1MB.
                    </p>
                    <label htmlFor="avatarInput">
                      <label
                        htmlFor="avatarInput"
                        className="inline-block mt-2 cursor-pointer border border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Cambia foto
                      </label>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Nome completo
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 font-medium "
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:text-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Telefono
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                    placeholder="+39 123 456 7890"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:text-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 font-medium">
                    Biografia
                  </Label>
                  <textarea
                    id="bio"
                    className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 resize-none"
                    value={profile.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    placeholder="Raccontaci qualcosa di te..."
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salva modifiche
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  🔔 Preferenze Notifiche
                </CardTitle>
                <CardDescription className="text-green-100">
                  Scegli come vuoi ricevere le notifiche
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="space-y-1">
                      <Label className="text-gray-800 font-medium">
                        📧 Notifiche Email
                      </Label>
                      <p className="text-sm text-gray-600">
                        Ricevi notifiche via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(value) =>
                        handleNotificationChange("email", value)
                      }
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="space-y-1">
                      <Label className="text-gray-800 font-medium">
                        🔔 Notifiche Push
                      </Label>
                      <p className="text-sm text-gray-600">
                        Ricevi notifiche push sul browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(value) =>
                        handleNotificationChange("push", value)
                      }
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="space-y-1">
                      <Label className="text-gray-800 font-medium">
                        📱 Notifiche SMS
                      </Label>
                      <p className="text-sm text-gray-600">
                        Ricevi notifiche via SMS
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(value) =>
                        handleNotificationChange("sms", value)
                      }
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="space-y-1">
                      <Label className="text-gray-800 font-medium">
                        📬 Email Marketing
                      </Label>
                      <p className="text-sm text-gray-600">
                        Ricevi email promozionali e aggiornamenti
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(value) =>
                        handleNotificationChange("marketing", value)
                      }
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salva preferenze
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  🔒 Sicurezza Account
                </CardTitle>
                <CardDescription className="text-red-100">
                  Gestisci la sicurezza del tuo account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="current-password"
                      className="text-gray-700 font-medium"
                    >
                      Password attuale
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange("currentPassword", e.target.value)
                      }
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500 dark:text-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-password"
                      className="text-gray-700 font-medium"
                    >
                      Nuova password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) =>
                        handlePasswordChange("newPassword", e.target.value)
                      }
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500 dark:text-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-gray-700 font-medium"
                    >
                      Conferma nuova password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange("confirmPassword", e.target.value)
                      }
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500 dark:text-zinc-700"
                    />
                  </div>
                </div>

                <Button
                  onClick={submitPasswordChange}
                  disabled={passwordLoading}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Cambia password
                    </>
                  )}
                </Button>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800">
                    🔐 Autenticazione a due fattori
                  </h4>
                  <p className="text-sm text-gray-600">
                    Aggiungi un ulteriore livello di sicurezza al tuo account
                  </p>
                  <Button
                    variant="outline"
                    disabled
                    className="border-gray-300 text-gray-500"
                  >
                    Configura 2FA (Prossimamente)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  🎨 Aspetto
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Personalizza l'aspetto dell'applicazione
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800">🌈 Tema</h4>
                  <p className="text-sm text-gray-600">
                    Seleziona il tema dell'interfaccia
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* ☀️ Chiaro */}
                    <div className="space-y-3">
                      <div
                        onClick={() => setTheme("light")}
                        className={`rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          theme === "light"
                            ? "border-blue-400 shadow-lg"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="space-y-2 rounded-lg bg-gray-100 p-3">
                          <div className="space-y-2 rounded-md bg-white p-3 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-gray-200" />
                            <div className="h-2 w-[100px] rounded-lg bg-gray-200" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white p-3 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-gray-200" />
                            <div className="h-2 w-[100px] rounded-lg bg-gray-200" />
                          </div>
                        </div>
                      </div>
                      <span
                        className={`block w-full p-2 text-center font-medium ${
                          theme === "light" ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        ☀️ Chiaro {theme === "light" && "(Attuale)"}
                      </span>
                    </div>

                    {/* 🌙 Scuro */}
                    <div className="space-y-3">
                      <div
                        onClick={() => setTheme("dark")}
                        className={`rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          theme === "dark"
                            ? "border-blue-400 shadow-lg"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="space-y-2 rounded-lg bg-slate-900 p-3">
                          <div className="space-y-2 rounded-md bg-slate-800 p-3 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-slate-600" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-600" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-3 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-600" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-600" />
                          </div>
                        </div>
                      </div>
                      <span
                        className={`block w-full p-2 text-center font-medium ${
                          theme === "dark" ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        🌙 Scuro {theme === "dark" && "(Attuale)"}
                      </span>
                    </div>

                    {/* 🎨 Sistema */}
                    <div className="space-y-3">
                      <div
                        onClick={() => setTheme("system")}
                        className={`rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          theme === "system"
                            ? "border-blue-400 shadow-lg"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="space-y-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 p-3">
                          <div className="space-y-2 rounded-md bg-white p-3 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-gradient-to-r from-blue-400 to-purple-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-blue-400 to-purple-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white p-3 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-blue-400 to-purple-400" />
                          </div>
                        </div>
                      </div>
                      <span
                        className={`block w-full p-2 text-center font-medium ${
                          theme === "system" ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        🎨 Sistema {theme === "system" && "(Attuale)"}
                      </span>
                    </div>
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

export default Settings;
