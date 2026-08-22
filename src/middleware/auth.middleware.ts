import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

// Express doesn't know about a custom `user` field on `req` by default,
// so we extend its type. This is what lets us write `req.user.id` later
// in controllers without a TypeScript error.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

// Any route that calls `router.get("/x", authenticate, controller)` will
// run this FIRST. If the token is missing/invalid, we stop the request
// here with a 401 and never reach the controller at all.
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization; // expected format: "Bearer <token>"

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "No access token provided"));
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    // Attach the decoded user info to the request so every downstream
    // controller/middleware can read req.user without re-decoding the token.
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    // jwt.verify throws if the token is expired or the signature is invalid.
    return next(new ApiError(401, "Invalid or expired access token"));
  }
}
