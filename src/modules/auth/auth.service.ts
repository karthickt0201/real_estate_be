import bcrypt from "bcrypt";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";
import { RegisterInput, LoginInput } from "./auth.schema";

// WHY a separate "service" file from the "controller" file:
// The controller's job is ONLY to deal with HTTP (read req, send res).
// The service's job is the actual business logic (talk to the database,
// apply rules). This separation means you could reuse `registerUser`
// from a CLI script or a test file without dragging Express into it,
// and it keeps each file focused on one responsibility.

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    // 409 = Conflict, the correct status code for "this resource already exists"
    throw new ApiError(409, "An account with this email already exists");
  }

  // NEVER store plain-text passwords. bcrypt.hash applies a one-way hash
  // with a random "salt" baked in (10 rounds is a good speed/security balance
  // for 2026 hardware) — even if the database leaks, passwords aren't exposed.
  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password: hashedPassword },
  });

  return buildAuthResponse(user.id, user.role, user.name, user.email);
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Deliberately vague error message ("Invalid credentials") for BOTH
  // "no such user" and "wrong password" — telling an attacker WHICH one
  // failed makes it easier to enumerate valid emails on your platform.
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  return buildAuthResponse(user.id, user.role, user.name, user.email);
}

// Shared by both register and login since they end the same way:
// user is authenticated, issue both tokens.
function buildAuthResponse(userId: string, role: string, name: string, email: string) {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = signRefreshToken({ userId, role });
  return { accessToken, refreshToken, user: { id: userId, name, email, role } };
}
