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

const API_BASE = "http://127.0.0.1:8080";

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [text, setText] = useState("I feel tired before my shift");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [sentRecordingUrl, setSentRecordingUrl] = useState("");

  const [lastResponse, setLastResponse] = useState<SessionMessageResponse | null>(null);
  const [replyAudioUrl, setReplyAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");

  const replyAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const canSendText = useMemo(
    () => sessionId.trim().length > 0 && text.trim().length > 0,
    [sessionId, text]
  );

  const selectedAudioAvailable = useMemo(
    () => sessionId.trim().length > 0 && !!audioFile,
    [sessionId, audioFile]
  );

  const recordedAudioAvailable = useMemo(
    () => sessionId.trim().length > 0 && !!recordedBlob,
    [sessionId, recordedBlob]
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

  async function startSession() {
    setLoading(true);
    setError("");
    setLastResponse(null);
    clearReplyAudio();

    try {
      const response = await fetch(`${API_BASE}/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: "{}"
      });

      const data = (await response.json()) as SessionStartResponse;
      setSessionId(data.sessionId);
      setCreatedAt(data.createdAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          text
        })
      });

      const data = (await response.json()) as SessionMessageResponse;
      setLastResponse(data);
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
        body: form
      });

      const data = (await response.json()) as SessionMessageResponse;
      setLastResponse(data);
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

      setTimeout(() => {
        replyAudioRef.current?.play().catch(() => {
          // ignore autoplay failure
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
        <h2>2. Session</h2>
        <button onClick={startSession} disabled={loading}>
          Start session
        </button>

        <div className="field">
          <label>Session ID</label>
          <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
        </div>

        <div className="field">
          <label>Created At</label>
          <input value={createdAt} readOnly />
        </div>
      </section>

      <section className="card">
        <h2>3. Text message</h2>
        <div className="field">
          <label>Message</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </div>

        <button onClick={sendText} disabled={!canSendText || loading || isRecording}>
          Send text
        </button>
      </section>

      <section className="card">
        <h2>4. Upload audio file</h2>
        <input
          type="file"
          accept=".wav,.mp3,.m4a,.webm,.ogg"
          onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
        />

        <div className="button-row">
          <button
            onClick={sendSelectedAudioTextOnly}
            disabled={!selectedAudioAvailable || loading || isRecording}
          >
            Send file (text reply)
          </button>

          <button
            onClick={sendSelectedAudioWithVoice}
            disabled={!selectedAudioAvailable || loading || isRecording}
          >
            Send file (voice reply)
          </button>
        </div>
      </section>

      <section className="card">
        <h2>5. Live microphone recording</h2>

        <div className="button-row">
          <button
            onClick={startRecording}
            disabled={!sessionId || loading || isRecording}
          >
            Start recording
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording}
          >
            Stop recording
          </button>

          <button
            onClick={sendRecordedAudioWithVoice}
            disabled={!recordedAudioAvailable || loading || isRecording}
          >
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
        <h2>6. Result</h2>

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
    </div>
  );
}

export default App;