import { Router, type Response } from "express";
import {
  optionalAuth,
  type AuthRequest,
} from "../middlewares/auth.middleware.ts";
import { gameService } from "../services/game.service.ts";

const router = Router();

router
  .route("/start")
  .post(optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const result = await gameService.start(userId);

      return res.status(201).json({
        message: result.isGuest
          ? "Guest game session started"
          : "Game session started",
        ...result,
      });
    } catch (error) {
      console.error("Error starting game:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

router
  .route("/finish")
  .post(optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId, sessionToken, clicks } = req.body;

      if (typeof clicks !== "number" || clicks < 0) {
        return res
          .status(400)
          .json({ error: "Non-negative clicks count required" });
      }

      const result = await gameService.finish({
        userId: req.user?.userId,
        sessionId,
        sessionToken,
        clicks,
      });

      if (!result.isValid) {
        return res.status(422).json({
          error: "Submission rejected by anti-cheat rules",
          msg: result.reason,
          ...result,
        });
      }

      return res.status(200).json({
        message: "Score calculated successfully",
        ...result,
      });
    } catch (error: any) {
      if (error.message === "GUEST_TOKEN_REQUIRED") {
        return res
          .status(400)
          .json({ error: "Guest sessionToken is required" });
      }
      if (error.message === "INVALID_GUEST_TOKEN") {
        return res
          .status(400)
          .json({ error: "Invalid or expired guest session token" });
      }
      if (error.message === "SESSION_ID_REQUIRED") {
        return res.status(400).json({ error: "sessionId is required" });
      }
      if (error.message === "SESSION_NOT_FOUND") {
        return res
          .status(400)
          .json({ error: "Invalid, expired, or already completed session" });
      }

      console.error("Error finishing game:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

router.route("/leaderboard").get(async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || "global";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await gameService.getLeaderboard(timeframe, page, limit);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "INVALID_TIMEFRAME") {
      return res
        .status(400)
        .json({ error: "Invalid timeframe. Options: global, daily, weekly" });
    }

    console.error("Leaderboard error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
