import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { registerUser, loginUser } from "./auth.service";
import { verifyRefreshToken, signAccessToken } from "../../utils/jwt";
import { ApiError } from "../../utils/ApiError";

// Options for the refresh-token cookie, reused in 3 places below so they
// can't drift out of sync with each other.
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // JavaScript in the browser CANNOT read this cookie — blocks XSS token theft
  secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production
  sameSite: "strict" as const, // cookie isn't sent on cross-site requests — blocks CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches REFRESH_TOKEN_EXPIRES_IN
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await registerUser(req.body);
  // The refresh token goes in a cookie, NOT the JSON body — the frontend
  // never directly handles it, the browser manages it automatically.
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  // The access token DOES go in the JSON body — frontend stores it in
  // memory (e.g. React state) and attaches it manually to each request.
  res.status(201).json({ accessToken, user });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await loginUser(req.body);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ accessToken, user });
});

// Called by the frontend automatically when an API request comes back 401,
// BEFORE forcing the user to log in again. This is what makes the user's
// session feel "seamless" even though access tokens expire every 15 min.
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new ApiError(401, "No refresh token provided");
  }

  try {
    const payload = verifyRefreshToken(token);
    const newAccessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    res.status(200).json({ accessToken: newAccessToken });
  } catch {
    throw new ApiError(401, "Refresh token invalid or expired — please log in again");
  }
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  // Clearing the cookie is enough for this assignment's scope. A more
  // advanced setup would also store refresh tokens in the DB and
  // invalidate them here — worth mentioning as a "future improvement" in your README.
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ message: "Logged out" });
});
