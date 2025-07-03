"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react"; // optional icon if you're using lucide

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 text-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 text-red-500 p-3 rounded-full">
            <AlertTriangle size={32} />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4">404</h1>
        <p className="text-lg text-gray-700 mb-6">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          🏠 Go back to Dashboard
        </Link>
      </div>
    </div>
  );
}
