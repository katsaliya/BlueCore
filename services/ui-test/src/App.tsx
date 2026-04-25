import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type HealthResponse = {
  ok: boolean;
  dependencies?: Array<{
    ok: boolean;
    name: string;
    detail: string;
  }>;
};

type SessionStartResponse = {
  ok: boolean;
  sessionId: string;
  createdAt: string;
  userId?: number | null;
  message?: string;
};

type SessionMessageResponse = {
  ok: boolean;
  sessionId: string;
  reply?: string;
  transcript?: string;
  transcriptLanguage?: string;
  transcriptDuration?: number;
  retrievedMatches?: Array<{
    id: string;
    score: number;
    text: string;
    metadata?: Record<string, unknown>;
  }>;
  historyLength?: number;
  message?: string;
};

type SessionHistoryResponse = {
  ok: boolean;
  sessionId: string;
  createdAt: string;
  history: Array<{
    role: "user" | "assistant";
    text: string;
    timestamp: string;
  }>;
  message?: string;
};

type SessionListResponse = {
  ok: boolean;
  sessions: Array<{
    sessionId: string;
    userId: number | null;
    createdAt: string;
    messageCount: number;
    lastMessageAt: string | null;
  }>;
  message?: string;
};

type AuthUser = {
  id: number;
  username: string;
  displayName: string | null;
  role: string;
};

type AuthResponse = {
  ok: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
};

const API_BASE = "http://127.0.0.1:8080";

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const [username, setUsername] = useState("sailor1");
  const [password, setPassword] = useState("pass1234");
  const [displayName, setDisplayName] = useState("Demo Sailor");

  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [sessionId, setSessionId] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [text, setText] = useState("I feel tired before my shift");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [sentRecordingUrl, setSentRecordingUrl] = useState("");

  const [lastResponse, setLastResponse] = useState<SessionMessageResponse | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryResponse | null>(null);
  const [mySessions, setMySessions] = useState<SessionListResponse["sessions"]>([]);
  const [replyAudioUrl, setReplyAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");

  const replyAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const isLoggedIn = useMemo(() => !!token && !!currentUser, [token, currentUser]);

  const canSendText = useMemo(
    () => isLoggedIn && sessionId.trim().length > 0 && text.trim().length > 0,
    [isLoggedIn, sessionId, text]
  );

  const selectedAudioAvailable = useMemo(
    () => isLoggedIn && sessionId.trim().length > 0 && !!audioFile,
    [isLoggedIn, sessionId, audioFile]
  );

  const recordedAudioAvailable = useMemo(
    () => isLoggedIn && sessionId.trim().length > 0 && !!recordedBlob,
    [isLoggedIn, sessionId, recordedBlob]
  );

  useEffect(() => {
    return () => {
      if (replyAudioUrl) URL.revokeObjectURL(replyAudioUrl);
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      if (sentRecordingUrl) URL.revokeObjectURL(sentRecordingUrl);

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [replyAudioUrl, recordingUrl, sentRecordingUrl]);

  function authHeaders(extra?: Record<string, string>) {
    return {
      ...(extra ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  function clearReplyAudio() {
    if (replyAudioUrl) {
      URL.revokeObjectURL(replyAudioUrl);
      setReplyAudioUrl("");
    }
  }

  function setStableSentRecording(urlSource: string) {
    if (sentRecordingUrl) {
      URL.revokeObjectURL(sentRecordingUrl);
    }
    setSentRecordingUrl(urlSource);
  }

  async function checkHealth() {
    setError("");
    try {
      const response = await fetch(`${API_BASE}/health/dependencies`);
      const data = (await response.json()) as HealthResponse;
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load health");
    }
  }

  async function registerUser() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password,
          displayName
        })
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.ok || !data.token || !data.user) {
        throw new Error(data.message || "Register failed");
      }

      setToken(data.token);
      setCurrentUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  async function loginUser() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.ok || !data.token || !data.user) {
        throw new Error(data.message || "Login failed");
      }

      setToken(data.token);
      setCurrentUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  async function loadMe() {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: authHeaders()
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.ok || !data.user) {
        throw new Error(data.message || "Failed to load current user");
      }

      setCurrentUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load current user");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setCurrentUser(null);
    setSessionId("");
    setCreatedAt("");
    setLastResponse(null);
    setSessionHistory(null);
    setMySessions([]);
    clearReplyAudio();
  }

  async function loadMySessions() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/sessions`, {
        method: "GET",
        headers: authHeaders()
      });

      const data = (await response.json()) as SessionListResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to load sessions");
      }

      setMySessions(data.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }

  async function startSession() {
    setLoading(true);
    setError("");
    setLastResponse(null);
    setSessionHistory(null);
    clearReplyAudio();

    try {
      const response = await fetch(`${API_BASE}/session/start`, {
        method: "POST",
        headers: authHeaders({
          "Content-Type": "application/json"
        }),
        body: "{}"
      });

      const data = (await response.json()) as SessionStartResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to start session");
      }

      setSessionId(data.sessionId);
      setCreatedAt(data.createdAt);
      await loadMySessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(targetSessionId?: string) {
    const activeSessionId = targetSessionId || sessionId;
    if (!activeSessionId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/session/history?sessionId=${encodeURIComponent(activeSessionId)}`,
        {
          method: "GET",
          headers: authHeaders()
        }
      );

      const data = (await response.json()) as SessionHistoryResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to load history");
      }

      setSessionId(data.sessionId);
      setCreatedAt(data.createdAt);
      setSessionHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  async function sendText() {
    setLoading(true);
    setError("");
    setLastResponse(null);
    clearReplyAudio();

    try {
      const response = await fetch(`${API_BASE}/session/message`, {
        method: "POST",
        headers: authHeaders({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          sessionId,
          text
        })
      });

      const data = (await response.json()) as SessionMessageResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to send text");
      }

      setLastResponse(data);
      await loadHistory(sessionId);
      await loadMySessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send text");
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      const preferredMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus"
      ];

      const mimeType =
        preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(recordedChunksRef.current, { type: finalMimeType });
        setRecordedBlob(blob);

        if (recordingUrl) {
          URL.revokeObjectURL(recordingUrl);
        }

        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start recording");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    setIsRecording(false);
  }

  async function sendAudioTextOnly(file: File) {
    setLoading(true);
    setError("");
    setLastResponse(null);
    clearReplyAudio();

    try {
      const form = new FormData();
      form.append("sessionId", sessionId);
      form.append("file", file);

      const response = await fetch(`${API_BASE}/session/message/audio`, {
        method: "POST",
        headers: authHeaders(),
        body: form
      });

      const data = (await response.json()) as SessionMessageResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to send audio");
      }

      setLastResponse(data);
      await loadHistory(sessionId);
      await loadMySessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send audio");
    } finally {
      setLoading(false);
    }
  }

  async function sendAudioWithReplyVoice(file: File, userAudioUrlToKeep?: string) {
    setLoading(true);
    setError("");
    setLastResponse(null);
    clearReplyAudio();

    try {
      const form = new FormData();
      form.append("sessionId", sessionId);
      form.append("file", file);

      const response = await fetch(`${API_BASE}/session/message/audio/reply-audio`, {
        method: "POST",
        headers: authHeaders(),
        body: form
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const transcriptHeader = response.headers.get("X-GreenWatch-Transcript");
      const replyHeader = response.headers.get("X-GreenWatch-Reply");

      const transcript = transcriptHeader ? decodeURIComponent(transcriptHeader) : "";
      const reply = replyHeader ? decodeURIComponent(replyHeader) : "";

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      if (userAudioUrlToKeep) {
        setStableSentRecording(userAudioUrlToKeep);
      }

      setReplyAudioUrl(objectUrl);
      setLastResponse({
        ok: true,
        sessionId,
        transcript,
        reply
      });

      await loadHistory(sessionId);
      await loadMySessions();

      setTimeout(() => {
        replyAudioRef.current?.play().catch(() => {
        });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send audio for voice reply");
    } finally {
      setLoading(false);
    }
  }

  async function sendSelectedAudioTextOnly() {
    if (!audioFile) return;
    await sendAudioTextOnly(audioFile);
  }

  async function sendSelectedAudioWithVoice() {
    if (!audioFile) return;
    const localUrl = URL.createObjectURL(audioFile);
    await sendAudioWithReplyVoice(audioFile, localUrl);
  }

  async function sendRecordedAudioWithVoice() {
    if (!recordedBlob) return;

    const extension =
      recordedBlob.type.includes("mp4")
        ? "m4a"
        : recordedBlob.type.includes("ogg")
        ? "ogg"
        : "webm";

    const file = new File([recordedBlob], `recording.${extension}`, {
      type: recordedBlob.type || "audio/webm"
    });

    const stableUserAudioUrl = URL.createObjectURL(recordedBlob);
    await sendAudioWithReplyVoice(file, stableUserAudioUrl);
  }

  return (
    <div className="app-shell">
      <h1>GreenWatch Test UI</h1>

      <section className="card">
        <h2>1. Health</h2>
        <button onClick={checkHealth} disabled={loading}>
          Check backend dependencies
        </button>
        {health && <pre>{JSON.stringify(health, null, 2)}</pre>}
      </section>

      <section className="card">
        <h2>2. User auth</h2>

        <div className="field">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="field">
          <label>Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div className="button-row">
          <button onClick={registerUser} disabled={loading}>Register</button>
          <button onClick={loginUser} disabled={loading}>Login</button>
          <button onClick={loadMe} disabled={!token || loading}>Load me</button>
          <button onClick={logout} disabled={!token || loading}>Logout</button>
        </div>

        {currentUser && (
          <pre>{JSON.stringify({ tokenPresent: !!token, user: currentUser }, null, 2)}</pre>
        )}
      </section>

      <section className="card">
        <h2>3. Sessions</h2>
        <div className="button-row">
          <button onClick={startSession} disabled={!isLoggedIn || loading}>
            Start session
          </button>
          <button onClick={loadMySessions} disabled={!isLoggedIn || loading}>
            Load my sessions
          </button>
          <button onClick={() => loadHistory()} disabled={!isLoggedIn || !sessionId || loading}>
            Load current session history
          </button>
        </div>

        <div className="field">
          <label>Session ID</label>
          <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
        </div>

        <div className="field">
          <label>Created At</label>
          <input value={createdAt} readOnly />
        </div>

        {mySessions.length > 0 && (
          <div className="field">
            <label>My sessions</label>
            <div className="session-list">
              {mySessions.map((session) => (
                <button
                  key={session.sessionId}
                  className="session-item"
                  onClick={() => loadHistory(session.sessionId)}
                  disabled={loading}
                >
                  <div><strong>{session.sessionId}</strong></div>
                  <div>Created: {session.createdAt}</div>
                  <div>Messages: {session.messageCount}</div>
                  <div>Last activity: {session.lastMessageAt || "No messages yet"}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h2>4. Text message</h2>
        <div className="field">
          <label>Message</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        </div>

        <button onClick={sendText} disabled={!canSendText || loading || isRecording}>
          Send text
        </button>
      </section>

      <section className="card">
        <h2>5. Upload audio file</h2>
        <input
          type="file"
          accept=".wav,.mp3,.m4a,.webm,.ogg"
          onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
        />

        <div className="button-row">
          <button onClick={sendSelectedAudioTextOnly} disabled={!selectedAudioAvailable || loading || isRecording}>
            Send file (text reply)
          </button>

          <button onClick={sendSelectedAudioWithVoice} disabled={!selectedAudioAvailable || loading || isRecording}>
            Send file (voice reply)
          </button>
        </div>
      </section>

      <section className="card">
        <h2>6. Live microphone recording</h2>

        <div className="button-row">
          <button onClick={startRecording} disabled={!isLoggedIn || !sessionId || loading || isRecording}>
            Start recording
          </button>

          <button onClick={stopRecording} disabled={!isRecording}>
            Stop recording
          </button>

          <button onClick={sendRecordedAudioWithVoice} disabled={!recordedAudioAvailable || loading || isRecording}>
            Send recording (voice reply)
          </button>
        </div>

        <p>Status: {isRecording ? "Recording..." : "Idle"}</p>

        {recordingUrl && (
          <div className="field">
            <label>Recorded audio preview</label>
            <audio controls src={recordingUrl} />
          </div>
        )}

        {sentRecordingUrl && (
          <div className="field">
            <label>Your sent recording</label>
            <audio controls src={sentRecordingUrl} />
          </div>
        )}
      </section>

      <section className="card">
        <h2>7. Result</h2>

        {loading && <p>Working...</p>}
        {error && <p className="error">{error}</p>}
        {lastResponse && <pre>{JSON.stringify(lastResponse, null, 2)}</pre>}

        {replyAudioUrl && (
          <div className="field">
            <label>Reply audio</label>
            <audio ref={replyAudioRef} controls src={replyAudioUrl} />
          </div>
        )}
      </section>

      <section className="card">
        <h2>8. Loaded session history</h2>

        {sessionHistory ? (
          <pre>{JSON.stringify(sessionHistory, null, 2)}</pre>
        ) : (
          <p>No history loaded yet.</p>
        )}
      </section>
    </div>
  );
}

export default App;