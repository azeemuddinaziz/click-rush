import { Router, type Response } from "express";
import {
  requireAuth,
  type AuthRequest,
} from "../middlewares/auth.middleware.ts";
import { userRepository } from "../repositories/user.repository.ts";

const router = Router();

router
  .route("/me")
  .get(requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const payload = req.user as { userId: string | number; email: string };
      const user = await userRepository.findByEmail(payload.email);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("Error in /me route:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

export default router;
