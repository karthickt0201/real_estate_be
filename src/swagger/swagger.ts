import swaggerJsdoc from "swagger-jsdoc";

// swagger-jsdoc scans the files listed in `apis` for the `@swagger` JSDoc
// comment blocks you saw above each route (e.g. in auth.routes.ts) and
// assembles them into one OpenAPI spec — that's how /api-docs stays in
// sync with the actual routes instead of being a hand-written doc that
// silently goes stale.
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Real Estate Listing Platform API",
      version: "1.0.0",
      description: "API documentation for the real-estate listing platform assignment",
    },
    servers: [{ url: "/api", description: "Base API path" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  // Glob paths to every routes file — add new modules here as you build them.
  apis: ["./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
