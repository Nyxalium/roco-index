export type CollectionStatus = 'collected' | 'wanted';
export type Collection = Record<string, CollectionStatus>;
export const collectionKey = 'roco-index:collection:v1';

export function downloadJson(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseCollection(value: unknown): Collection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Choose a valid Roco Index collection file.');
  const entries = Object.entries(value);
  if (entries.some(([key, status]) => !/^[a-z0-9]{1,80}$/.test(key) || !['collected', 'wanted'].includes(String(status)))) {
    throw new Error('The collection contains invalid entries.');
  }
  return Object.fromEntries(entries) as Collection;
}

export function loadCollection(): { collection: Collection; error: string | null } {
  try {
    const saved = localStorage.getItem(collectionKey);
    return { collection: saved ? parseCollection(JSON.parse(saved)) : {}, error: null };
  } catch {
    return { collection: {}, error: 'Your collection could not be read from this browser. Changes may not be saved.' };
  }
}
