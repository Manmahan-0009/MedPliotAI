"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "doctor" | "patient";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { userProfile, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Do not redirect while auth state is still resolving
    if (loading) return;

    if (!userProfile) {
      // Not logged in → send to appropriate login page
      if (allowedRole === "doctor") {
        router.replace("/doctor/login");
      } else if (allowedRole === "patient") {
        router.replace("/patient/login");
      } else {
        router.replace("/");
      }
      return;
    }

    // Logged in but wrong role → send to their dashboard
    if (allowedRole && role && role !== allowedRole) {
      router.replace(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    }
  }, [loading, userProfile, role, allowedRole, router]);

  // Show spinner while auth is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Block render if not authenticated or wrong role
  if (!userProfile || (allowedRole && role !== allowedRole)) {
    return null;
  }

  return <>{children}</>;
};
