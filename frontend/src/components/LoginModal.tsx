import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner@2.0.3";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

export function LoginModal({ open, onClose, onSwitchToSignup, onSwitchToForgotPassword }: LoginModalProps) {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success(t("message.welcomeBack"));
      setEmail("");
      setPassword("");
      onClose();
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Mostrar el mensaje de error específico
      const errorMessage = error?.message || "Error al iniciar sesión";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && !loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("auth.login")}</DialogTitle>
          <DialogDescription>
            {t("auth.loginSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login-email">{t("auth.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="login-email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="login-password">{t("auth.password")}</Label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToForgotPassword();
                }}
                className="text-xs text-blue-600 hover:underline"
                disabled={loading}
              >
                {t("auth.forgotPassword")}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("auth.loggingIn")}
              </>
            ) : (
              t("auth.login")
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t("auth.noAccount")} </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToSignup();
              }}
              className="text-blue-600 hover:underline"
              disabled={loading}
            >
              {t("auth.signupHere")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}