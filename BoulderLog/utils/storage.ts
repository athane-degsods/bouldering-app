import AsyncStorage from '@react-native-async-storage/async-storage';
import { Problem, Accessory } from '../types/models';

const PROBLEMS_KEY = '@boulderlog_problems';
const ACCESSORIES_KEY = '@boulderlog_accessories';

// Set EXPO_PUBLIC_API_URL in a .env file at the project root to point this
// at your backend (e.g. https://your-codespace-3001.app.github.dev).
// The app works fine on local data alone if it's unset or unreachable.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function readLocal<T>(key: string): Promise<T[]> {
  const json = await AsyncStorage.getItem(key);
  return json ? JSON.parse(json) : [];
}

async function writeLocal<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

/**
 * Local-first pattern: read/write AsyncStorage immediately for instant UI,
 * then sync with the backend in the background. If the network call fails
 * (offline, backend not running, no API_URL set), the local copy stays
 * authoritative for the UI — nothing here throws or blocks on the network.
 */

// ---------- Problems ----------

export async function getProblems(): Promise<Problem[]> {
  const local = await readLocal<Problem>(PROBLEMS_KEY);
  if (API_URL) {
    fetch(`${API_URL}/api/problems`)
      .then(res => res.json())
      .then(result => {
        if (result.success) writeLocal(PROBLEMS_KEY, result.data);
      })
      .catch(() => {
        /* offline or backend unreachable — keep local copy */
      });
  }
  return local;
}

export async function addProblem(problem: Omit<Problem, '_id' | 'dateAdded'>): Promise<Problem> {
  const newProblem: Problem = {
    ...problem,
    _id: Date.now().toString(),
    dateAdded: new Date().toISOString(),
  };
  const current = await readLocal<Problem>(PROBLEMS_KEY);
  await writeLocal(PROBLEMS_KEY, [newProblem, ...current]);

  if (API_URL) {
    fetch(`${API_URL}/api/problems`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(problem),
    }).catch(() => {});
  }

  return newProblem;
}

export async function updateProblem(id: string, updates: Partial<Problem>): Promise<void> {
  const current = await readLocal<Problem>(PROBLEMS_KEY);
  const updated = current.map(p => (p._id === id ? { ...p, ...updates } : p));
  await writeLocal(PROBLEMS_KEY, updated);

  if (API_URL) {
    fetch(`${API_URL}/api/problems/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }
}

export async function deleteProblem(id: string): Promise<void> {
  const current = await readLocal<Problem>(PROBLEMS_KEY);
  await writeLocal(PROBLEMS_KEY, current.filter(p => p._id !== id));

  if (API_URL) {
    fetch(`${API_URL}/api/problems/${id}`, { method: 'DELETE' }).catch(() => {});
  }
}

// ---------- Accessories ----------

export async function getAccessories(): Promise<Accessory[]> {
  const local = await readLocal<Accessory>(ACCESSORIES_KEY);
  if (API_URL) {
    fetch(`${API_URL}/api/accessories`)
      .then(res => res.json())
      .then(result => {
        if (result.success) writeLocal(ACCESSORIES_KEY, result.data);
      })
      .catch(() => {});
  }
  return local;
}

export async function addAccessory(
  accessory: Omit<Accessory, '_id' | 'dateAdded'>
): Promise<Accessory> {
  const newAccessory: Accessory = {
    ...accessory,
    _id: Date.now().toString(),
    dateAdded: new Date().toISOString(),
  };
  const current = await readLocal<Accessory>(ACCESSORIES_KEY);
  await writeLocal(ACCESSORIES_KEY, [newAccessory, ...current]);

  if (API_URL) {
    fetch(`${API_URL}/api/accessories`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(accessory),
    }).catch(() => {});
  }

  return newAccessory;
}

export async function updateAccessory(id: string, updates: Partial<Accessory>): Promise<void> {
  const current = await readLocal<Accessory>(ACCESSORIES_KEY);
  const updated = current.map(a => (a._id === id ? { ...a, ...updates } : a));
  await writeLocal(ACCESSORIES_KEY, updated);

  if (API_URL) {
    fetch(`${API_URL}/api/accessories/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }
}

export async function deleteAccessory(id: string): Promise<void> {
  const current = await readLocal<Accessory>(ACCESSORIES_KEY);
  await writeLocal(ACCESSORIES_KEY, current.filter(a => a._id !== id));

  if (API_URL) {
    fetch(`${API_URL}/api/accessories/${id}`, { method: 'DELETE' }).catch(() => {});
  }
}

// ---------- Derived stats (Home screen stats strip) ----------

export function computeStats(problems: Problem[]) {
  const total = problems.length;
  const sentCount = problems.filter(p => p.status === 'sent').length;
  const sendRate = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekCount = problems.filter(p => new Date(p.dateAdded) >= oneWeekAgo).length;

  return { total, sendRate, thisWeekCount };
}
