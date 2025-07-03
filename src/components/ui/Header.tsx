"use client";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Calendar,
  NotebookPen,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      href: "/",
    },
    // { label: "Log Tasks", icon: <NotebookPen size={18} />, href: "#" },
    // { label: "Calendar", icon: <Calendar size={18} />, href: "#" },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-700 to-emerald-600 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Logo & Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="text-white hover:text-emerald-200 md:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://f9e9317a.delivery.rocketcdn.me/wp-content/uploads/2023/10/Aster-Health-Academy_Logo-497x190.png"
              alt="Aster Logo"
              width={120}
              height={120}
              className="rounded bg-white p-1"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 text-sm text-white hover:text-teal-200 transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {/* Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="w-10 h-10 rounded-full border-2 border-white bg-emerald-600 text-white hover:ring-2 hover:ring-emerald-300 transition-all flex items-center justify-center text-sm font-semibold transition-all cursor-pointer"
            >
              {getInitials(user?.name || "User")}

            </button>

            {/* AnimatePresence handles enter/exit animation */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-xl border border-gray-100 z-50"
                >
                  <Link
                    href="#"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 rounded-t"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-b"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden bg-white border-t px-4 py-3 shadow-inner space-y-3"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-teal-600"
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700"
          >
            <LogOut size={16} /> Logout
          </button>
        </motion.div>
      )}
    </header>
  );
}
