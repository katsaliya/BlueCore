"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const authService_1 = require("../services/authService");
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            ok: false,
            message: "Missing bearer token"
        });
    }
    const token = authHeader.slice("Bearer ".length).trim();
    try {
        const payload = (0, authService_1.verifyToken)(token);
        const userId = Number(payload.sub);
        const user = (0, authService_1.getUserById)(userId);
        if (!user) {
            return res.status(401).json({
                ok: false,
                message: "Invalid token user"
            });
        }
        req.authUser = user;
        return next();
    }
    catch {
        return res.status(401).json({
            ok: false,
            message: "Invalid or expired token"
        });
    }
}
