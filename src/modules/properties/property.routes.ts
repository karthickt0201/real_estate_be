import { Router } from "express";
import { create, list, getOne, update, remove } from "./property.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate, validateQuery } from "../../middleware/validate.middleware";
import { createPropertySchema, updatePropertySchema, searchPropertySchema } from "./property.schema";

const router = Router();

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Search/list properties with filters, sorting, and pagination
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of properties }
 */
// PUBLIC route — no `authenticate` — anyone can browse listings without logging in.
router.get("/", validateQuery(searchPropertySchema), list);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a single property with similar-properties recommendations
 *     tags: [Properties]
 *     responses:
 *       200: { description: Property detail }
 *       404: { description: Property not found }
 */
router.get("/:id", getOne);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property listing (must be logged in)
 *     tags: [Properties]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Property created }
 *       401: { description: Not authenticated }
 */
// PROTECTED — note the middleware order: authenticate runs first (are you
// logged in at all?), THEN validate (is your data well-formed?). Checking
// auth before validation avoids wasting work validating a request from
// someone who isn't even allowed to make it.
router.post("/", authenticate, validate(createPropertySchema), create);

router.put("/:id", authenticate, validate(updatePropertySchema), update);

router.delete("/:id", authenticate, remove);

export default router;
