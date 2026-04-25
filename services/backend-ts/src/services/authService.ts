import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { db } from "../db/sqlite";
import { env } from "../config/env";
import { AuthUser } from "../types/auth";

type UserRow = {
  id: number;
  username: string;
  password_hash: string;
  display_name: string | null;
  role: string;
  created_at: string;
};

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function createUser(params: {
  username: string;
  password: string;
  displayName?: string;
}) {
  const username = normalizeUsername(params.username);
  const passwordHash = bcrypt.hashSync(params.password, 10);
  const createdAt = new Date().toISOString();
  const displayName = params.displayName?.trim() || null;

  const result = db
    .prepare(
      `
      INSERT INTO users (username, password_hash, display_name, role, created_at)
      VALUES (?, ?, ?, 'sailor', ?)
      `
    )
    .run(username, passwordHash, displayName, createdAt);

  return getUserById(Number(result.lastInsertRowid));
}

export function getUserByUsername(username: string) {
  return db
    .prepare(
      `
      SELECT id, username, password_hash, display_name, role, created_at
      FROM users
      WHERE username = ?
      `
    )
    .get(normalizeUsername(username)) as UserRow | undefined;
}

export function getUserById(id: number) {
  const row = db
    .prepare(
      `
      SELECT id, username, password_hash, display_name, role, created_at
      FROM users
      WHERE id = ?
      `
    )
    .get(id) as UserRow | undefined;

  if (!row) {
    return null;
  }

  return toAuthUser(row);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compareSync(password, passwordHash);
}

export function signToken(user: AuthUser) {
  return jwt.sign(
    {
      sub: String(user.id),
      username: user.username,
      role: user.role
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    } as jwt.SignOptions
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
}

function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role
  };
}