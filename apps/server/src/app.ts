import express, { Request, Response } from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import { TEST_USER_EMAIL, TEST_USER_ID } from './config/testSeeds.js';
import { ascentIdParamSchema, createAscentBodySchema, toAscentJson, toAscentListJson, updateAscentBodySchema } from './validations/ascent.js';
import { toTestUserJson } from './validations/user.js';
import { createPresignedGet, createPresignedPut } from './lib/presign.js';
import {
  presignBodySchema,
  presignGetBodySchema,
  presignGetResponseSchema,
  presignResponseSchema,
} from './validations/upload.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: '🧗‍♂️ Bouldering API server is healthy and running!',
  });
});

// POST: Short-lived MinIO/S3 PUT URL. Phone uploads bytes; Express never sees the file.
app.post('/api/uploads/presign', async (req: Request, res: Response) => {
  const bodyResult = presignBodySchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({ error: 'Invalid presign body' });
  }

  try {
    const signed = await createPresignedPut(
      bodyResult.data.fileName,
      bodyResult.data.contentType,
    );
    return res.status(200).json(presignResponseSchema.parse(signed));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create upload URL' });
  }
});

// POST: Short-lived MinIO/S3 GET URLs for keys the test user owns.
app.post('/api/uploads/presign-get', async (req: Request, res: Response) => {
  const bodyResult = presignGetBodySchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({ error: 'Invalid presign body' });
  }

  try {
    const items = await Promise.all(
      bodyResult.data.keys.map((key) => createPresignedGet(key)),
    );
    return res.status(200).json(presignGetResponseSchema.parse({ items }));
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'Invalid object key') {
      return res.status(400).json({ error: 'Invalid object key' });
    }
    return res.status(500).json({ error: 'Failed to create download URLs' });
  }
});

// GET: Seeded test climber (must stay above any /api/users/:id route)
app.get('/api/users/test', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Test user not found. Run npm run db:seed in apps/server.',
      });
    }

    return res.status(200).json(toTestUserJson(user));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch test user' });
  }
});

// GET: All logs for the seeded test user
app.get('/api/ascents', async (req: Request, res: Response) => {
  try {
    const ascents = await prisma.ascent.findMany({
      where: { userId: TEST_USER_ID },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(toAscentListJson(ascents));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch ascents' });
  }
});

// POST: Create a log for the seeded test user
app.post('/api/ascents', async (req: Request, res: Response) => {
  const bodyResult = createAscentBodySchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({ error: 'Invalid ascent body' });
  }

  try {
    const ascent = await prisma.ascent.create({
      data: {
        ...bodyResult.data,
        // Stand-in until auth: not replaced by Zustand (phone-only). Later: id from token.
        userId: TEST_USER_ID,
      },
    });

    return res.status(201).json(toAscentJson(ascent));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create ascent' });
  }
});

// GET: One log (must be the test user's). Invalid UUID → 400.
app.get('/api/ascents/:id', async (req: Request, res: Response) => {
  const idResult = ascentIdParamSchema.safeParse(req.params.id);
  if (!idResult.success) {
    return res.status(400).json({ error: 'Invalid ascent id' });
  }

  try {
    const ascent = await prisma.ascent.findFirst({
      where: { id: idResult.data, userId: TEST_USER_ID },
    });

    if (!ascent) {
      return res.status(404).json({ error: 'Ascent not found' });
    }

    return res.status(200).json(toAscentJson(ascent));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch ascent' });
  }
});

// PATCH: Update a log owned by the test user
app.patch('/api/ascents/:id', async (req: Request, res: Response) => {
  const idResult = ascentIdParamSchema.safeParse(req.params.id);
  if (!idResult.success) {
    return res.status(400).json({ error: 'Invalid ascent id' });
  }

  const bodyResult = updateAscentBodySchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({ error: 'Invalid ascent body' });
  }

  try {
    const existing = await prisma.ascent.findFirst({
      where: { id: idResult.data, userId: TEST_USER_ID },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Ascent not found' });
    }

    const ascent = await prisma.ascent.update({
      where: { id: idResult.data },
      data: bodyResult.data,
    });

    return res.status(200).json(toAscentJson(ascent));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update ascent' });
  }
});

// DELETE: Remove a log owned by the test user
app.delete('/api/ascents/:id', async (req: Request, res: Response) => {
  const idResult = ascentIdParamSchema.safeParse(req.params.id);
  if (!idResult.success) {
    return res.status(400).json({ error: 'Invalid ascent id' });
  }

  try {
    const existing = await prisma.ascent.findFirst({
      where: { id: idResult.data, userId: TEST_USER_ID },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Ascent not found' });
    }

    await prisma.ascent.delete({ where: { id: idResult.data } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete ascent' });
  }
});

// GET: Fetch all users
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST: Create a user
app.post('/api/users', async (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    const newUser = await prisma.user.create({
      data: { email, name },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});