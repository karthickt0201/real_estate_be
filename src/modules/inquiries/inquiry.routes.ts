import { Router } from "express";
import { create } from "./inquiry.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createInquirySchema } from "./inquiry.schema";
import { inquiryRateLimiter } from "../../middleware/rateLimiter.middleware";

const router = Router();

/**
 * @swagger
 * /api/inquiries:
 *   post:
 *     summary: Send an inquiry to a property owner (must be logged in)
 *     tags: [Inquiries]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Inquiry sent }
 *       409: { description: Duplicate inquiry for this property }
 *       429: { description: Too many inquiries — rate limited }
 */
// Middleware order matters: authenticate -> rate limit -> validate -> controller.
// We rate-limit AFTER auth so the limiter tracks real logged-in abuse
// patterns, and BEFORE validate so a flood of malformed requests still
// gets stopped by the limiter instead of doing unnecessary validation work.
router.post("/", authenticate, inquiryRateLimiter, validate(createInquirySchema), create);

export default router;
