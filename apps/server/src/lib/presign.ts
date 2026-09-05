import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { TEST_USER_ID } from '../config/testSeeds.js';
import { createS3Client, s3Bucket, type S3ClientKind } from './s3.js';

const PUT_EXPIRES_SECONDS = 300;
const VIDEO_PUT_EXPIRES_SECONDS = 900;
const GET_EXPIRES_SECONDS = 3600;

export function isTestUserObjectKey(key: string) {
  return key.startsWith(`ascents/${TEST_USER_ID}/`) && !key.includes('..');
}

function safeFileName(fileName: string) {
  const base = fileName.replace(/\\/g, '/').split('/').pop() || 'upload';
  return base.replace(/[^a-zA-Z0-9._-]/g, '_') || 'upload';
}

export async function createPresignedPut(
  fileName: string,
  contentType: string,
  s3Client?: S3ClientKind,
) {
  const key = `ascents/${TEST_USER_ID}/${randomUUID()}-${safeFileName(fileName)}`;
  const client = createS3Client(s3Client);
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: s3Bucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: contentType.startsWith('video/') ? VIDEO_PUT_EXPIRES_SECONDS : PUT_EXPIRES_SECONDS },
  );

  return { url, key, contentType };
}

export async function createPresignedGet(key: string, s3Client?: S3ClientKind) {
  if (!isTestUserObjectKey(key)) {
    throw new Error('Invalid object key');
  }

  const url = await getSignedUrl(
    createS3Client(s3Client),
    new GetObjectCommand({
      Bucket: s3Bucket(),
      Key: key,
    }),
    { expiresIn: GET_EXPIRES_SECONDS },
  );

  return { url, key };
}
