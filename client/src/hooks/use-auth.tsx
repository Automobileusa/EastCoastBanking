import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  login: (userId: string, password: string) => Promise<{ requiresOTP: boolean }>;
  verifyOTP: (code: string, purpose?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        return response.json();
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", { userId, password });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.requiresOTP) {
        setLocation("/otp");
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        setLocation("/dashboard");
      }
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async ({ code, purpose }: { code: string; purpose: string }) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", { code, purpose });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  const login = async (userId: string, password: string) => {
    const result = await loginMutation.mutateAsync({ userId, password });
    return result;
  };

  const verifyOTP = async (code: string, purpose = "login") => {
    await verifyOTPMutation.mutateAsync({ code, purpose });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const isAuthenticated = !!user;

  // Redirect to login if not authenticated (except for login/otp pages)
  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/otp" && currentPath !== "/") {
        setLocation("/login");
      }
    }
  }, [user, isLoading, setLocation]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        verifyOTP,
        logout,
        isLoading,
        isAuthenticated,
      }}
    >
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
