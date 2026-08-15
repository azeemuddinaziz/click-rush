import jwt from "jsonwebtoken";
import { gameRepository } from "../repositories/game.repository.ts";
import {
  GAME_DURATION_SECONDS,
  JWT_SECRET,
  MAX_ALLOWED_SECONDS,
  MAX_HUMAN_CPS,
  MIN_ALLOWED_SECONDS,
} from "../utils/contants.ts";

export interface FinishInput {
  userId?: number;
  sessionId?: string;
  sessionToken?: string;
  clicks: number;
}

class GameService {
  async start(userId?: number) {
    const isGuest = !userId;

    if (isGuest) {
      const sessionToken = jwt.sign(
        { startedAt: Date.now(), isGuest: true },
        JWT_SECRET,
        { expiresIn: "5m" },
      );

      return {
        isGuest: true,
        sessionToken,
        durationSeconds: GAME_DURATION_SECONDS,
      };
    }

    const session = await gameRepository.createSession(userId);

    return {
      isGuest: false,
      sessionId: session.id,
      startedAt: session.startedAt,
      durationSeconds: GAME_DURATION_SECONDS,
    };
  }

  async finish(input: FinishInput) {
    const { userId, sessionId, sessionToken, clicks } = input;
    const isGuest = !userId;

    let startedAt: Date;

    if (isGuest) {
      if (!sessionToken) {
        throw new Error("GUEST_TOKEN_REQUIRED");
      }
      try {
        const decoded = jwt.verify(sessionToken, JWT_SECRET) as {
          startedAt: number;
        };
        startedAt = new Date(decoded.startedAt);
      } catch {
        throw new Error("INVALID_GUEST_TOKEN");
      }
    } else {
      if (!sessionId) {
        throw new Error("SESSION_ID_REQUIRED");
      }
      const session = await gameRepository.findActiveSession(sessionId, userId);
      if (!session) {
        throw new Error("SESSION_NOT_FOUND");
      }
      startedAt = session.startedAt;
    }

    const now = new Date();
    const elapsedTimeInSeconds = (now.getTime() - startedAt.getTime()) / 1000;
    const cps = elapsedTimeInSeconds > 0 ? clicks / elapsedTimeInSeconds : 0;

    const isTimingValid =
      elapsedTimeInSeconds >= MIN_ALLOWED_SECONDS &&
      elapsedTimeInSeconds <= MAX_ALLOWED_SECONDS;
    const isCpsValid = cps <= MAX_HUMAN_CPS;
    const isValid = isTimingValid && isCpsValid;
    const score = isValid ? clicks : 0;

    if (isGuest) {
      return {
        isGuest: true,
        saved: false,
        score,
        isValid,
        reason: !isValid
          ? !isTimingValid
            ? `Invalid duration (${elapsedTimeInSeconds.toFixed(1)}s)`
            : `Excessive CPS (${cps.toFixed(1)})`
          : undefined,
        stats: {
          elapsedSeconds: parseFloat(elapsedTimeInSeconds.toFixed(2)),
          cps: parseFloat(cps.toFixed(2)),
        },
      };
    }

    const { isNewHighScore } = await gameRepository.completeGame({
      sessionId: sessionId!,
      userId,
      clicks,
      score,
      cps: parseFloat(cps.toFixed(2)),
      isValid,
    });

    return {
      isGuest: false,
      saved: true,
      score,
      isValid,
      isNewHighScore,
      reason: !isValid
        ? !isTimingValid
          ? `Invalid duration (${elapsedTimeInSeconds.toFixed(1)}s)`
          : `Excessive CPS (${cps.toFixed(1)})`
        : undefined,
      stats: {
        elapsedSeconds: parseFloat(elapsedTimeInSeconds.toFixed(2)),
        cps: parseFloat(cps.toFixed(2)),
      },
    };
  }

  async getLeaderboard(
    timeframe: string = "global",
    page: number = 1,
    limit: number = 50,
  ) {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(100, Math.max(1, limit));
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    if (timeframe === "global") {
      const users = await gameRepository.getGlobalLeaderboard(
        sanitizedLimit,
        skip,
      );

      const leaderboard = users.map((user, index) => ({
        rank: skip + index + 1,
        userId: user.id,
        username: user.username,
        score: user.highScore,
      }));

      return {
        timeframe,
        page: sanitizedPage,
        limit: sanitizedLimit,
        leaderboard,
      };
    }

    const now = new Date();
    let dateFilter: Date;

    if (timeframe === "daily") {
      dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === "weekly") {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      throw new Error("INVALID_TIMEFRAME");
    }

    const aggregatedScores = await gameRepository.getPeriodLeaderboard(
      dateFilter,
      sanitizedLimit,
      skip,
    );

    const userIds = aggregatedScores.map((entry) => entry.userId);
    const users = await gameRepository.getUsersByIds(userIds);
    const userMap = new Map(users.map((u) => [u.id, u.username]));

    const leaderboard = aggregatedScores.map((entry, index) => ({
      rank: skip + index + 1,
      userId: entry.userId,
      username: userMap.get(entry.userId) || "Unknown User",
      score: entry._max.score ?? 0,
    }));

    return {
      timeframe,
      page: sanitizedPage,
      limit: sanitizedLimit,
      leaderboard,
    };
  }
}

export const gameService = new GameService();
