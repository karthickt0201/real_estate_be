import { z } from "zod";

// Zod schemas double as both validation AND documentation — anyone
// reading this file instantly knows the exact shape of a valid request.
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// z.infer lets us derive a TypeScript type FROM the schema, so the
// validation rule and the TypeScript type can never drift apart.
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
