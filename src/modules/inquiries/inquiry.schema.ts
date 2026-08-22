import { z } from "zod";

export const createInquirySchema = z.object({
  propertyId: z.string().uuid(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    // A crude but real spam check: reject messages that are ONLY a URL —
    // legitimate inquiries describe interest in the property, spam is
    // usually just a dropped link.
    .refine((msg) => !/^https?:\/\/\S+$/.test(msg.trim()), {
      message: "Message cannot be only a link",
    }),
  // Honeypot field: real users never see or fill this (hidden via CSS on
  // the frontend). If it arrives non-empty, a bot filled the form
  // automatically — so we can silently reject it in the controller.
  website: z.string().max(0, "Spam detected").optional().default(""),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
