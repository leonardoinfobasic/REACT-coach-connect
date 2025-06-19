import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ArrowBigLeft, ArrowLeft, Mail } from "lucide-react";
import { authApi } from "../services/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await authApi.resetPasswordByEmail(email, newPassword);
      setMessage("Password aggiornata con successo!");
      setEmail("");
      setNewPassword("");
      setTimeout(() => {
        navigate("/login"); // ✅ Reindirizzamento automatico
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Errore durante il reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/password-dimenticata.png')" }}
    >
      <Card className="w-full max-w-md p-6 shadow-xl backdrop:blur-lg bg-white/80 dark:bg-gray-800/80">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg space-y-2 mb-8">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🏋️</span>
          </div>
          <CardTitle className="text-3xl font-bold">CoachConnect</CardTitle>

          <div
            className="flex items-center justify-center gap-2 text-sm text-blue-100 hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna al Login</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Nuova Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-200 hover:shadow-xl">
              {loading ? "Aggiornamento in corso..." : "Aggiorna Password"}
            </Button>
            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
