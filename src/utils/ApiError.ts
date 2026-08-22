// A plain `throw new Error("something broke")` gives us no HTTP status code
// and no way to distinguish "user's fault" (400) from "our fault" (500).
// This class carries a status code alongside the message so our central
// error handler (see middleware/error.middleware.ts) knows how to respond.
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    // Keeps the stack trace clean, pointing to where the error was
    // thrown rather than to this constructor.
    Error.captureStackTrace(this, this.constructor);
  }
}
