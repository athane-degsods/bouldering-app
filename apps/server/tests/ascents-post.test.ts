import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { TEST_USER_ID } from '../src/config/testSeeds';

const createdIds: string[] = [];

afterAll(async () => {
  if (createdIds.length > 0) {
    await prisma.ascent.deleteMany({ where: { id: { in: createdIds } } });
  }
});

describe('POST /api/ascents', () => {
  it('creates an ascent for the test user', async () => {
    const response = await request(app).post('/api/ascents').send({
      routeName: 'Slab Traverse',
      grade: 'V2',
      attempts: 2,
      completed: true,
      notes: 'created in test',
    });

    expect(response.status).toBe(201);
    createdIds.push(response.body.id);
    expect(response.body).toMatchObject({
      routeName: 'Slab Traverse',
      grade: 'V2',
      attempts: 2,
      completed: true,
      notes: 'created in test',
      imageKeys: [],
      videoKey: null,
      userId: TEST_USER_ID,
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(response.body.createdAt))).toBe(false);
  });

  it('returns 400 when routeName is missing', async () => {
    const response = await request(app).post('/api/ascents').send({
      grade: 'V5',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid ascent body');
  });
});
