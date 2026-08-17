"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { Home, LogOut, MousePointerClick, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Read the token from our Zustand store to check auth status
  const { user } = useAuth();
  const setToken = useAuthStore((s) => s.setToken);

  const handleLogout = () => {
    // 1. Clear Zustand token
    setToken(null);

    // 2. Clear TanStack Query cache (removes user data)
    queryClient.clear();

    // 3. Redirect to home or login
    router.push("/login");
  };

  // Helper function to highlight the active link
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & App Name */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <MousePointerClick className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
              ClickRush
            </span>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-indigo-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/leaderboard"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive("/leaderboard")
                  ? "text-indigo-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
          </div>

          {/* Right Side Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              // Authenticated View
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              // Guest View
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300  hover:bg-accent rounded-sm hover:text-indigo-600 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
