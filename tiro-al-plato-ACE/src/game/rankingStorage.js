const RANKING_STORAGE_KEY = 'tiro-al-plato-ace-ranking';
const MAX_RANKING_ENTRIES = 5;
const DEFAULT_INITIALS = 'ACE';

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function normalizeInitials(initials) {
  const sanitizedInitials = String(initials ?? DEFAULT_INITIALS)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3);

  return sanitizedInitials.padEnd(3, 'A');
}

function normalizeEntry(entry, index = 0) {
  return {
    initials: normalizeInitials(entry?.initials),
    score: Math.max(0, Number(entry?.score) || 0),
    duration: Math.max(0, Number(entry?.duration) || 0),
    hits: Math.max(0, Number(entry?.hits) || 0),
    misses: Math.max(0, Number(entry?.misses) || 0),
    createdAt: Number(entry?.createdAt) || index
  };
}

function sortEntries(firstEntry, secondEntry) {
  if (secondEntry.score !== firstEntry.score) {
    return secondEntry.score - firstEntry.score;
  }

  if (firstEntry.duration !== secondEntry.duration) {
    return firstEntry.duration - secondEntry.duration;
  }

  if (secondEntry.hits !== firstEntry.hits) {
    return secondEntry.hits - firstEntry.hits;
  }

  if (firstEntry.misses !== secondEntry.misses) {
    return firstEntry.misses - secondEntry.misses;
  }

  return firstEntry.createdAt - secondEntry.createdAt;
}

export function getStoredRankingEntries() {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawEntries = storage.getItem(RANKING_STORAGE_KEY);

    if (!rawEntries) {
      return [];
    }

    const parsedEntries = JSON.parse(rawEntries);

    if (!Array.isArray(parsedEntries)) {
      return [];
    }

    return parsedEntries
      .map((entry, index) => normalizeEntry(entry, index))
      .sort(sortEntries)
      .slice(0, MAX_RANKING_ENTRIES);
  } catch {
    return [];
  }
}

export function saveRankingEntry(entry) {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  const rankingEntries = getStoredRankingEntries();
  const nextEntries = [
    ...rankingEntries,
    normalizeEntry({
      ...entry,
      createdAt: Date.now()
    }, rankingEntries.length)
  ]
    .sort(sortEntries)
    .slice(0, MAX_RANKING_ENTRIES);

  try {
    storage.setItem(RANKING_STORAGE_KEY, JSON.stringify(nextEntries));
  } catch {
    return rankingEntries;
  }

  return nextEntries;
}

export { DEFAULT_INITIALS, MAX_RANKING_ENTRIES };