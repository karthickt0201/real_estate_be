import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { swaggerSpec } from "./swagger/swagger";

import authRoutes from "./modules/auth/auth.routes";
import propertyRoutes from "./modules/properties/property.routes";
import inquiryRoutes from "./modules/inquiries/inquiry.routes";

// WHY app.ts is separate from server.ts: app.ts builds the Express app
// object but never calls .listen() on it. That means a test file (see
// the automated-testing section of the earlier guide) can `import app`
// and hit it with Supertest WITHOUT actually binding a real port —
// tests run faster and can run many at once without port conflicts.
const app = express();

// --- Global middleware (runs on EVERY request, in this exact order) ---

// 1. CORS: without this, a browser on localhost:3000 (or your deployed
// frontend) would be BLOCKED by the browser itself from calling this API
// on a different origin. `credentials: true` is required for the
// httpOnly refresh-token cookie to be sent cross-origin.
app.use(cors({ origin: env.clientUrl, credentials: true }));

// 2. Body parser: without this, req.body would be `undefined` for every
// POST/PUT request — Express doesn't parse JSON bodies by default.
app.use(express.json());

// 3. Cookie parser: without this, req.cookies would be undefined, and
// auth.controller.ts's refresh() function couldn't read the refresh token.
app.use(cookieParser());

// --- Routes ---
// Every route inside authRoutes is automatically prefixed with /api/auth,
// same pattern for the other two modules. This is what keeps the URL
// structure organized as the API grows.
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/inquiries", inquiryRoutes);

// Swagger UI — mandatory per the assignment brief, exposed at exactly /api-docs.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Simple health check — the very first thing to verify after any deploy.
app.get("/health", (req, res) => res.json({ status: "ok" }));

// --- Error handler ---
// MUST be registered LAST, after all routes. Express identifies this as
// an error handler purely by its 4-argument signature (see error.middleware.ts).
app.use(errorHandler);

export default app;
