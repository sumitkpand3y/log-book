"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token || role !== "learner") {
      // router.replace("/login");
    }
  }, [token, role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      <main className="flex-1 mt-16 p-4 md:p-6">{children}</main>
      <Footer />
    </div>
  );
}