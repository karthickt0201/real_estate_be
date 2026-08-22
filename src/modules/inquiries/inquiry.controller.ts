import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiError } from "../../utils/ApiError";
import { createInquiry } from "./inquiry.service";

export const create = catchAsync(async (req: Request, res: Response) => {
  const { propertyId, message, website } = req.body;

  // Honeypot check: a real user's browser never fills this hidden field.
  // If it's non-empty, silently pretend success (200) so the bot doesn't
  // learn its submission was blocked and adapt — but don't actually save it.
  if (website) {
    return res.status(201).json({ message: "Inquiry sent" });
  }

  const inquiry = await createInquiry(req.user!.id, propertyId, message);
  res.status(201).json(inquiry);
});
