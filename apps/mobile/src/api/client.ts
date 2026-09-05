import { QueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

// Adjust base URL depending on environment/platform
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:4000', // Android Emulator bridge
  ios: 'http://localhost:4000',     // iOS Simulator
  default: 'http://localhost:4000', // Default fallback / physical device IP
});

// Configure TanStack Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
      retry: 2,
    },
  },
});

const S3_CLIENT =
  Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'web';

const HEALTH_TIMEOUT_MS = 4000;

/** True when Express answers GET /api/health. Used by the root layout. */
export async function fetchHealth() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error('API is not reachable');
    }
    return response.json();
  } catch {
    throw new Error('API is not reachable');
  } finally {
    clearTimeout(timer);
  }
}

export type Ascent = {
  id: string;
  routeName: string;
  grade: string;
  attempts: number;
  completed: boolean;
  notes: string | null;
  imageKeys: string[];
  videoKey: string | null;
  userId: string;
  createdAt: string;
};

export async function fetchAscents(): Promise<Ascent[]> {
  const response = await fetch(`${BASE_URL}/api/ascents`);
  if (!response.ok) {
    throw new Error('Failed to load ascents');
  }
  return response.json();
}

export async function fetchAscent(id: string): Promise<Ascent> {
  const response = await fetch(`${BASE_URL}/api/ascents/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load ascent');
  }
  return response.json();
}

export type AscentWrite = {
  routeName: string;
  grade: string;
  attempts: number;
  completed: boolean;
  notes?: string;
  imageKeys?: string[];
  videoKey?: string;
};

export async function createAscent(body: AscentWrite): Promise<Ascent> {
  const response = await fetch(`${BASE_URL}/api/ascents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Failed to create ascent');
  }
  return response.json();
}

export async function updateAscent(id: string, body: Partial<AscentWrite>): Promise<Ascent> {
  const response = await fetch(`${BASE_URL}/api/ascents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Failed to update ascent');
  }
  return response.json();
}

export async function deleteAscent(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/ascents/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete ascent');
  }
}

export type PresignUpload = {
  url: string;
  key: string;
  contentType: string;
};

/** Ask Express to sign a MinIO PUT. Does not upload bytes. */
export async function presignUpload(
  fileName: string,
  contentType: string,
): Promise<PresignUpload> {
  const response = await fetch(`${BASE_URL}/api/uploads/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName,
      contentType,
      client: S3_CLIENT,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to get upload URL');
  }
  return response.json();
}

/** PUT bytes to the signed MinIO/S3 URL. Express never sees this body. */
export async function putToSignedUrl(
  url: string,
  body: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body,
  });
  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
}

export type SignedGet = {
  key: string;
  url: string;
};

/** Ask Express to sign MinIO GET URLs for keys already stored on the ascent. */
export async function presignGets(keys: string[]): Promise<SignedGet[]> {
  if (keys.length === 0) {
    return [];
  }
  const response = await fetch(`${BASE_URL}/api/uploads/presign-get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keys,
      client: S3_CLIENT,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to get download URLs');
  }
  const body = (await response.json()) as { items: SignedGet[] };
  return body.items;
}
