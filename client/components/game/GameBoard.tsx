"use client";

import { useGameEngine } from "@/hooks/useGameEngine";
import {
  AlertTriangle,
  MousePointerClick,
  RotateCcw,
  Timer,
  Trophy,
} from "lucide-react";

export function GameBoard() {
  const {
    gameState,
    clicks,
    timeLeft,
    result,
    startGame,
    registerClick,
    resetGame,
    isError,
  } = useGameEngine();

  // Prevent text selection while furiously clicking
  const preventSelection = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
      {(gameState === "idle" || gameState === "starting") && (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-white text-3xl font-bold mb-4">
              Ready to test your speed?
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              You have exactly 60 seconds to click as many times as possible.
            </p>
            {isError && (
              <div className="mb-4 text-red-400 bg-red-500/10 p-3 rounded-lg flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Failed to start session. Please try again.
              </div>
            )}
            <button
              onClick={startGame}
              disabled={gameState === "starting"}
              className="w-full py-4 text-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              {gameState === "starting"
                ? "Initializing Server..."
                : "START GAME"}
            </button>
          </div>
        </div>
      )}

      {(gameState === "playing" || gameState === "submitting") && (
        <div className="w-full space-y-6">
          {/* HUD (Heads Up Display) */}
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3 text-2xl font-mono">
              <Timer
                className={`w-8 h-8 ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-indigo-400"}`}
              />
              <span className={timeLeft <= 10 ? "text-red-500" : "text-white"}>
                00:{timeLeft.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="text-white flex items-center gap-3 text-2xl font-mono font-bold">
              <MousePointerClick className="w-8 h-8 text-emerald-400" />
              <span>{clicks}</span>
            </div>
          </div>

          {/* The Clicker Area */}
          <button
            onMouseDown={preventSelection}
            onClick={registerClick}
            disabled={gameState === "submitting"}
            className="w-full aspect-square sm:aspect-video bg-linear-to-br from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-indigo-500 rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] active:bg-slate-800 disabled:opacity-50 disabled:active:scale-100 group shadow-2xl cursor-pointer"
          >
            <div className="text-center pointer-events-none">
              <MousePointerClick className="w-20 h-20 mx-auto text-slate-600 group-active:text-indigo-400 group-hover:scale-110 transition-transform mb-4" />
              <p className="text-2xl font-bold text-slate-500 group-active:text-white">
                {gameState === "submitting" ? "TIME'S UP!" : "CLICK HERE"}
              </p>
            </div>
          </button>
        </div>
      )}

      {gameState === "finished" && result && (
        <div className="w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center animate-in slide-in-from-bottom-4 duration-500">
          {result.isValid ? (
            <>
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-white text-4xl font-black mb-2">
                {result.score} Clicks
              </h2>

              {result.isNewHighScore && (
                <span className="inline-block bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-3 py-1 rounded-full text-sm font-bold mb-6 animate-pulse">
                  NEW HIGH SCORE!
                </span>
              )}

              <div className="grid grid-cols-1 gap-4 mb-4 text-slate-300">
                <div className="text-xl font-mono bg-slate-950 p-4 rounded-lg">
                  <span className="text-slate-500 mb-1">Your Speed is </span>
                  <span>{result.stats?.cps} CPS (Clicks Per Second)</span>
                </div>
                <div className="hidden bg-slate-950 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <p className="text-xl text-emerald-400">Verified</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-red-400 mb-2">
                Score Rejected
              </h2>
              <p className="text-slate-400 mb-8">{result.reason}</p>
            </>
          )}

          <button
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-2 py-4 font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
