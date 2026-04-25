import type { Request } from "express";

export type AuthUser = {
  id: number;
  username: string;
  displayName: string | null;
  role: string;
};

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
}