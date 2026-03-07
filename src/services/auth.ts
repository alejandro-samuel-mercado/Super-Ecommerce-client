import { http, setLogoutHandler, setRefreshHandler } from "@/adapters/http";

export const authService = {
  login: async (credentials: any) => {
    const res = await http<any>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    // El backend retorna: { success: true, data: { user, tokens: { accessToken, refreshToken } } }
    const { user, tokens } = res.data;
    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },

  register: async (data: any) => {
    const res = await http<any>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // El backend ahora retorna { success: true, message: '...', data: { user } }
    // Sin tokens si requiere verificación.
    const { user, tokens } = res.data;
    return {
      user,
      accessToken: tokens?.accessToken || null,
      refreshToken: tokens?.refreshToken || null,
      message: res.message
    };
  },

  verifyEmail: async (email: string, code: string) => {
    const res = await http<any>("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    const { user, tokens } = res.data || res;
    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },

  resendVerification: async (email: string) => {
    return await http<any>("/api/auth/resend-verify", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  logout: async () => {
    try {
      await http("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    window.location.href = "/login";
  },

  refresh: async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      const res = await http<any>("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        skipRetry: true,
      });

      // El backend retorna: { success: true, data: { accessToken, refreshToken } }
      const { accessToken, refreshToken: newRefreshToken } = res.data;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }
        return accessToken;
      }
      return null;
    } catch {
      return null;
    }
  },

  me: async () => {
    const res = await http<any>("/api/users/profile");

    return { user: res.data || res };
  },

  forgotPassword: async (email: string) => {
    return await http("/api/auth/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data: any) => {
    return await http("/api/auth/reset", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Inicializar capturadores (handlers)
if (typeof window !== "undefined") {
  setRefreshHandler(authService.refresh);
  setLogoutHandler(() => {
    window.location.href = "/login?expired=true";
  });
}
