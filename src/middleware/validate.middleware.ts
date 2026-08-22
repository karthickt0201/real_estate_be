import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

// A single reusable middleware factory. Instead of writing custom
// if-checks inside every controller ("if (!req.body.email) return res...")
// we define a Zod schema once per route and hand it to this function.
//
// Usage in a routes file: router.post("/register", validate(registerSchema), controller)
export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // .parse() throws a ZodError if validation fails — that error is
      // caught by catchAsync/next() and handled centrally in error.middleware.ts.
      // We reassign req.body to the PARSED result (not just validated) because
      // Zod also strips unknown fields and applies defaults/coercions.
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Same idea, but for query strings (?city=Delhi&minPrice=1000000).
// Kept as a separate function because req.query and req.body need to be
// validated and reassigned differently, and mixing them into one function
// would make the "what am I validating" intent less obvious at the call site.
export function validateQuery(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // We stash the parsed result on a custom key instead of overwriting
      // req.query, because req.query is read-only in some Express/Node
      // versions. Controllers read from req.validatedQuery instead.
      (req as any).validatedQuery = schema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
}
