import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { TEST_USER_ID } from '../src/config/testSeeds';

describe('POST /api/uploads/presign-get', () => {
  it('returns signed GET urls for owned keys', async () => {
    const key = `ascents/${TEST_USER_ID}/preview.jpg`;
    const response = await request(app).post('/api/uploads/presign-get').send({
      keys: [key],
    });

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].key).toBe(key);
    expect(response.body.items[0].url).toMatch(/^https?:\/\//);
    expect(response.body.items[0].url).toContain('bouldering');
  });

  it('returns 400 when a key is not under the test user prefix', async () => {
    const response = await request(app).post('/api/uploads/presign-get').send({
      keys: ['ascents/other-user/secret.jpg'],
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid object key');
  });
});
