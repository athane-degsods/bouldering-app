/**
 * Fixed ids/emails used by `prisma/seed.ts` and the API while there is no real login.
 * Zustand on the phone is not a substitute: Express never reads Zustand.
 * Later, replace TEST_USER_ID in routes with the id from an auth token/session.
 * Add new seed rows here so tests and handlers stay in sync.
 */
export const TEST_USER_ID = '00000000-0000-4000-8000-000000000001';
export const TEST_USER_EMAIL = 'test@bouldering.app';
export const TEST_USER_NAME = 'Test Climber';

export const TEST_ASCENT_ID = '00000000-0000-4000-8000-000000000011';

/** Valid UUID that is never seeded — used to assert 404. */
export const UNKNOWN_ASCENT_ID = '00000000-0000-4000-8000-000000000099';
