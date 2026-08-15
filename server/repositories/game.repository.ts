import type { GameSession } from "../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";

export class GameRepository {
  async createSession(userId: number): Promise<GameSession> {
    return prisma.gameSession.create({
      data: { userId },
    });
  }

  async findActiveSession(
    sessionId: string,
    userId: number,
  ): Promise<GameSession | null> {
    return prisma.gameSession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
        isUsed: false,
      },
    });
  }

  async completeGame(data: {
    sessionId: string;
    userId: number;
    clicks: number;
    score: number;
    cps: number;
    isValid: boolean;
  }) {
    const { sessionId, userId, clicks, score, cps, isValid } = data;

    return prisma.$transaction(async (tx) => {
      await tx.gameSession.update({
        where: { id: sessionId },
        data: { isUsed: true, endedAt: new Date() },
      });

      const history = await tx.gameHistory.create({
        data: {
          userId,
          score,
          clicks,
          cps,
          isValid,
        },
      });

      let isNewHighScore = false;
      if (isValid) {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user && score > user.highScore) {
          await tx.user.update({
            where: { id: userId },
            data: { highScore: score },
          });
          isNewHighScore = true;
        }
      }

      return { history, isNewHighScore };
    });
  }

  async getGlobalLeaderboard(limit: number, skip: number) {
    return await prisma.user.findMany({
      orderBy: {
        highScore: "desc",
      },
      skip,
      take: limit,
    });
  }

  async getPeriodLeaderboard(dateFilter: Date, limit: number, skip: number) {
    return await prisma.gameHistory.groupBy({
      by: ["userId"],

      _max: {
        score: true,
      },

      where: {
        isValid: true,
        createdAt: {
          gte: dateFilter,
        },
      },

      orderBy: [
        {
          _max: {
            score: "desc",
          },
        },
        {
          userId: "asc",
        },
      ],

      take: limit,
      skip: skip,
    });
  }

  async getUsersByIds(userIds: number[]) {
    return prisma.user.findMany({
      where: { id: { in: userIds } },
    });
  }
}

export const gameRepository = new GameRepository();
