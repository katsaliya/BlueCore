"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authService_1 = require("../services/authService");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(32),
    password: zod_1.z.string().min(4).max(128),
    displayName: zod_1.z.string().min(1).max(64).optional()
});
const loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1)
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
    const existing = (0, authService_1.getUserByUsername)(parsed.data.username);
    if (existing) {
        return res.status(409).json({
            ok: false,
            message: "Username already exists"
        });
    }
    const user = (0, authService_1.createUser)(parsed.data);
    if (!user) {
        return res.status(500).json({
            ok: false,
            message: "Failed to create user"
        });
    }
    const token = (0, authService_1.signToken)(user);
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
    const userRow = (0, authService_1.getUserByUsername)(parsed.data.username);
    if (!userRow || !(0, authService_1.verifyPassword)(parsed.data.password, userRow.password_hash)) {
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
    const token = (0, authService_1.signToken)(user);
    return res.status(200).json({
        ok: true,
        user,
        token
    });
});
router.get("/auth/me", requireAuth_1.requireAuth, (req, res) => {
    return res.status(200).json({
        ok: true,
        user: req.authUser
    });
});
exports.default = router;
