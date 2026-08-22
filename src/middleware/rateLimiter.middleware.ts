import rateLimit from "express-rate-limit";

// Applied ONLY to the inquiry-creation route (see inquiry.routes.ts).
// Without this, a script could hammer property owners with hundreds of
// fake inquiries per minute — this caps it per IP address.
export const inquiryRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute rolling window
  max: 5, // max 5 inquiry submissions per IP in that window
  message: { message: "Too many inquiries submitted. Please try again later." },
  standardHeaders: true, // adds RateLimit-* headers so the frontend can show a countdown if it wants
  legacyHeaders: false,
});
