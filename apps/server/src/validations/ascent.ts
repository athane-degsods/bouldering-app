import { z } from 'zod';
import { TEST_USER_ID } from '../config/testSeeds.js';

/** One ascent row as JSON. Media stays null until the upload step. */
export const ascentResponseSchema = z.object({
  id: z.string().uuid(),
  routeName: z.string().min(1),
  grade: z.string().min(1),
  attempts: z.number().int().min(0),
  completed: z.boolean(),
  notes: z.string().nullable(),
  imageKey: z.string().nullable(),
  videoKey: z.string().nullable(),
  userId: z.literal(TEST_USER_ID),
  createdAt: z.coerce.date(),
});

export const ascentListResponseSchema = z.array(ascentResponseSchema);

/** `:id` in GET /api/ascents/:id — reject junk strings before Prisma. */
export const ascentIdParamSchema = z.string().uuid();

/** POST /api/ascents — client never sends userId or media keys. */
export const createAscentBodySchema = z.object({
  routeName: z.string().min(1),
  grade: z.string().min(1),
  attempts: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
});

/** PATCH /api/ascents/:id — at least one field must be present. */
export const updateAscentBodySchema = createAscentBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Empty body' },
);

export function toAscentJson(ascent: unknown) {
  const parsed = ascentResponseSchema.parse(ascent);
  return {
    id: parsed.id,
    routeName: parsed.routeName,
    grade: parsed.grade,
    attempts: parsed.attempts,
    completed: parsed.completed,
    notes: parsed.notes,
    imageKey: parsed.imageKey,
    videoKey: parsed.videoKey,
    userId: parsed.userId,
    createdAt: parsed.createdAt.toISOString(),
  };
}

export function toAscentListJson(ascents: unknown) {
  return ascentListResponseSchema.parse(ascents).map(toAscentJson);
}
