const API_BASE_URL =
  (import.meta.env as { VITE_API_BASE_URL?: string }).VITE_API_BASE_URL ??
  "http://127.0.0.1:8080";

const AUTH_STORAGE_KEY = "bluecore.frontend.auth.v1";
const SESSION_STORAGE_KEY = "bluecore.frontend.session.v1";
const DEMO_PASSWORD = "pass1234";

export type AuthUser = {
  id: number;
  username: string;
  displayName: string | null;
  role: string;
};

export type BackendSession = {
  token: string;
  user: AuthUser;
  sessionId: string;
};

export type DependenciesHealthResponse = {
  ok: boolean;
  dependencies?: Array<{
    ok: boolean;
    name: string;
    detail: string;
  }>;
};

export type SessionMessageResponse = {
  ok: boolean;
  sessionId: string;
  reply?: string;
  transcript?: string;
  message?: string;
};

type AuthResponse = {
  ok: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
};

type SessionStartResponse = {
  ok: boolean;
  sessionId: string;
  createdAt: string;
  userId?: number | null;
  message?: string;
};

type StoredAuth = {
  username: string;
  password: string;
  token?: string;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeDemoUsername() {
  return `bluecore_${Math.random().toString(36).slice(2, 11)}`;
}

function getStoredAuth(): StoredAuth {
  const existing = readJson<StoredAuth>(AUTH_STORAGE_KEY);

  if (existing?.username && existing.password) {
    return existing;
  }

  const created = {
    username: makeDemoUsername(),
    password: DEMO_PASSWORD
  };
  writeJson(AUTH_STORAGE_KEY, created);
  return created;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok || (typeof data === "object" && data !== null && "ok" in data && data.ok === false)) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(data.message)
        : `Backend request failed with HTTP ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

async function register(stored: StoredAuth): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: stored.username,
      password: stored.password,
      displayName: "BlueCore Demo"
    })
  });
}

async function login(stored: StoredAuth): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: stored.username,
      password: stored.password
    })
  });
}

async function loadMe(token: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/me", {}, token);
}

async function authenticateDemoUser(): Promise<{ token: string; user: AuthUser }> {
  let stored = getStoredAuth();

  if (stored.token) {
    try {
      const data = await loadMe(stored.token);
      if (data.user) {
        return { token: stored.token, user: data.user };
      }
    } catch {
      stored = { username: stored.username, password: stored.password };
      writeJson(AUTH_STORAGE_KEY, stored);
    }
  }

  try {
    const data = await login(stored);
    if (data.token && data.user) {
      writeJson(AUTH_STORAGE_KEY, { ...stored, token: data.token });
      return { token: data.token, user: data.user };
    }
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
  }

  try {
    const data = await register(stored);
    if (data.token && data.user) {
      writeJson(AUTH_STORAGE_KEY, { ...stored, token: data.token });
      return { token: data.token, user: data.user };
    }
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 409) {
      throw error;
    }

    stored = {
      username: makeDemoUsername(),
      password: DEMO_PASSWORD
    };
    writeJson(AUTH_STORAGE_KEY, stored);
    const data = await register(stored);

    if (data.token && data.user) {
      writeJson(AUTH_STORAGE_KEY, { ...stored, token: data.token });
      return { token: data.token, user: data.user };
    }
  }

  throw new Error("Unable to authenticate with the backend");
}

export async function getBackendDependencies() {
  return request<DependenciesHealthResponse>("/health/dependencies");
}

export async function startSession(token: string) {
  const data = await request<SessionStartResponse>(
    "/session/start",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: "{}"
    },
    token
  );
  writeJson(SESSION_STORAGE_KEY, { sessionId: data.sessionId });
  return data.sessionId;
}

export async function bootstrapDemoSession(): Promise<BackendSession> {
  const auth = await authenticateDemoUser();
  const storedSession = readJson<{ sessionId?: string }>(SESSION_STORAGE_KEY);
  const sessionId = storedSession?.sessionId ?? await startSession(auth.token);

  return {
    token: auth.token,
    user: auth.user,
    sessionId
  };
}

export async function resetStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function sendSessionMessage(
  token: string,
  sessionId: string,
  text: string
) {
  return request<SessionMessageResponse>(
    "/session/message",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId,
        text
      })
    },
    token
  );
}

export async function sendSessionAudioMessage(
  token: string,
  sessionId: string,
  file: File
) {
  const form = new FormData();
  form.append("sessionId", sessionId);
  form.append("file", file);

  return request<SessionMessageResponse>(
    "/session/message/audio",
    {
      method: "POST",
      body: form
    },
    token
  );
}

// ─── Document types ───────────────────────────────────────────────────────────

export type DocumentTemplate = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  schemaJson: string;
  createdAt: string;
};

export type DocumentField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  prompt?: string;
  value?: string | null;
  source?: string | null;
  confidence?: number | null;
  updatedAt?: string | null;
};

export type DocumentOutput = {
  id: number;
  documentRunId: number;
  outputType: string;
  outputMode: string;
  mimeType: string;
  filePath: string;
  createdAt: string;
};

export type DocumentState = {
  ok: boolean;
  document: {
    id: number;
    userId: number;
    sessionId: string | null;
    templateId: number;
    status: string;
    title: string;
    createdAt: string;
    completedAt: string | null;
  };
  template: { id: number; code: string; name: string; description: string | null };
  fields: DocumentField[];
  missingRequiredFields: string[];
  completionPercent: number;
  currentField: DocumentField | null;
  nextQuestion: string | null;
  isReadyForPdf: boolean;
  readyForReview: boolean;
  reviewSummary: Array<{ label: string; value: string | null; required: boolean }>;
  nextAction: string;
  outputs: DocumentOutput[];
  transcript?: string | null;
};

// ─── Document API ─────────────────────────────────────────────────────────────

export async function getDocumentTemplates(token: string) {
  return request<{ ok: boolean; templates: DocumentTemplate[] }>(
    "/document-templates", {}, token
  );
}

export async function createDocument(
  token: string,
  templateCode: string,
  title: string,
  sessionId?: string
) {
  return request<DocumentState>(
    "/documents",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateCode, title, sessionId: sessionId ?? null })
    },
    token
  );
}

export async function getDocument(token: string, documentId: number) {
  return request<DocumentState>(`/documents/${documentId}`, {}, token);
}

export async function updateDocumentField(
  token: string,
  documentId: number,
  fieldName: string,
  fieldValue: string,
  source = "profile",
  confidence = 1
) {
  return request<DocumentState>(
    `/documents/${documentId}/fields`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fieldName, fieldValue, source, confidence })
    },
    token
  );
}

export async function respondToDocument(token: string, documentId: number, text: string) {
  return request<DocumentState>(
    `/documents/${documentId}/respond`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    },
    token
  );
}

export async function respondToDocumentAudio(token: string, documentId: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<DocumentState>(
    `/documents/${documentId}/respond/audio`,
    { method: "POST", body: form },
    token
  );
}

export async function exportDocumentDraft(token: string, documentId: number) {
  return request<{ ok: boolean; output: DocumentOutput }>(
    `/documents/${documentId}/export/pdf`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "draft" })
    },
    token
  );
}

export async function openDocumentPreview(token: string, documentId: number) {
  const { output } = await exportDocumentDraft(token, documentId);
  const response = await fetch(`${API_BASE_URL}/document-outputs/${output.id}/download`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Preview failed: HTTP ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function finalizeDocument(token: string, documentId: number) {
  return request<DocumentState & { output?: DocumentOutput }>(
    `/documents/${documentId}/finalize`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
    token
  );
}

export async function downloadDocumentOutput(token: string, outputId: number, filename: string) {
  const response = await fetch(`${API_BASE_URL}/document-outputs/${outputId}/download`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export { API_BASE_URL };
