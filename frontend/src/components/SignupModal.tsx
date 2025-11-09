import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Mail, Lock, User as UserIcon, Loader2, Briefcase, ShoppingBag, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner@2.0.3";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupModal({ open, onClose, onSwitchToLogin }: SignupModalProps) {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "organizer">("buyer");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      setPasswordError(validatePassword(value));
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      toast.error(pwdError);
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name, role);
      toast.success(t("message.accountCreated"));
      setName("");
      setEmail("");
      setPassword("");
      setRole("buyer");
      setPasswordError("");
      onClose();
    } catch (error: any) {
      toast.error(error?.message || t("message.loginRequired"));
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("auth.signup")}</DialogTitle>
          <DialogDescription>
            {t("auth.signupSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="signup-name">{t("auth.fullName")}</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="signup-name"
                type="text"
                placeholder="Juan Pérez"
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="signup-email">{t("auth.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="signup-email"
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
            <Label htmlFor="signup-password">{t("auth.password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                className={`pl-10 ${passwordError ? "border-red-500" : ""}`}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {passwordError && (
              <div className="flex items-start gap-1 mt-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">{t("auth.passwordRules")}</p>
          </div>

          <div>
            <Label>{t("auth.accountType")}</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "buyer" | "organizer")} className="mt-2">
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="buyer" id="buyer" />
                <Label htmlFor="buyer" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    <span>{t("auth.buyer")}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t("auth.buyerDesc")}
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="organizer" id="organizer" />
                <Label htmlFor="organizer" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    <span>{t("auth.organizer")}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t("auth.organizerDesc")}
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !!passwordError}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("auth.creatingAccount")}
              </>
            ) : (
              t("auth.signup")
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t("auth.hasAccount")} </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
              className="text-blue-600 hover:underline"
              disabled={loading}
            >
              {t("auth.loginHere")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
