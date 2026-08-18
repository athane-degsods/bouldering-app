import { z } from 'zod';
import { TEST_USER_EMAIL, TEST_USER_ID } from '../config/testSeeds.js';

/**
 * Shape we send for GET /api/users/test.
 * createdAt is coerced because Prisma gives a Date; res.json turns it into an ISO string.
 */
export const testUserResponseSchema = z.object({
  id: z.literal(TEST_USER_ID),
  email: z.literal(TEST_USER_EMAIL),
  name: z.string().min(1),
  createdAt: z.coerce.date(),
});

export type TestUserResponse = z.infer<typeof testUserResponseSchema>;

export function toTestUserJson(user: unknown) {
  const parsed = testUserResponseSchema.parse(user);
  return {
    id: parsed.id,
    email: parsed.email,
    name: parsed.name,
    createdAt: parsed.createdAt.toISOString(),
  };
}
