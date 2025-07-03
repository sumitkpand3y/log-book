// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { QueryProvider } from "@/components/auth/QueryProvider"; // 👈 import your new client component

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
