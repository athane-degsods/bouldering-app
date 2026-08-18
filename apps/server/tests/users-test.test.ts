import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { TEST_USER_EMAIL, TEST_USER_ID, TEST_USER_NAME } from '../src/config/testSeeds';

describe('GET /api/users/test', () => {
  it('returns the seeded test climber', async () => {
    const response = await request(app).get('/api/users/test');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: TEST_USER_ID,
      email: TEST_USER_EMAIL,
      name: TEST_USER_NAME,
      createdAt: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(response.body.createdAt))).toBe(false);
  });
});
