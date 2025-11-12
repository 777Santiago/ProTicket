import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "organizer";
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
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: { session } = { session: null }, error } = await supabase.auth.getSession();

      if (session?.access_token) {
        await fetchUserProfile(session.access_token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setLoading(false);
    }
  }

  async function fetchUserProfile(token: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Profile fetch failed:", response.status);
        setLoading(false);
        return;
      }

      const profile = await response.json();
      if (profile && profile.id) {
        console.log("✅ Profile loaded:", profile);
        console.log("✅ Access token set:", token.substring(0, 20) + "...");
        setUser(profile);
        setAccessToken(token);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log("🔐 Iniciando sesión...");
      
      // Check if account is locked
      const checkResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/auth/check-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const checkResult = await checkResponse.json();
      
      if (!checkResult.allowed) {
        throw new Error(`Cuenta bloqueada temporalmente. Inténtalo de nuevo en ${checkResult.remainingTime} minutos.`);
      }

      const supabase = createClient();
      if (!supabase) {
        throw new Error("Error de inicialización");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Record failed login attempt
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/auth/failed-login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ email }),
          }
        );
        
        // Lanzar error con mensaje específico
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Credenciales inválidas. Por favor, verifica tu correo y contraseña.");
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Por favor, confirma tu correo electrónico antes de iniciar sesión.");
        } else {
          throw new Error(error.message);
        }
      }

      // Reset login attempts on successful login
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/auth/reset-attempts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (data?.session?.access_token) {
        console.log("✅ Login exitoso, cargando perfil...");
        await fetchUserProfile(data.session.access_token);
        console.log("✅ Perfil cargado, user:", user);
        console.log("✅ Access token disponible:", !!accessToken);
      }
    } catch (error: any) {
      console.error("❌ Sign in error:", error);
      throw error;
    }
  }

  async function signUp(email: string, password: string, name: string, role: "buyer" | "organizer") {
    try {
      console.log("📝 Registrando usuario...");
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name, role }),
        }
      );

      // Leer la respuesta UNA SOLA VEZ
      const responseData = await response.json();

      if (!response.ok) {
        // El servidor ya devolvió un mensaje de error en responseData.error
        throw new Error(responseData.error || "Error al crear cuenta");
      }

      console.log("✅ Usuario registrado, iniciando sesión automáticamente...");

      // Auto sign in after signup - IMPORTANTE: esperar a que termine completamente
      await signIn(email, password);
      
      // Pequeña pausa para asegurar que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("✅ Auto-login completado");
      console.log("✅ User después de signup:", user);
      console.log("✅ Access token después de signup:", !!accessToken);
      
    } catch (error: any) {
      console.error("❌ Sign up error:", error);
      
      // Si el error ya tiene un mensaje específico, usarlo
      if (error.message) {
        throw error;
      } else {
        throw new Error("Error al crear cuenta. Por favor, inténtalo de nuevo.");
      }
    }
  }

  async function signOut() {
    try {
      console.log("👋 Cerrando sesión...");
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setAccessToken(null);
      console.log("✅ Sesión cerrada");
    } catch (error) {
      console.error("Sign out error:", error);
      setUser(null);
      setAccessToken(null);
    }
  }

  // Log cuando cambian el user o accessToken
  useEffect(() => {
    if (user) {
      console.log("📊 Estado actualizado - User:", user.email, "Role:", user.role);
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      console.log("🔑 Estado actualizado - Access Token disponible:", accessToken.substring(0, 20) + "...");
    } else {
      console.log("🔑 Estado actualizado - No hay Access Token");
    }
  }, [accessToken]);

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