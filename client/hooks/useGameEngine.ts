import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

type GameState = "idle" | "starting" | "playing" | "submitting" | "finished";

interface GameResult {
  score: number;
  isNewHighScore?: boolean;
  isValid: boolean;
  reason?: string;
  stats: { elapsedSeconds: number; cps: number };
}

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [sessionInfo, setSessionInfo] = useState<{
    sessionId?: string;
    sessionToken?: string;
  } | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);

  // 1. Mutation to Start Game
  const startMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/game/start");
      return data;
    },
    onSuccess: (data) => {
      setSessionInfo({
        sessionId: data.sessionId,
        sessionToken: data.sessionToken,
      });
      setTimeLeft(data.durationSeconds || 60);
      setClicks(0);
      setResult(null);
      setGameState("playing");
    },
    onError: () => {
      setGameState("idle");
    },
  });

  // 2. Mutation to Finish Game
  const finishMutation = useMutation({
    mutationFn: async (finalClicks: number) => {
      const { data } = await api.post("/game/finish", {
        sessionId: sessionInfo?.sessionId,
        sessionToken: sessionInfo?.sessionToken,
        clicks: finalClicks,
      });
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      setGameState("finished");
    },
    onError: (error: any) => {
      // Handle anti-cheat rejection (422) or other errors
      setResult(
        error.response?.data || { isValid: false, reason: "Server error" },
      );
      setGameState("finished");
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === "playing" && timeLeft === 0) {
      setGameState("submitting");
      finishMutation.mutate(clicks);
    }
  }, [gameState, timeLeft, clicks, finishMutation]);

  // 3. Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [gameState]);

  // 4. Action Handlers
  const startGame = () => {
    setGameState("starting");
    startMutation.mutate();
  };

  const registerClick = useCallback(() => {
    if (gameState === "playing") {
      setClicks((prev) => prev + 1);
    }
  }, [gameState]);

  const resetGame = () => {
    setGameState("idle");
    setClicks(0);
    setTimeLeft(60);
    setResult(null);
  };

  return {
    gameState,
    clicks,
    timeLeft,
    result,
    startGame,
    registerClick,
    resetGame,
    isError: startMutation.isError,
  };
}
