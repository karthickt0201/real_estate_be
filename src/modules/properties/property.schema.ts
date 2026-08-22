import { z } from "zod";

const PropertyTypeEnum = z.enum(["APARTMENT", "VILLA", "PLOT", "INDEPENDENT_HOUSE", "COMMERCIAL"]);

export const createPropertySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  price: z.number().positive(),
  type: PropertyTypeEnum,
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  areaSqft: z.number().positive(),
  city: z.string().min(2),
  locality: z.string().min(2),
  address: z.string().min(5),
  // URLs the frontend already uploaded to Cloudinary and got back —
  // the backend never touches the actual image file, only these links.
  images: z.array(z.string().url()).min(1, "At least one image is required"),
});

// .partial() makes every field optional — an edit can update just the
// price, without being forced to resend the entire object.
export const updatePropertySchema = createPropertySchema.partial();

// Query-param validation for the search/filter endpoint. z.coerce.number()
// is important here — query params always arrive as strings ("2500000"),
// this converts them to actual numbers before we use them in a Prisma query.
export const searchPropertySchema = z.object({
  city: z.string().optional(),
  type: PropertyTypeEnum.optional(),
  bedrooms: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(["price", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  cursor: z.string().optional(), // last-seen property id, for pagination
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type SearchPropertyInput = z.infer<typeof searchPropertySchema>;
