import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { TEST_ASCENT_ID, TEST_USER_ID } from '../src/config/testSeeds';

describe('GET /api/ascents', () => {
  it('returns seeded ascents for the test user', async () => {
    const response = await request(app).get('/api/ascents');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const seeded = response.body.find((row: { id: string }) => row.id === TEST_ASCENT_ID);
    expect(seeded).toMatchObject({
      id: TEST_ASCENT_ID,
      routeName: 'Orange Overhang',
      grade: 'V5',
      attempts: 3,
      completed: false,
      videoKey: null,
      userId: TEST_USER_ID,
    });
    expect(Array.isArray(seeded.imageKeys)).toBe(true);
    expect(Number.isNaN(Date.parse(seeded.createdAt))).toBe(false);

    for (const row of response.body) {
      expect(row.userId).toBe(TEST_USER_ID);
    }
  });
});
