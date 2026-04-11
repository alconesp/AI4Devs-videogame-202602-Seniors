const RANKING_STORAGE_KEY = 'tiro-al-plato-ace-ranking';
const MAX_RANKING_ENTRIES = 10;
const DEFAULT_INITIALS = 'ACE';
const DEFAULT_RANKING_INITIALS = 'CPU';
const DEFAULT_RANKING_TOP_SCORE = 500;
const DEFAULT_RANKING_SCORE_STEP = 50;

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

function createDefaultEntry(index) {
  return {
    initials: DEFAULT_RANKING_INITIALS,
    score: Math.max(0, DEFAULT_RANKING_TOP_SCORE - (index * DEFAULT_RANKING_SCORE_STEP)),
    duration: 0,
    hits: 0,
    misses: 0,
    createdAt: -(MAX_RANKING_ENTRIES - index),
    isDefault: true
  };
}

function buildDefaultRankingEntries() {
  return Array.from({ length: MAX_RANKING_ENTRIES }, (_, index) => createDefaultEntry(index));
}

function normalizeEntry(entry, index = 0) {
  return {
    initials: normalizeInitials(entry?.initials),
    score: Math.max(0, Number(entry?.score) || 0),
    duration: Math.max(0, Number(entry?.duration) || 0),
    hits: Math.max(0, Number(entry?.hits) || 0),
    misses: Math.max(0, Number(entry?.misses) || 0),
    createdAt: Number(entry?.createdAt) || index,
    isDefault: Boolean(entry?.isDefault)
  };
}

function sortEntries(firstEntry, secondEntry) {
  if (secondEntry.score !== firstEntry.score) {
    return secondEntry.score - firstEntry.score;
  }

  if (secondEntry.createdAt !== firstEntry.createdAt) {
    return secondEntry.createdAt - firstEntry.createdAt;
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

  return 0;
}

function parseStoredEntries(rawEntries) {
  if (!rawEntries) {
    return [];
  }

  try {
    const parsedEntries = JSON.parse(rawEntries);

    if (!Array.isArray(parsedEntries)) {
      return [];
    }

    return parsedEntries;
  } catch {
    return [];
  }
}

function buildRankingEntries(entries) {
  return [...entries, ...buildDefaultRankingEntries()]
    .map((entry, index) => normalizeEntry(entry, index))
    .sort(sortEntries)
    .slice(0, MAX_RANKING_ENTRIES);
}

function persistRankingEntries(storage, entries) {
  const serializedEntries = JSON.stringify(entries);

  try {
    storage.setItem(RANKING_STORAGE_KEY, serializedEntries);
  } catch {
    return false;
  }

  return true;
}

export function getStoredRankingEntries() {
  const storage = getStorage();
  const fallbackEntries = buildDefaultRankingEntries();

  if (!storage) {
    return fallbackEntries;
  }

  const rawEntries = storage.getItem(RANKING_STORAGE_KEY);
  const rankingEntries = buildRankingEntries(parseStoredEntries(rawEntries));

  if (JSON.stringify(rankingEntries) !== rawEntries) {
    const hasPersistedEntries = persistRankingEntries(storage, rankingEntries);

    if (!hasPersistedEntries) {
      return fallbackEntries;
    }
  }

  return rankingEntries;
}

export function wouldScoreEnterRanking(score) {
  const normalizedScore = Math.max(0, Number(score) || 0);
  const rankingEntries = getStoredRankingEntries();

  if (rankingEntries.length < MAX_RANKING_ENTRIES) {
    return true;
  }

  const cutoffEntry = rankingEntries[MAX_RANKING_ENTRIES - 1];

  if (!cutoffEntry) {
    return true;
  }

  return normalizedScore >= cutoffEntry.score;
}

export function saveRankingEntry(entry) {
  const storage = getStorage();
  const fallbackEntries = buildDefaultRankingEntries();

  if (!storage) {
    return buildRankingEntries([
      ...fallbackEntries,
      normalizeEntry({
        ...entry,
        createdAt: Date.now(),
        isDefault: false
      }, fallbackEntries.length)
    ]);
  }

  const rankingEntries = getStoredRankingEntries();
  const nextEntries = buildRankingEntries([
    ...rankingEntries,
    normalizeEntry({
      ...entry,
      createdAt: Date.now(),
      isDefault: false
    }, rankingEntries.length)
  ]);

  if (!persistRankingEntries(storage, nextEntries)) {
    return rankingEntries;
  }

  return nextEntries;
}

export { DEFAULT_INITIALS, MAX_RANKING_ENTRIES };