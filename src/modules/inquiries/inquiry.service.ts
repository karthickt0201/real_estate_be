import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";

export async function createInquiry(userId: string, propertyId: string, message: string) {
  try {
    return await prisma.inquiry.create({ data: { userId, propertyId, message } });
  } catch (err) {
    // Prisma throws error code P2002 when a @@unique constraint is
    // violated — this is our DUPLICATE INQUIRY check. Importantly, this
    // check lives at the DATABASE level (the @@unique in schema.prisma),
    // not just in application code — that matters because two near-simultaneous
    // requests (a race condition) could both pass an in-app "does this
    // already exist?" check before either has written to the DB. The DB
    // constraint is the only thing that's actually race-condition-proof.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ApiError(409, "You've already sent an inquiry for this property");
    }
    throw err;
  }
}
