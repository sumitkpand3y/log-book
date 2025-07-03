"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserType = {
  id: string;
  name: string;
  email: string;
  // Add any other fields your API gives
};

type AuthContextType = {
  token: string | null;
  role: string | null;
  user: UserType | null;
  login: (token: string, role: string, user: UserType) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const login = (token: string, role: string, user: UserType) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setRole(role);
    setUser(user);
    router.replace(`/${role.toLowerCase()}/dashboard`);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
