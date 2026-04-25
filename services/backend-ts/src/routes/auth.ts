import { Router } from "express";
import { z } from "zod";
import {
  createUser,
  getUserByUsername,
  signToken,
  verifyPassword
} from "../services/authService";
import { requireAuth } from "../middleware/requireAuth";
import { AuthenticatedRequest } from "../types/auth";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(4).max(128),
  displayName: z.string().min(1).max(64).optional()
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

router.post("/auth/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid register request",
      issues: parsed.error.issues
    });
  }

  const existing = getUserByUsername(parsed.data.username);

  if (existing) {
    return res.status(409).json({
      ok: false,
      message: "Username already exists"
    });
  }

  const user = createUser(parsed.data);

  if (!user) {
    return res.status(500).json({
      ok: false,
      message: "Failed to create user"
    });
  }

  const token = signToken(user);

  return res.status(201).json({
    ok: true,
    user,
    token
  });
});

router.post("/auth/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid login request",
      issues: parsed.error.issues
    });
  }

  const userRow = getUserByUsername(parsed.data.username);

  if (!userRow || !verifyPassword(parsed.data.password, userRow.password_hash)) {
    return res.status(401).json({
      ok: false,
      message: "Invalid username or password"
    });
  }

  const user = {
    id: userRow.id,
    username: userRow.username,
    displayName: userRow.display_name,
    role: userRow.role
  };

  const token = signToken(user);

  return res.status(200).json({
    ok: true,
    user,
    token
  });
});

router.get("/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
  return res.status(200).json({
    ok: true,
    user: req.authUser
  });
});

export default router;