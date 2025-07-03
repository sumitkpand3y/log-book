"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, role } = useAuth();
  const router = useRouter();
  useAuthGuard(["LEARNER"]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      <main className="flex-1 mt-16 p-4 md:p-6">{children}</main>
      <Footer />
    </div>
  );
}
