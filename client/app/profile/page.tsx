"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  Activity,
  Calendar,
  CheckCircle2,
  History,
  Mail,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading, token } = useAuth();

  useEffect(() => {
    if (!token && !isUserLoading) {
      router.push("/login");
    }
  }, [token, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-slate-400">Loading profile...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-8">
      {/* User Info Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="bg-indigo-600/25 border border-indigo-500/30 w-24 h-24 rounded-full flex items-center justify-center shadow-inner">
          <User className="w-12 h-12 text-indigo-400" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-black text-white mb-1">
            {user.username}
          </h1>
          <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2 text-sm">
            <Mail className="w-4 h-4 text-slate-500" /> {user.email}
          </p>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl text-center min-w-37.5 shadow-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
            High Score
          </p>
          <p className="text-3xl font-black text-yellow-500 flex items-center justify-center gap-1.5">
            <Trophy className="w-6 h-6 text-yellow-500" /> {user.highScore ?? 0}
          </p>
        </div>
      </div>

      {/* Game History Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
          <History className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Recent Game History
          </h2>
        </div>

        {!user.gameHistories || user.gameHistories.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No games played yet. Jump into the arena and set a record!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {user.gameHistories.map((game, index) => (
              <div
                key={game.id}
                className="p-5 gap-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
              >
                <div className="hidden">
                  {game.isValid ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold shadow-sm">
                      <XCircle className="w-3.5 h-3.5" /> Flagged
                    </span>
                  )}
                </div>

                <div className="text-white text-xl">{index + 1}.</div>

                <div className="w-full justify-between flex-row-reverse flex items-center gap-4">
                  <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl font-mono font-bold text-indigo-400 text-xl min-w-22.5 text-center shadow-inner">
                    {game.score}
                    <span className="block text-[10px] text-slate-500 font-normal uppercase tracking-wider">
                      Score
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />{" "}
                        {game.cps} CPS
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">
                        {game.clicks} clicks
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      {new Date(game.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
