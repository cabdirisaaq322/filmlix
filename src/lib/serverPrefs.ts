/**
 * Remembers which streaming server last worked for a given title/episode so the
 * player can auto-select it on future visits instead of always starting on the
 * same (possibly failing) default server.
 *
 * Values are stored per title+episode and validated against the provider ids so
 * a stale/unknown id never breaks the player (we fall back to the default).
 */

const STORAGE_KEY = 'sf:server-prefs';
const MAX_ENTRIES = 60;

type ServerPrefs = Record<string, string>;

function readAll(): ServerPrefs {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as ServerPrefs) : {};
  } catch {
    return {};
  }
}

function buildKey(type: string, tmdbId: number, season: number, episode: number): string {
  return `${type}:${tmdbId}:${season}:${episode}`;
}

/** Get the remembered provider id for a title, or null if none/unknown. */
export function getPreferredServer(
  type: string,
  tmdbId: number,
  season: number,
  episode: number,
  validIds: string[]
): string | null {
  const stored = readAll()[buildKey(type, tmdbId, season, episode)];
  return stored && validIds.includes(stored) ? stored : null;
}

/** Remember the provider that worked for a title. Prunes oldest entries. */
export function setPreferredServer(
  type: string,
  tmdbId: number,
  season: number,
  episode: number,
  providerId: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const prefs = readAll();
    const key = buildKey(type, tmdbId, season, episode);
    // Re-insert so JSON.stringify order reflects recency (insertion order for string keys)
    delete prefs[key];
    prefs[key] = providerId;
    const keys = Object.keys(prefs);
    while (keys.length > MAX_ENTRIES) {
      const oldest = keys.shift();
      if (oldest) delete prefs[oldest];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore quota/private-mode errors — preference is a nicety, not required.
  }
}
