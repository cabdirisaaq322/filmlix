import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { BLOCKLISTED_MOVIE_IDS } from './tmdb';

export interface BlockedRecord {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  reason: string;
  is_blocked: boolean;
  active: boolean; // active === is_blocked
  status: 'hidden' | 'visible'; // 'hidden' if blocked, 'visible' if unblocked
  createdAt: number;
  updatedAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'blocked-movies.json');

// Hardcoded default blocked titles (seeded on init if missing)
const SEED_BLOCKED: BlockedRecord[] = [
  {
    id: 'movie-64689',
    tmdbId: 64689,
    type: 'movie',
    title: 'A Serbian Film',
    poster_path: null,
    reason: 'Prohibited content',
    is_blocked: true,
    active: true,
    status: 'hidden',
    createdAt: 1730000000000,
    updatedAt: 1730000000000,
  },
  {
    id: 'movie-5038',
    tmdbId: 5038,
    type: 'movie',
    title: 'Waterworld',
    poster_path: null,
    reason: 'Copyright / Licensing',
    is_blocked: true,
    active: true,
    status: 'hidden',
    createdAt: 1730000000000,
    updatedAt: 1730000000000,
  },
  {
    id: 'movie-791523',
    tmdbId: 791523,
    type: 'movie',
    title: 'Wildwood',
    poster_path: null,
    reason: 'DMCA / Blocked',
    is_blocked: true,
    active: true,
    status: 'hidden',
    createdAt: 1730000000000,
    updatedAt: 1730000000000,
  },
];

let memoryCache: BlockedRecord[] | null = null;
let lastReadTime = 0;
const CACHE_TTL_MS = 1000; // 1s memory cache for fast SSR

async function ensureDb(): Promise<BlockedRecord[]> {
  const now = Date.now();
  if (memoryCache && now - lastReadTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  try {
    if (!fsSync.existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }

    if (!fsSync.existsSync(DB_FILE)) {
      await fs.writeFile(DB_FILE, JSON.stringify(SEED_BLOCKED, null, 2), 'utf-8');
      memoryCache = [...SEED_BLOCKED];
      lastReadTime = now;
      return memoryCache;
    }

    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      memoryCache = [...SEED_BLOCKED];
      await fs.writeFile(DB_FILE, JSON.stringify(memoryCache, null, 2), 'utf-8');
    } else {
      memoryCache = parsed.map((item: Partial<BlockedRecord> & { tmdbId: number }) => {
        const isBlocked = item.is_blocked !== undefined ? Boolean(item.is_blocked) : (item.active !== undefined ? Boolean(item.active) : true);
        return {
          id: item.id || `${item.type || 'movie'}-${item.tmdbId}`,
          tmdbId: Number(item.tmdbId),
          type: item.type === 'tv' ? 'tv' : 'movie',
          title: item.title || 'Untitled',
          poster_path: item.poster_path ?? null,
          reason: item.reason || '',
          is_blocked: isBlocked,
          active: isBlocked,
          status: isBlocked ? 'hidden' : 'visible',
          createdAt: item.createdAt || now,
          updatedAt: item.updatedAt || now,
        };
      });
    }
    lastReadTime = now;
    return memoryCache;
  } catch (err) {
    console.error('[server-blocklist] Error reading database:', err);
    return memoryCache || [...SEED_BLOCKED];
  }
}

async function persistDb(records: BlockedRecord[]): Promise<void> {
  memoryCache = records;
  lastReadTime = Date.now();
  try {
    if (!fsSync.existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(records, null, 2), 'utf-8');
    await fs.rename(tempFile, DB_FILE);
  } catch (err) {
    console.error('[server-blocklist] Error persisting database:', err);
    // Direct write fallback
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error('[server-blocklist] Fallback direct write failed:', writeErr);
      throw writeErr;
    }
  }
}

export async function getAllBlockedRecords(): Promise<BlockedRecord[]> {
  const records = await ensureDb();
  // Return sorted by updatedAt descending
  return [...records].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getActiveBlockedIds(): Promise<number[]> {
  const records = await ensureDb();
  return records
    .filter((r) => r.is_blocked && r.status !== 'visible')
    .map((r) => r.tmdbId);
}

export async function isTitleBlocked(tmdbId: number, type?: 'movie' | 'tv'): Promise<boolean> {
  const records = await ensureDb();
  return records.some((r) => {
    if (!r.is_blocked || r.status === 'visible') return false;
    if (r.tmdbId !== tmdbId) return false;
    if (type && r.type !== type) return false;
    return true;
  });
}

export async function addOrUpdateBlockedRecord(input: {
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path?: string | null;
  reason?: string;
  is_blocked?: boolean;
  status?: 'hidden' | 'visible';
}): Promise<BlockedRecord> {
  const records = await ensureDb();
  const now = Date.now();
  const tmdbId = Number(input.tmdbId);
  const type = input.type === 'tv' ? 'tv' : 'movie';
  const id = `${type}-${tmdbId}`;

  const isBlocked = input.is_blocked !== undefined ? Boolean(input.is_blocked) : true;
  const status: 'hidden' | 'visible' = input.status || (isBlocked ? 'hidden' : 'visible');

  const existingIdx = records.findIndex((r) => r.id === id || (r.tmdbId === tmdbId && r.type === type));

  let savedRecord: BlockedRecord;
  if (existingIdx >= 0) {
    savedRecord = {
      ...records[existingIdx],
      title: input.title || records[existingIdx].title,
      poster_path: input.poster_path !== undefined ? input.poster_path : records[existingIdx].poster_path,
      reason: input.reason !== undefined ? input.reason : records[existingIdx].reason,
      is_blocked: isBlocked,
      active: isBlocked,
      status,
      updatedAt: now,
    };
    records[existingIdx] = savedRecord;
  } else {
    savedRecord = {
      id,
      tmdbId,
      type,
      title: input.title,
      poster_path: input.poster_path ?? null,
      reason: input.reason || '',
      is_blocked: isBlocked,
      active: isBlocked,
      status,
      createdAt: now,
      updatedAt: now,
    };
    records.push(savedRecord);
  }

  await persistDb(records);
  return savedRecord;
}

export async function toggleBlockedRecord(
  idOrTmdbId: string | number,
  isBlocked: boolean
): Promise<BlockedRecord | null> {
  const records = await ensureDb();
  const now = Date.now();

  const record = records.find((r) =>
    r.id === String(idOrTmdbId) || r.tmdbId === Number(idOrTmdbId)
  );

  if (!record) {
    return null;
  }

  record.is_blocked = Boolean(isBlocked);
  record.active = Boolean(isBlocked);
  record.status = isBlocked ? 'hidden' : 'visible';
  record.updatedAt = now;

  await persistDb(records);
  return record;
}

export async function removeBlockedRecord(idOrTmdbId: string | number): Promise<boolean> {
  const records = await ensureDb();
  const initialLength = records.length;
  const filtered = records.filter(
    (r) => r.id !== String(idOrTmdbId) && r.tmdbId !== Number(idOrTmdbId)
  );

  if (filtered.length !== initialLength) {
    await persistDb(filtered);
    return true;
  }
  return false;
}

export async function getBlockedMovieIdsServer(): Promise<number[]> {
  try {
    const dbBlocked = await getActiveBlockedIds();
    const all = new Set<number>([...BLOCKLISTED_MOVIE_IDS, ...dbBlocked]);
    return Array.from(all);
  } catch (err) {
    console.error('[getBlockedMovieIdsServer] Error reading server blocklist:', err);
    return [...BLOCKLISTED_MOVIE_IDS];
  }
}

