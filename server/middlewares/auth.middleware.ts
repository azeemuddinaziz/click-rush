import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/contants.ts";

export interface UserPayload {
  userId: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Login to access!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      req.user = decoded as UserPayload;
      return next();
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res
      .status(403)
      .json({ error: "Forbidden: Invalid or expired token" });
  }
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
    };
    req.user = decoded;
  } catch (error) {
    req.user = undefined;
  }

  next();
};
