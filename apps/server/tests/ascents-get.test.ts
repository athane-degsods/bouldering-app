import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { TEST_ASCENT_ID, TEST_USER_ID, UNKNOWN_ASCENT_ID } from '../src/config/testSeeds';

describe('GET /api/ascents/:id', () => {
  it('returns the seeded ascent', async () => {
    const response = await request(app).get(`/api/ascents/${TEST_ASCENT_ID}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: TEST_ASCENT_ID,
      routeName: 'Orange Overhang',
      grade: 'V5',
      attempts: 3,
      completed: false,
      videoKey: null,
      userId: TEST_USER_ID,
    });
    expect(Array.isArray(response.body.imageKeys)).toBe(true);
    expect(Number.isNaN(Date.parse(response.body.createdAt))).toBe(false);
  });

  it('returns 404 when the id is not in the database', async () => {
    const response = await request(app).get(`/api/ascents/${UNKNOWN_ASCENT_ID}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Ascent not found');
  });
});
