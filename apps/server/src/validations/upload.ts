import { z } from 'zod';

/** POST /api/uploads/presign */
export const presignBodySchema = z.object({
  fileName: z.string().min(1),
  contentType: z
    .string()
    .regex(
      /^(image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|webm))$/,
      'Unsupported content type',
    ),
});

export const presignResponseSchema = z.object({
  url: z.string().min(1),
  key: z.string().min(1),
  contentType: z.string().min(1),
});

/** POST /api/uploads/presign-get — signed GET URLs for keys already in MinIO. */
export const presignGetBodySchema = z.object({
  keys: z.array(z.string().min(1)).min(1).max(20),
});

export const presignGetResponseSchema = z.object({
  items: z.array(
    z.object({
      key: z.string().min(1),
      url: z.string().min(1),
    }),
  ),
});
