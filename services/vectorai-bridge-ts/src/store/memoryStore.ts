export type MemoryRecord = {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
};

const store = new Map<string, MemoryRecord[]>();

function getNamespaceKey(namespace?: string): string {
  return namespace && namespace.trim().length > 0 ? namespace.trim() : "default";
}

export function initNamespace(namespace?: string) {
  const key = getNamespaceKey(namespace);

  if (!store.has(key)) {
    store.set(key, []);
  }

  return key;
}

export function upsertRecords(
  namespace: string | undefined,
  records: MemoryRecord[]
): number {
  const key = initNamespace(namespace);
  const existing = store.get(key) ?? [];

  for (const record of records) {
    const index = existing.findIndex((item) => item.id === record.id);

    if (index >= 0) {
      existing[index] = record;
    } else {
      existing.push(record);
    }
  }

  store.set(key, existing);
  return records.length;
}

export function queryRecords(
  namespace: string | undefined,
  text: string,
  topK: number = 5
) {
  const key = getNamespaceKey(namespace);
  const existing = store.get(key) ?? [];
  const needle = text.trim().toLowerCase();

  const matches = existing
    .filter((record) => record.text.toLowerCase().includes(needle))
    .map((record) => ({
      id: record.id,
      score: 1,
      text: record.text,
      metadata: record.metadata
    }))
    .slice(0, topK);

  return matches;
}