"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  token: string | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
    }
  }, []);

  const login = (token: string, role: string) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  setToken(token);
  setRole(role);
  router.replace(`/${role.toLowerCase()}/dashboard`);
};


  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
