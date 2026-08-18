import { S3Client } from '@aws-sdk/client-s3';

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

/** Endpoint baked into the signed URL (phone must be able to reach this host). */
export function s3SignEndpoint() {
  return process.env.S3_PUBLIC_ENDPOINT || process.env.AWS_ENDPOINT || '';
}

export function s3Bucket() {
  return required('S3_BUCKET');
}

export function createS3Client() {
  const endpoint = s3SignEndpoint();
  if (!endpoint) {
    throw new Error('AWS_ENDPOINT or S3_PUBLIC_ENDPOINT is not set');
  }

  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint,
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: required('AWS_ACCESS_KEY_ID'),
      secretAccessKey: required('AWS_SECRET_ACCESS_KEY'),
    },
  });
}
