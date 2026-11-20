import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Role, Session } from "../types";
import { apiFetch, clearToken, getToken, setToken } from "../lib/api";

export const MIN_PASSWORD = 8;

// Temporary compatibility until the admin staff list is connected to Laravel.
export const getMaintenanceStaff = (): Session[] => [];

type AuthResponse = {
  user: Session;
  token: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
  specialty?: string;
  code?: string;
};

type Ctx = {
  user: Session | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    role: Role,
  ) => Promise<string | null>;
  register: (input: RegisterInput) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const token = getToken();

      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const account = await apiFetch<Session>("/me");

        if (active) {
          setUser(account);
        }
      } catch {
        clearToken();

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login: Ctx["login"] = async (email, password, role) => {
    try {
      const result = await apiFetch<AuthResponse>("/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
        }),
      });

      setToken(result.token);
      setUser(result.user);

      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Unable to sign in. Please try again.";
    }
  };

  const register: Ctx["register"] = async ({
    name,
    email,
    password,
    role,
    specialty,
    code,
  }) => {
    try {
      const result = await apiFetch<AuthResponse>("/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          specialty: role === "maintenance" ? specialty : undefined,
          code: role !== "user" ? code?.trim() : undefined,
        }),
      });

      setToken(result.token);
      setUser(result.user);

      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Unable to create your account. Please try again.";
    }
  };

  const logout: Ctx["logout"] = async () => {
    try {
      if (getToken()) {
        await apiFetch("/logout", {
          method: "POST",
        });
      }
    } catch {
      // Clear the local session even if the server is unavailable.
    } finally {
      clearToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
