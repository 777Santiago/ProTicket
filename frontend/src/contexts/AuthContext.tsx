import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "../services/auth.service";

interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "organizer" | "admin";
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: "buyer" | "organizer") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      // Verificar si hay un token guardado
      const savedToken = localStorage.getItem("proticket_token");
      const savedUser = localStorage.getItem("proticket_user");
      
      if (savedToken && savedUser) {
        console.log("✅ Sesión existente encontrada");
        setAccessToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Error checking session:", error);
      localStorage.removeItem("proticket_token");
      localStorage.removeItem("proticket_user");
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log("🔐 Iniciando sesión con backend de Auth...");
      
      const response = await authService.login({ email, password });
      
      console.log("✅ Login exitoso:", response);
      
      const userData: User = {
        id: response.userId,
        email: email,
        name: email.split('@')[0], // Usar parte del email como nombre
        role: response.role as "buyer" | "organizer" | "admin",
      };
      
      // Guardar en localStorage
      localStorage.setItem("proticket_token", response.token);
      localStorage.setItem("proticket_user", JSON.stringify(userData));
      
      setAccessToken(response.token);
      setUser(userData);
      
      console.log("✅ Usuario autenticado:", userData);
    } catch (error: any) {
      console.error("❌ Sign in error:", error);
      throw error;
    }
  }

  async function signUp(email: string, password: string, name: string, role: "buyer" | "organizer") {
    try {
      console.log("📝 Registrando usuario con backend de Auth...");
      
      const response = await authService.register({ email, password, role });
      
      console.log("✅ Registro exitoso, iniciando sesión automáticamente...");
      
      // Auto login después del registro
      await signIn(email, password);
      
    } catch (error: any) {
      console.error("❌ Sign up error:", error);
      throw error;
    }
  }

  async function signOut() {
    try {
      console.log("👋 Cerrando sesión...");
      localStorage.removeItem("proticket_token");
      localStorage.removeItem("proticket_user");
      setUser(null);
      setAccessToken(null);
      console.log("✅ Sesión cerrada");
    } catch (error) {
      console.error("Sign out error:", error);
      setUser(null);
      setAccessToken(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}