import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { TEST_USER_ID } from '../src/config/testSeeds';

describe('POST /api/uploads/presign', () => {
  it('returns a signed PUT url and object key', async () => {
    const response = await request(app).post('/api/uploads/presign').send({
      fileName: 'climb.jpg',
      contentType: 'image/jpeg',
    });

    expect(response.status).toBe(200);
    expect(response.body.key).toMatch(new RegExp(`^ascents/${TEST_USER_ID}/.+-climb\\.jpg$`));
    expect(response.body.contentType).toBe('image/jpeg');
    expect(response.body.url).toMatch(/^https?:\/\//);
    expect(response.body.url).toContain('bouldering');
  });

  it('signs a PUT url for a video clip', async () => {
    const response = await request(app).post('/api/uploads/presign').send({
      fileName: 'beta.mov',
      contentType: 'video/quicktime',
    });

    expect(response.status).toBe(200);
    expect(response.body.key).toMatch(new RegExp(`^ascents/${TEST_USER_ID}/.+-beta\\.mov$`));
    expect(response.body.contentType).toBe('video/quicktime');
    expect(response.body.url).toMatch(/^https?:\/\//);
  });

  it('returns 400 when contentType is missing', async () => {
    const response = await request(app).post('/api/uploads/presign').send({
      fileName: 'climb.jpg',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid presign body');
  });
});
