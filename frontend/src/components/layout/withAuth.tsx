"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/contexts/auth.store";
import Cookies from "js-cookie";

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthGuard(props: P) {
    const router = useRouter();
    const { isAuthenticated, logout } = useAuthStore();

    useEffect(() => {
      const token = Cookies.get("accessToken");
      if (!token && isAuthenticated) {
        logout();
        router.replace("/");
        return;
      }
      if (!isAuthenticated) router.replace("/");
    }, [isAuthenticated, logout, router]);

    if (!isAuthenticated) return null;
    return <Component {...props} />;
  };
}
