import dotenv from "dotenv";
dotenv.config();
const result = dotenv.config();
console.log("dotenv loaded from:", result.parsed ? "SUCCESS" : "FAILED", result.error);
// We read every env var ONCE here, and the rest of the app imports from
// this file instead of calling process.env directly everywhere.
// Why: if a variable is missing, we want the app to crash loudly at
// startup (easy to debug) instead of failing silently deep inside a route.
function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}


export const env = {
  port: process.env.PORT || 5000,
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};
