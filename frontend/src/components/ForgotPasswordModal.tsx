import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { useLanguage } from "../contexts/LanguageContext";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordModal({ open, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/auth/reset-password-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(t("message.resetLinkSent"));
        setEmail("");
        onClose();
      } else {
        toast.error(data.error || "Error al enviar enlace");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error?.message || "Error al procesar solicitud");
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
          <DialogTitle>{t("auth.resetPassword")}</DialogTitle>
          <DialogDescription>
            {t("auth.resetSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reset-email">{t("auth.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="reset-email"
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("auth.sending")}
              </>
            ) : (
              t("auth.sendResetLink")
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onBackToLogin();
              }}
              className="text-sm text-blue-600 hover:underline inline-flex items-center"
              disabled={loading}
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              {t("auth.backToLogin")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
