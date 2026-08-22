import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ZodError } from "zod";

// This is Express's special "error handler" signature — 4 parameters
// (err, req, res, next) is what tells Express "this middleware handles
// errors", and it's ALWAYS registered LAST in app.ts, after every route.
// Any `next(err)` call anywhere in the app eventually lands here.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Case 1: our own predictable errors (401, 403, 404, 409, etc.)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Case 2: Zod validation failed (see validate.middleware.ts) — turn it
  // into a clean 400 with readable field-level messages instead of a
  // scary Zod stack trace.
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  // Case 3: anything unexpected (a real bug). Log it fully on the server
  // so WE can debug it, but never leak the raw error/stack to the client.
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}
