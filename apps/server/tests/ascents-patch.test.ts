import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { UNKNOWN_ASCENT_ID } from '../src/config/testSeeds';

const createdIds: string[] = [];

afterAll(async () => {
  if (createdIds.length > 0) {
    await prisma.ascent.deleteMany({ where: { id: { in: createdIds } } });
  }
});

describe('PATCH /api/ascents/:id', () => {
  it('updates fields on an ascent owned by the test user', async () => {
    const created = await request(app).post('/api/ascents').send({
      routeName: 'Patch Target',
      grade: 'V1',
      attempts: 1,
      completed: false,
    });
    expect(created.status).toBe(201);
    createdIds.push(created.body.id);

    const response = await request(app)
      .patch(`/api/ascents/${created.body.id}`)
      .send({ completed: true, attempts: 4 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: created.body.id,
      routeName: 'Patch Target',
      grade: 'V1',
      completed: true,
      attempts: 4,
    });
  });

  it('appends photo keys on imageKeys', async () => {
    const created = await request(app).post('/api/ascents').send({
      routeName: 'Photo Patch',
      grade: 'V3',
    });
    expect(created.status).toBe(201);
    createdIds.push(created.body.id);

    const first = `ascents/${created.body.userId}/first.jpg`;
    const second = `ascents/${created.body.userId}/second.jpg`;

    const one = await request(app)
      .patch(`/api/ascents/${created.body.id}`)
      .send({ imageKeys: [first] });
    expect(one.status).toBe(200);
    expect(one.body.imageKeys).toEqual([first]);

    const two = await request(app)
      .patch(`/api/ascents/${created.body.id}`)
      .send({ imageKeys: [first, second] });
    expect(two.status).toBe(200);
    expect(two.body.imageKeys).toEqual([first, second]);
  });

  it('returns 400 when the body is empty', async () => {
    const created = await request(app).post('/api/ascents').send({
      routeName: 'Empty Patch',
      grade: 'V0',
    });
    expect(created.status).toBe(201);
    createdIds.push(created.body.id);

    const response = await request(app).patch(`/api/ascents/${created.body.id}`).send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid ascent body');
  });

  it('returns 404 when the id is not in the database', async () => {
    const response = await request(app)
      .patch(`/api/ascents/${UNKNOWN_ASCENT_ID}`)
      .send({ completed: true });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Ascent not found');
  });
});
