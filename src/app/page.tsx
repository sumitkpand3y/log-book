"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function HomePage() {
  const { token, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token && role) {
      router.replace(`/${role.toLocaleLowerCase()}/dashboard`);
    } else {
      router.replace("/login");
    }
  }, [token, role]);

  return null;
}
