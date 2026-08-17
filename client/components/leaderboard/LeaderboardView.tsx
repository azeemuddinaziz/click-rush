"use client";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import { ChevronLeft, ChevronRight, Medal, Trophy } from "lucide-react";
import { useState } from "react";

const TIMEFRAMES = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "global", label: "All-Time" },
];

export function LeaderboardView() {
  const [timeframe, setTimeframe] = useState("global");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, isFetching } = useLeaderboard(
    timeframe,
    page,
    limit,
  );

  // Reset to page 1 when switching tabs
  const handleTabChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    setPage(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-black italic tracking-wide text-white">
            Leaderboard
          </h2>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl w-full max-w-md mx-auto">
          {TIMEFRAMES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                timeframe === tab.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Area */}
      <div className="min-h-100 relative">
        {/* Subtle loading indicator during background refetches */}
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/3 animate-[slide_1s_ease-in-out_infinite]" />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-100 text-slate-500">
            Loading scores...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-100 text-red-400">
            Failed to load leaderboard.
          </div>
        ) : data?.leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-100 text-slate-500">
            <Medal className="w-12 h-12 mb-3 opacity-20" />
            <p>No scores found for this period.</p>
            <p className="text-sm mt-1">Be the first to set a record!</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/30 text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium w-24 text-center">Rank</th>
                <th className="px-6 py-4 font-medium">Player</th>
                <th className="px-6 py-4 font-medium text-right w-32">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data?.leaderboard.map((entry) => (
                <tr
                  key={`${entry.rank}-${entry.userId}`}
                  className="hover:bg-slate-800/20 transition-colors group"
                >
                  <td className="px-6 py-4 text-center font-mono font-bold">
                    {entry.rank === 1 ? (
                      <span className="text-yellow-500 text-xl">1</span>
                    ) : entry.rank === 2 ? (
                      <span className="text-slate-300 text-lg">2</span>
                    ) : entry.rank === 3 ? (
                      <span className="text-amber-600 text-lg">3</span>
                    ) : (
                      <span className="text-slate-500">{entry.rank}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-white transition-colors">
                    {entry.username}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-indigo-400">
                    {entry.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between">
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1 || isLoading}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-sm font-medium text-slate-500">Page {page}</span>

        <button
          onClick={() => setPage((old) => old + 1)}
          // Disable "Next" if the current page returned fewer items than the limit (meaning it's the last page)
          disabled={!data || data.leaderboard.length < limit || isLoading}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
