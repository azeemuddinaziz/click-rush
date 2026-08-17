import { api } from "@/lib/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
}

export interface LeaderboardResponse {
  timeframe: string;
  page: number;
  limit: number;
  leaderboard: LeaderboardEntry[];
}

export function useLeaderboard(
  timeframe: string,
  page: number,
  limit: number = 10,
) {
  return useQuery({
    queryKey: ["leaderboard", timeframe, page, limit],
    queryFn: async (): Promise<LeaderboardResponse> => {
      const { data } = await api.get(`/game/leaderboard`, {
        params: { timeframe, page, limit },
      });
      return data;
    },
    placeholderData: keepPreviousData, // Keeps old data visible while fetching new data
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes to prevent spamming your DB
  });
}
