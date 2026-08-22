import app from "./app";
import { env } from "./config/env";

// This file's ONLY job is to start the server. Kept separate from app.ts
// (see the comment there) so the app object is testable in isolation.
app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  console.log(`Swagger docs available at http://localhost:${env.port}/api-docs`);
});
