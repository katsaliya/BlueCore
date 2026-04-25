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

export { API_BASE_URL };
