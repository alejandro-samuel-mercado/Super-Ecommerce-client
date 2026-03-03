"use client";

import { authService } from "@/services/auth";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { User } from "@/types";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
          setAccessToken(storedToken);

          const { user: userData } = await authService.me();
          setUser(userData);
          useFavoritesStore.getState().syncFavorites();
          useCartStore.getState().syncWithBackend();
        } else {
          setUser(null);
          setAccessToken(null);
          useFavoritesStore.getState().clearFavorites();
          useCartStore.getState().clearCart(false);
        }
      } catch (error: any) {
        // Solo desloguear si es un error 401 explícito.
        // Si el servidor está caído (500, 503, Network Error), MANTENER el token para reintento.
        if (error?.status === 401) {
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem("accessToken");
          if (typeof window !== "undefined") {
            useFavoritesStore.getState().clearFavorites();
          }
        } else {
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_API_URL,
        "http://localhost:8000",
        typeof window !== "undefined" ? window.location.origin : "",
      ].filter(Boolean);

      if (!allowedOrigins.includes(event.origin)) {
        if (
          event.origin.includes("localhost") ||
          event.origin.includes("127.0.0.1")
        ) {
          console.warn(
            "[Auth] Ignoring message from untrusted local origin:",
            event.origin,
          );
        }
        return;
      }

      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        const { user: userData, accessToken: token, refreshToken } = event.data;
        setAuth(userData, token, refreshToken);
        useFavoritesStore.getState().syncFavorites();
        useCartStore.getState().syncWithBackend();

      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const refreshUser = async () => {
    try {
      const { user: userData } = await authService.me();
      setUser(userData);
    } catch (error) {}
  };

  const login = async (email: string, password: string) => {
    const {
      user: userData,
      accessToken: token,
      refreshToken,
    } = await authService.login({ email, password });
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    useFavoritesStore.getState().syncFavorites();
    await useCartStore.getState().syncWithBackend();
  };

  const loginWithGoogle = async () => {
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
      "Google Login",
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  const register = async (data: any) => {
    const {
      user: userData,
      accessToken: token,
      refreshToken,
    } = await authService.register(data);
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    useFavoritesStore.getState().syncFavorites();
    await useCartStore.getState().syncWithBackend();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    useFavoritesStore.getState().clearFavorites();
    useCartStore.getState().clearCart(false);
  };

  const setAuth = (userData: User, token: string, refreshToken?: string) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        setAuth,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
