import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import {
  createProperty,
  getPropertyById,
  assertOwnership,
  updateProperty,
  deleteProperty,
  searchProperties,
  getSimilarProperties,
} from "./property.service";

export const create = catchAsync(async (req: Request, res: Response) => {
  // req.user is guaranteed to exist here because the `authenticate`
  // middleware ran first and would have thrown a 401 otherwise.
  const property = await createProperty(req.user!.id, req.body);
  res.status(201).json(property);
});

export const list = catchAsync(async (req: Request, res: Response) => {
  // req.validatedQuery was already validated + coerced by the
  // `validateQuery` middleware using searchPropertySchema (string → number
  // coercion, defaults applied), so it's safe to use directly here.
  const result = await searchProperties((req as any).validatedQuery);
  res.status(200).json(result);
});

export const getOne = catchAsync(async (req: Request, res: Response) => {
  const property = await getPropertyById(req.params.id);
  const similar = await getSimilarProperties(property);
  res.status(200).json({ ...property, similarProperties: similar });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  await assertOwnership(req.params.id, req.user!.id);
  const updated = await updateProperty(req.params.id, req.body);
  res.status(200).json(updated);
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await assertOwnership(req.params.id, req.user!.id);
  await deleteProperty(req.params.id);
  res.status(204).send();
});
