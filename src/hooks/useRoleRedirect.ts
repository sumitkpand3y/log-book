// hooks/useRoleRedirect.ts
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function useRoleRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "learner") router.push("/dashboard");
    else if (user?.role === "teacher") router.push("/(teacher)/dashboard");
    else if (user?.role === "admin") router.push("/(admin)/dashboard");
  }, [user]);
}
