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
        throw error;
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
        await fetchUserProfile(data.session.access_token);
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(error?.message || "Error al iniciar sesión");
    }
  }

  async function signUp(email: string, password: string, name: string, role: "buyer" | "organizer") {
    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear cuenta");
      }

      // Auto sign in after signup
      await signIn(email, password);
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  async function signOut() {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setAccessToken(null);
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
