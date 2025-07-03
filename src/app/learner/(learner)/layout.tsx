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

// import { ReactNode } from 'react';
// // import Sidebar from '@/components/Sidebar';

// interface LayoutProps {
//   children: ReactNode;
//   params: { listener: string };
// }

// export default function ListenerLayout({ children, params }: LayoutProps) {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
//       <div className="flex">
//         <Sidebar listenerId={params.listener} />
//         <main className="flex-1 ml-64">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }