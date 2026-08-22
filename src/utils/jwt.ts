import jwt from "jsonwebtoken";
import { env } from "../config/env";

// Keeping token creation/verification in one file means if we ever change
// our token strategy (e.g. add more claims, change expiry), we change it
// in exactly one place instead of hunting through every controller.

export interface JwtPayload {
  userId: string;
  role: string;
}

// Short-lived token sent on every API request in the Authorization header.
// Short expiry (15 min) limits the damage if a token is ever stolen.
export function signAccessToken(payload: JwtPayload): string {
  // Cast to SignOptions because env values are plain strings from .env,
  // and the jsonwebtoken types want a more specific "duration string" type.
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpiresIn,
  } as jwt.SignOptions);
}

// Long-lived token, stored in an httpOnly cookie (never touched by frontend
// JS, so it can't be stolen via an XSS attack the way localStorage can).
// Used only to mint new access tokens via the /auth/refresh endpoint.
export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
}
