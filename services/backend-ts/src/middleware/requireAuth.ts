import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { getUserById, verifyToken } from "../services/authService";

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      message: "Missing bearer token"
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);
    const userId = Number(payload.sub);
    const user = getUserById(userId);

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Invalid token user"
      });
    }

    req.authUser = user;
    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      message: "Invalid or expired token"
    });
  }
}