import { Router, type Response } from "express";
import { prisma } from "../lib/prisma.ts";
import {
  requireAuth,
  type AuthRequest,
} from "../middlewares/auth.middleware.ts";
import { authService } from "../services/auth.service.ts";

const router = Router();

router.route("/signup").post(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newUser = await authService.registerUser(username, email, password);

    return res.status(201).json({
      message: "User registered successfully!",
      user: newUser,
    });
  } catch (error: any) {
    if (error.message === "EMAIL_TAKEN")
      return res.status(400).json({ error: "Email taken" });

    if (error.message === "USERNAME_TAKEN")
      return res.status(400).json({ error: "Username taken" });

    console.error("Signup error: ", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

router.route("/login").post(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { token, publicUser } = await authService.loginUser(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: publicUser,
    });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router
  .route("/me")
  .get(requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        include: {
          gameHistories: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Me route error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

export default router;
