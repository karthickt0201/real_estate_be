# Haven — Real Estate Listing Platform (Backend)

Express + Prisma + PostgreSQL API for a real-estate listing platform. Handles authentication, property CRUD, search/filtering at scale, similar-property recommendations, and lead/inquiry management with spam protection.

**Live API:** `https://real-estate-be-rdsr.onrender.com`
**API docs:** `https://real-estate-be-rdsr.onrender.com/api-docs`
**Frontend repository:** *(link your separate frontend repo here)*

## Tech stack
- Node.js + Express
- PostgreSQL (hosted on [Neon](https://neon.tech), free tier)
- Prisma ORM
- JWT (access + refresh token pattern)
- Zod for validation
- Swagger / OpenAPI (swagger-jsdoc + swagger-ui-express)

## Getting started locally

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Postgres connection string, e.g. from a free Neon project |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Two different long random strings — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `CLIENT_URL` | Your frontend's URL, for CORS (e.g. `http://localhost:3000` locally) |

```bash
npx prisma migrate dev --name init   # creates tables from prisma/schema.prisma
npm run dev
```
Server runs on `http://localhost:5000`. Swagger docs at `/api-docs`, health check at `/health`.

## Project structure

```
src/
├── config/        # env.ts (typed env loader), db.ts (shared Prisma client)
├── utils/         # ApiError, catchAsync (async error wrapper), jwt (sign/verify)
├── middleware/     # auth (JWT check), validate (Zod), error handler, rate limiter
├── modules/
│   ├── auth/        # register, login, refresh, logout
│   ├── properties/   # CRUD, search/filter/pagination, similar-properties
│   └── inquiries/     # lead capture, duplicate + spam protection
├── swagger/        # OpenAPI spec generation from route JSDoc comments
├── app.ts           # Express app assembly (middleware + routes)
└── server.ts         # entry point — starts listening
```

Every module follows the same four-file pattern: **schema** (Zod validation) → **service** (database logic, no HTTP awareness) → **controller** (HTTP glue) → **routes** (URL wiring + middleware chain).

## Key design decisions

**Auth strategy.** Short-lived access tokens (15 min, JWT, sent in the `Authorization` header) paired with long-lived refresh tokens (7 days, stored in an httpOnly cookie — never readable by frontend JavaScript, which blocks XSS-based token theft). `/api/auth/refresh` exchanges a valid refresh cookie for a new access token without forcing re-login.

**Search & pagination at scale.** Composite database indexes (`[city]`, `[price]`, `[city, price]`) keep filtered queries fast as the dataset grows toward 50,000+ rows. Pagination is **cursor-based**, not offset-based — `OFFSET 40000` forces Postgres to scan and discard 40,000 rows before returning results, while cursor pagination (`WHERE id > lastSeenId`) uses the index directly regardless of how deep into the results you are.

**Similar properties.** A simple, explainable rule — same city, same type, price within ±20%, excluding the property itself — rather than machine learning. It reuses the same composite index as search, so it stays cheap at scale with no extra infrastructure.

**Duplicate inquiry prevention.** Enforced with a database-level `@@unique([propertyId, userId])` constraint, not just an application-level check — this matters because two near-simultaneous requests could both pass an in-app check before either has written to the database (a race condition); only a DB constraint is actually safe against that.

**Spam/abuse protection on inquiries.** Rate limiting (5 submissions per 15 minutes per IP) plus a honeypot field that silently rejects bot submissions without tipping them off.

**Image handling.** The API never receives raw image files — the frontend uploads directly to Cloudinary and sends back the resulting URLs, which are stored as-is. Keeps the API stateless and fast regardless of file sizes.

## Deploying (Render — free)

1. Push to GitHub (`.env` is git-ignored — never committed).
2. On [render.com](https://render.com) → New → Web Service → connect this repo.
3. **Build command:** `npm install && npx prisma generate && npm run build`
4. **Start command:** `npx prisma migrate deploy && npm start`
5. Add all `.env` variables individually under Render's Environment tab.
6. Deploy. Free tier note: the service sleeps after ~15 min of inactivity and takes ~30–50s to wake on the next request — a known, expected free-tier tradeoff.

## Known limitations / future improvements
- Refresh tokens aren't stored server-side, so there's no way to revoke a specific session early (e.g. "log out this device remotely"). A production version would persist refresh tokens in the DB.
- Similar-properties uses a simple rule-based match; a larger dataset could move to precomputed recommendations or vector similarity.
- No automated test suite yet — all endpoints have been verified manually via Postman/Swagger.
