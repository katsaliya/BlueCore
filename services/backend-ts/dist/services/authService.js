"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUsername = normalizeUsername;
exports.createUser = createUser;
exports.getUserByUsername = getUserByUsername;
exports.getUserById = getUserById;
exports.verifyPassword = verifyPassword;
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const sqlite_1 = require("../db/sqlite");
const env_1 = require("../config/env");
function normalizeUsername(username) {
    return username.trim().toLowerCase();
}
function createUser(params) {
    const username = normalizeUsername(params.username);
    const passwordHash = bcrypt.hashSync(params.password, 10);
    const createdAt = new Date().toISOString();
    const displayName = params.displayName?.trim() || null;
    const result = sqlite_1.db
        .prepare(`
      INSERT INTO users (username, password_hash, display_name, role, created_at)
      VALUES (?, ?, ?, 'sailor', ?)
      `)
        .run(username, passwordHash, displayName, createdAt);
    return getUserById(Number(result.lastInsertRowid));
}
function getUserByUsername(username) {
    return sqlite_1.db
        .prepare(`
      SELECT id, username, password_hash, display_name, role, created_at
      FROM users
      WHERE username = ?
      `)
        .get(normalizeUsername(username));
}
function getUserById(id) {
    const row = sqlite_1.db
        .prepare(`
      SELECT id, username, password_hash, display_name, role, created_at
      FROM users
      WHERE id = ?
      `)
        .get(id);
    if (!row) {
        return null;
    }
    return toAuthUser(row);
}
function verifyPassword(password, passwordHash) {
    return bcrypt.compareSync(password, passwordHash);
}
function signToken(user) {
    return jwt.sign({
        sub: String(user.id),
        username: user.username,
        role: user.role
    }, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN
    });
}
function verifyToken(token) {
    return jwt.verify(token, env_1.env.JWT_SECRET);
}
function toAuthUser(row) {
    return {
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        role: row.role
    };
}
