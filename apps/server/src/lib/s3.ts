import { S3Client } from '@aws-sdk/client-s3';

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export type S3ClientKind = 'android' | 'web' | 'ios';

/**
 * Host baked into the signed URL. Signature includes this Host header, so it
 * must be what the browser/phone will actually call.
 * Web and iOS Simulator: AWS_ENDPOINT (localhost).
 * Android emulator: S3_PUBLIC_ENDPOINT (10.0.2.2) when set.
 */
export function s3SignEndpoint(client?: S3ClientKind) {
  const local = process.env.AWS_ENDPOINT || '';
  const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || '';
  if (client === 'android' && publicEndpoint) {
    return publicEndpoint;
  }
  return local || publicEndpoint;
}

export function s3Bucket() {
  return required('S3_BUCKET');
}

export function createS3Client(client?: S3ClientKind) {
  const endpoint = s3SignEndpoint(client);
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
