import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { UNKNOWN_ASCENT_ID } from '../src/config/testSeeds';

const leftoverIds: string[] = [];

afterAll(async () => {
  if (leftoverIds.length > 0) {
    await prisma.ascent.deleteMany({ where: { id: { in: leftoverIds } } });
  }
});

describe('DELETE /api/ascents/:id', () => {
  it('deletes an ascent owned by the test user', async () => {
    const created = await request(app).post('/api/ascents').send({
      routeName: 'Delete Me',
      grade: 'V0',
    });
    expect(created.status).toBe(201);
    leftoverIds.push(created.body.id);

    const response = await request(app).delete(`/api/ascents/${created.body.id}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const missing = await request(app).get(`/api/ascents/${created.body.id}`);
    expect(missing.status).toBe(404);
  });

  it('returns 404 when the id is not in the database', async () => {
    const response = await request(app).delete(`/api/ascents/${UNKNOWN_ASCENT_ID}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Ascent not found');
  });
});
