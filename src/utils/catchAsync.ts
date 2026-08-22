import { Request, Response, NextFunction, RequestHandler } from "express";

// Express does NOT automatically catch errors thrown inside an `async`
// route handler — an unhandled promise rejection would crash the process
// or hang the request. Wrapping every async controller in this function
// means: if the promise rejects, we call next(err) ourselves, which
// routes the error to our central error-handling middleware.
//
// Without this, every single controller would need:
//   try { ... } catch (err) { next(err) }
// This wrapper does that once, everywhere.
export const catchAsync =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
