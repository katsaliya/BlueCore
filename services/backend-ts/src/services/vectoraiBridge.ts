import { env } from "../config/env";

type InitBridgeRequest = {
  namespace?: string;
};

type UpsertBridgeRecord = {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
};

type UpsertBridgeRequest = {
  namespace?: string;
  records: UpsertBridgeRecord[];
};

type QueryBridgeRequest = {
  namespace?: string;
  text: string;
  topK?: number;
};

export async function initVectorAiBridge(payload: InitBridgeRequest) {
  const url = `${env.VECTORAI_BRIDGE_BASE_URL}/init`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  return {
    status: response.status,
    data
  };
}

export async function upsertVectorAiBridge(payload: UpsertBridgeRequest) {
  const url = `${env.VECTORAI_BRIDGE_BASE_URL}/upsert`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  return {
    status: response.status,
    data
  };
}

export async function queryVectorAiBridge(payload: QueryBridgeRequest) {
  const url = `${env.VECTORAI_BRIDGE_BASE_URL}/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  return {
    status: response.status,
    data
  };
}