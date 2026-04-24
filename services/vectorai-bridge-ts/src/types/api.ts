export type InitRequest = {
  namespace?: string;
};

export type InitResponse = {
  ok: boolean;
  message: string;
};

export type UpsertRecord = {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
};

export type UpsertRequest = {
  namespace?: string;
  records: UpsertRecord[];
};

export type UpsertResponse = {
  ok: boolean;
  insertedCount: number;
  message: string;
};

export type QueryRequest = {
  namespace?: string;
  text: string;
  topK?: number;
};

export type QueryMatch = {
  id: string;
  score: number;
  text: string;
  metadata?: Record<string, unknown>;
};

export type QueryResponse = {
  ok: boolean;
  matches: QueryMatch[];
  message: string;
};