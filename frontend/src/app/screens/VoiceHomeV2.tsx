import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { useNavigate } from "react-router";
import { Mic, ChevronRight, FileText, Play, Grid, Home, Compass, Archive, User, Sun, Moon } from "lucide-react";
import { currentUser } from "../data/mockData";
import { useTheme } from "../contexts/ThemeContext";
import {
  ApiError,
  bootstrapDemoSession,
  getBackendDependencies,
  resetStoredSession,
  sendSessionAudioMessage,
  sendSessionMessage,
  startSession,
} from "../api/bluecoreApi";
import type { BackendSession } from "../api/bluecoreApi";

// ─── Context detection ────────────────────────────────────────────────────────
function getShiftContext(): {
  mode: "break" | "on-shift" | "off-shift";
  greeting: string;
  followUp: string;
} {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMin = h * 60 + m;
  const breakStart = 12 * 60;
  const breakEnd = 13 * 60 + 30;
  const shiftStart = 6 * 60;
  const shiftEnd = 18 * 60;

  if (totalMin >= breakStart && totalMin < breakEnd) {
    return {
      mode: "break",
      greeting: `Hey ${currentUser.nickname} 👋`,
      followUp: "How did your morning watch go? And are you looking for someone to grab lunch with?",
    };
  } else if (totalMin >= shiftStart && totalMin < shiftEnd) {
    return {
      mode: "on-shift",
      greeting: `Hey ${currentUser.nickname}`,
      followUp: "Just checking in — everything going okay up there?",
    };
  } else {
    return {
      mode: "off-shift",
      greeting: `Evening, ${currentUser.nickname}`,
      followUp: "Watch is over for the day. How are you feeling? How did it all go?",
    };
  }
}

// ─── Simulated AI replies ─────────────────────────────────────────────────────
const breakReplies = [
  "Got it. Sounds like the morning had its moments. How are you feeling overall — tension in the shoulders, or more of a mental load?",
  "That tracks. Cargo ops always stretch longer than the paperwork suggests. You've still got a solid 80 minutes of break — want me to find someone to eat with?",
  "Noted. I'll flag that for your end-of-shift log. Right now though — have you eaten? And have you been outside at all today?",
  "Good to hear. You've been putting in consistent work this voyage. Elena and Marcus are both free right now if you want company. Same interests, same break window.",
];
const shiftReplies = [
  "Good to know. I'll keep checking the acoustic readings quietly. Just say 'BlueCore' any time you need me.",
  "Understood. Take your time — I'm here whenever. And if the workload starts building up, just let me know.",
  "Noted. You're doing well, Cal. Port approach is in a few hours — want me to prep a briefing summary for you?",
];
const offShiftReplies = [
  "Rest well then. I'll keep tonight's check-in light. You've done a full watch — that deserves some real downtime.",
  "That's fair. I picked up on some tension in your voice around midday — it passed, but I wanted you to know I noticed. Tomorrow's a new day.",
  "Sounds like a tough stretch. You've been at sea 18 days now — isolation compounds over time. I'm here if you want to talk it through.",
];

type Message = { role: "assistant" | "user"; text: string };
type BackendStatus = "connecting" | "ready" | "degraded" | "offline";

function getApiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown backend error";
}

function getRecordingExtension(mimeType: string) {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

function getPreferredRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

// ─── Acoustic amplitude simulator ────────────────────────────────────────────
function useAcousticAmplitude(state: "idle" | "listening" | "speaking") {
  const amp = useMotionValue(0);
  const smoothAmp = useSpring(amp, { stiffness: 60, damping: 10 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.04;
      let val = 0;
      if (state === "listening") {
        val =
          Math.abs(Math.sin(t * 3.1) * 0.5 + Math.sin(t * 7.3) * 0.3 + Math.sin(t * 11.7) * 0.2) *
          (0.5 + Math.random() * 0.5);
      } else if (state === "speaking") {
        val =
          Math.abs(Math.sin(t * 2.2) * 0.55 + Math.sin(t * 5.1) * 0.28 + Math.sin(t * 9.4) * 0.17) *
          (0.4 + Math.random() * 0.35);
      } else {
        val = Math.abs(Math.sin(t * 0.7) * 0.08);
      }
      amp.set(val);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [state, amp]);

  return smoothAmp;
}

// ─── Wireframe Orb — compact (160px) to fit bottom panel ─────────────────────
const ORB_CSS = 160;

function WireframeOrb({
  state,
  ampRef,
}: {
  state: "idle" | "listening" | "speaking";
  ampRef: React.RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = ORB_CSS + "px";
    canvas.style.height = ORB_CSS + "px";
    canvas.width = ORB_CSS * DPR;
    canvas.height = ORB_CSS * DPR;
    ctx.scale(DPR, DPR);

    const CX = ORB_CSS / 2;
    const CY = ORB_CSS / 2;
    const BASE_R = 46;
    const ROWS = 36;
    const COLS = 52;

    let time = 0;
    let rotX = 0;
    let rotY = 0;
    let frame: number;

    function noise(phi: number, theta: number, t: number): number {
      return (
        Math.sin(phi * 2.3 + t * 0.55) * 0.28 +
        Math.sin(theta * 3.7 + t * 0.42) * 0.22 +
        Math.sin(phi * 4.1 - theta * 2.8 + t * 0.78) * 0.18 +
        Math.sin(phi * 1.5 + theta * 5.2 + t * 0.31) * 0.14 +
        Math.sin(phi * 6.3 + theta * 1.4 - t * 0.63) * 0.10 +
        Math.sin(phi * 3.2 - theta * 4.1 + t * 0.88) * 0.08
      );
    }

    function rotatePoint(
      x: number, y: number, z: number, rx: number, ry: number
    ): [number, number, number] {
      const x1 = x * Math.cos(ry) + z * Math.sin(ry);
      const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
      const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      return [x1, y2, z2];
    }

    const draw = () => {
      ctx.clearRect(0, 0, ORB_CSS, ORB_CSS);
      const amp = ampRef.current ?? 0;
      const st = stateRef.current;

      const rotSpeed = st === "listening" ? 0.007 : st === "speaking" ? 0.005 : 0.0018;
      rotY += rotSpeed;
      rotX += rotSpeed * 0.4;
      time += st === "listening" ? 0.028 : st === "speaking" ? 0.020 : 0.008;

      const deformBase = st === "idle" ? 0.22 : st === "speaking" ? 0.38 : 0.52;
      const deform = deformBase + amp * 0.55;

      const pts: Array<[number, number, number]> = [];
      for (let i = 0; i <= ROWS; i++) {
        const phi = (i / ROWS) * Math.PI;
        for (let j = 0; j <= COLS; j++) {
          const theta = (j / COLS) * Math.PI * 2;
          const n = noise(phi, theta, time);
          const r = BASE_R * (1 + n * deform);
          const x0 = r * Math.sin(phi) * Math.cos(theta);
          const y0 = r * Math.sin(phi) * Math.sin(theta);
          const z0 = r * Math.cos(phi);
          const [x, y, z] = rotatePoint(x0, y0, z0, rotX, rotY);
          pts.push([x, y, z]);
        }
      }

      const idx = (i: number, j: number) => i * (COLS + 1) + j;

      const orbR = st === "listening" ? 79 : 37;
      const orbG = st === "listening" ? 195 : 70;
      const orbB = st === "listening" ? 247 : 127;

      const lineColor = (z: number, baseAlpha: number) => {
        const depth = (z + BASE_R * 1.8) / (BASE_R * 3.6);
        const a = baseAlpha * (0.25 + depth * 0.75);
        return `rgba(${orbR},${orbG},${orbB},${Math.min(a, 1).toFixed(3)})`;
      };

      for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        let started = false;
        for (let j = 0; j <= COLS; j++) {
          const [x, y, z] = pts[idx(i, j)];
          if (!started) { ctx.moveTo(CX + x, CY + y); started = true; }
          else ctx.lineTo(CX + x, CY + y);
        }
        ctx.strokeStyle = lineColor(pts[idx(i, 0)][2], 0.55);
        ctx.lineWidth = 0.45;
        ctx.stroke();
      }
      for (let j = 0; j <= COLS; j++) {
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= ROWS; i++) {
          const [x, y, z] = pts[idx(i, j)];
          if (!started) { ctx.moveTo(CX + x, CY + y); started = true; }
          else ctx.lineTo(CX + x, CY + y);
        }
        ctx.strokeStyle = lineColor(pts[idx(ROWS / 2, j)][2], 0.45);
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          const [x1, y1, z1] = pts[idx(i, j)];
          const [x2, y2, z2] = pts[idx(i + 1, j + 1 <= COLS ? j + 1 : 0)];
          ctx.beginPath();
          ctx.moveTo(CX + x1, CY + y1);
          ctx.lineTo(CX + x2, CY + y2);
          ctx.strokeStyle = lineColor((z1 + z2) / 2, 0.22);
          ctx.lineWidth = 0.35;
          ctx.stroke();
        }
      }
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j += 2) {
          const [x1, y1, z1] = pts[idx(i + 1, j)];
          const [x2, y2, z2] = pts[idx(i, j + 1 <= COLS ? j + 1 : 0)];
          ctx.beginPath();
          ctx.moveTo(CX + x1, CY + y1);
          ctx.lineTo(CX + x2, CY + y2);
          ctx.strokeStyle = lineColor((z1 + z2) / 2, 0.15);
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function VoiceHomeV2() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const ctx = getShiftContext();

  const [orbState, setOrbState] = useState<"idle" | "listening" | "speaking">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("connecting");
  const [backendIssue, setBackendIssue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backendSessionRef = useRef<BackendSession | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const amp = useAcousticAmplitude(orbState);
  const ampRef = useRef<number>(0);
  useEffect(() => {
    return amp.on("change", (v) => { ampRef.current = v; });
  }, [amp]);

  const sampleVoiceText = useCallback(() => {
    const samples =
      ctx.mode === "break"
        ? [
            "Yeah it was a busy one honestly, cargo inspection overran.",
            "Looking to grab lunch with someone if anyone's free.",
            "Could use some company actually.",
          ]
        : ctx.mode === "on-shift"
          ? [
              "Bit hectic up on the bridge today.",
              "Everything is fine, just checking in.",
              "I'm a bit tired but managing.",
            ]
          : [
              "Watch is over and I am ready to wind down.",
              "It was a long day but I am doing okay.",
              "I could use a quiet reset before sleep.",
            ];

    return samples[Math.floor(Math.random() * samples.length)];
  }, [ctx.mode]);

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const markBackendError = useCallback((error: unknown) => {
    const message = getApiErrorMessage(error);
    setBackendIssue(message);
    setBackendStatus(error instanceof ApiError && error.status >= 500 ? "degraded" : "offline");
    return message;
  }, []);

  const ensureBackendSession = useCallback(async () => {
    if (backendSessionRef.current) {
      return backendSessionRef.current;
    }

    setBackendStatus("connecting");
    const session = await bootstrapDemoSession();
    backendSessionRef.current = session;
    setBackendStatus("ready");
    return session;
  }, []);

  const refreshBackendSession = useCallback(async (session: BackendSession) => {
    await resetStoredSession();
    const sessionId = await startSession(session.token);
    const nextSession = { ...session, sessionId };
    backendSessionRef.current = nextSession;
    return nextSession;
  }, []);

  useEffect(() => {
    let active = true;

    async function connectBackend() {
      try {
        const [session, dependencies] = await Promise.all([
          bootstrapDemoSession(),
          getBackendDependencies().catch(() => null),
        ]);

        if (!active) return;

        backendSessionRef.current = session;
        setBackendStatus(dependencies && !dependencies.ok ? "degraded" : "ready");
        setBackendIssue(
          dependencies && !dependencies.ok
            ? "Backend is reachable, but one or more assistant dependencies are offline."
            : ""
        );
      } catch (error) {
        if (!active) return;
        markBackendError(error);
      }
    }

    void connectBackend();

    return () => {
      active = false;
      if (listenTimer.current) clearTimeout(listenTimer.current);
      stopMediaStream();
    };
  }, [markBackendError, stopMediaStream]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setOrbState("speaking");
      const t2 = setTimeout(() => {
        setMessages([{ role: "assistant", text: ctx.followUp }]);
        const t3 = setTimeout(() => setOrbState("idle"), 2600);
        return () => clearTimeout(t3);
      }, 1200);
      return () => clearTimeout(t2);
    }, 900);
    return () => clearTimeout(t1);
  }, [ctx.followUp]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (isSending) return;

    const cleanText = text.trim();
    setMessages((prev) => [...prev, { role: "user", text: cleanText }]);
    setInputText("");
    setOrbState("speaking");
    setIsSending(true);
    setBackendIssue("");

    try {
      let session = await ensureBackendSession();

      let response;
      try {
        response = await sendSessionMessage(session.token, session.sessionId, cleanText);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
          throw error;
        }

        session = await refreshBackendSession(session);
        response = await sendSessionMessage(session.token, session.sessionId, cleanText);
      }

      setBackendStatus("ready");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: response.reply || "I heard you." },
      ]);
    } catch (error) {
      const message = markBackendError(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I couldn't get a backend reply yet. ${message}`,
        },
      ]);
    } finally {
      setIsSending(false);
      setTimeout(() => setOrbState("idle"), 900);
    }
  }, [ensureBackendSession, isSending, markBackendError, refreshBackendSession]);

  const sendRecordedAudio = useCallback(async (blob: Blob) => {
    if (isSending) return;

    setOrbState("speaking");
    setIsSending(true);
    setBackendIssue("");

    try {
      let session = await ensureBackendSession();
      const mimeType = blob.type || "audio/webm";
      const file = new File(
        [blob],
        `bluecore-recording.${getRecordingExtension(mimeType)}`,
        { type: mimeType }
      );

      let response;
      try {
        response = await sendSessionAudioMessage(session.token, session.sessionId, file);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
          throw error;
        }

        session = await refreshBackendSession(session);
        response = await sendSessionAudioMessage(session.token, session.sessionId, file);
      }

      setBackendStatus("ready");
      setMessages((prev) => [
        ...prev,
        { role: "user", text: response.transcript || "Voice message" },
        { role: "assistant", text: response.reply || "I heard you." },
      ]);
    } catch (error) {
      const message = markBackendError(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I couldn't process that recording yet. ${message}`,
        },
      ]);
    } finally {
      setIsSending(false);
      setIsListening(false);
      setTimeout(() => setOrbState("idle"), 900);
    }
  }, [ensureBackendSession, isSending, markBackendError, refreshBackendSession]);

  const stopRecording = useCallback(() => {
    if (listenTimer.current) {
      clearTimeout(listenTimer.current);
      listenTimer.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return true;
    }

    return false;
  }, []);

  const handleMicToggle = useCallback(async () => {
    if (isSending) return;

    if (isListening) {
      if (!stopRecording()) {
        setIsListening(false);
        void sendUserMessage(sampleVoiceText());
      }
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      void sendUserMessage(sampleVoiceText());
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getPreferredRecordingMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(recordedChunksRef.current, { type: finalMimeType });

        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];
        stopMediaStream();
        setIsListening(false);

        if (blob.size > 0) {
          void sendRecordedAudio(blob);
        } else {
          void sendUserMessage(sampleVoiceText());
        }
      };

      recorder.start();
      setIsListening(true);
      setOrbState("listening");
      listenTimer.current = setTimeout(() => {
        stopRecording();
      }, 4500);
    } catch (error) {
      setIsListening(false);
      setBackendIssue(getApiErrorMessage(error));
      void sendUserMessage(sampleVoiceText());
    }
  }, [
    isListening,
    isSending,
    sampleVoiceText,
    sendRecordedAudio,
    sendUserMessage,
    stopMediaStream,
    stopRecording,
  ]);

  const modeLabel =
    ctx.mode === "break" ? "Break Check-in" :
    ctx.mode === "on-shift" ? "On Watch" : "Off Watch";
  const modeDotColor =
    ctx.mode === "break"
      ? "var(--app-status-break)"
      : ctx.mode === "on-shift"
        ? "var(--app-status-shift)"
        : "var(--app-status-off)";
  const modeLabelColor = modeDotColor;

  const stateHint =
    backendStatus === "connecting" ? "Connecting…" :
    backendStatus === "offline" ? "Backend offline" :
    backendStatus === "degraded" ? "Service degraded" :
    isSending ? "Sending…" :
    orbState === "listening" ? "Listening…" :
    orbState === "speaking" ? "BlueCore" : "Tap to speak";
  const stateHintColor =
    backendStatus === "offline" || backendStatus === "degraded"
      ? "var(--app-warning-fg)"
      : orbState === "listening"
        ? "var(--app-highlight)"
        : "var(--app-fg-muted)";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-app-canvas">

      {/* ── Background gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: "var(--app-home-aurora)" }} />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 320, height: 320, top: "-80px", left: "-100px",
            background: "var(--app-home-blur-a)",
            filter: "blur(50px)",
          }}
          animate={{ scale: [1, 1.08, 1], x: [0, 12, 0], y: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 280, height: 280, bottom: "-50px", right: "-70px",
            background: "var(--app-home-blur-b)",
            filter: "blur(50px)",
          }}
          animate={{ scale: [1, 1.1, 1], x: [0, -8, 0], y: [0, -6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* ══════════════════════════════════════════════
          TOP 2/3 — header + scrollable chat
      ══════════════════════════════════════════════ */}

      {/* Header */}
      <div
        className="flex-shrink-0 relative z-20"
        style={{
          background: "var(--app-home-header-scrim-dense)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
        }}
      >
        <div className="flex items-center justify-between px-5 pt-12 pb-5">
          <div>
            <h1
              className="text-lg font-bold"
              style={{ fontFamily: "Unbounded, sans-serif", color: "var(--app-fg)" }}
            >
              BlueCore
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: modeDotColor }} />
              <span
                className="text-[11px] tracking-widest uppercase"
                style={{ color: modeLabelColor, opacity: 0.75 }}
              >
                {modeLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNav(!showNav)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--app-accent-soft)", border: "1px solid var(--app-accent-border-25)" }}
            >
              <div className="flex flex-col gap-[4px]">
                <div className="w-3 h-px rounded-full" style={{ background: "var(--app-fg-muted)" }} />
                <div className="w-3 h-px rounded-full" style={{ background: "var(--app-fg-muted)" }} />
                <div className="w-2 h-px rounded-full" style={{ background: "var(--app-fg-muted)" }} />
              </div>
            </button>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--app-accent-soft)", border: "1px solid var(--app-accent-border-20)" }}
            >
              {theme === "light" ? (
                <Moon size={16} className="text-app-accent" />
              ) : (
                <Sun size={16} className="text-app-accent" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chat — flex-1 fills all remaining space above bottom panel */}
      <div
        className="flex-1 overflow-y-auto relative z-10 min-h-0"
        ref={scrollRef}
        style={{ scrollbarWidth: "none" }}
      >
        {/* Top edge fade */}
        <div
          className="sticky top-0 h-5 pointer-events-none z-10"
          style={{ background: "var(--app-chat-scroll-fade-top)" }}
        />

        {/* Messages — stack from bottom */}
        <div className="flex flex-col justify-end min-h-full px-5 pb-3 pt-1">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className={`flex mb-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[82%] px-4 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          background: "var(--app-accent-softer)",
                          border: "1px solid var(--app-accent-border-14)",
                          color: "var(--app-fg)",
                          borderRadius: "16px 16px 4px 16px",
                        }
                      : {
                          background: "var(--app-chat-assistant-bg)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid var(--app-accent-border-10)",
                          color: "var(--app-accent)",
                          borderRadius: "16px 16px 16px 4px",
                          boxShadow: "var(--app-chat-assistant-shadow)",
                        }
                  }
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {orbState === "speaking" && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex mb-2"
              >
                <div
                  className="px-4 py-3 flex items-center gap-1.5"
                  style={{
                    background: "var(--app-chat-assistant-bg)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid var(--app-accent-border-10)",
                    borderRadius: "16px 16px 16px 4px",
                  }}
                >
                  {[0, 0.22, 0.44].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--app-fg-muted)" }}
                      animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom edge fade — softens transition into the orb panel */}
        <div
          className="sticky bottom-0 h-8 pointer-events-none"
          style={{ background: "var(--app-chat-scroll-fade-bottom)" }}
        />
      </div>

      {/* ══════════════════════════════════════════════
          BOTTOM 1/3 — orb + input controls + nav
          All three live inside one frosted container
      ══════════════════════════════════════════════ */}
      <div
        className="flex-shrink-0 relative z-20 flex flex-col items-center"
        style={{
          background: "var(--app-bottom-sheet-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--app-bottom-sheet-border)",
        }}
      >
        {/* Orb + state hint */}
        <div className="flex flex-col items-center pt-3 pb-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <button onClick={handleMicToggle} className="focus:outline-none relative">
              {/* Ambient glow */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, var(--app-accent-glow-10) 30%, transparent 70%)",
                  filter: "blur(14px)",
                  transform: "scale(1.3)",
                }}
              />
              <WireframeOrb state={orbState} ampRef={ampRef} />

              {/* Listening pulse rings */}
              <AnimatePresence>
                {isListening && (
                  <>
                    {[1, 2].map((r) => (
                      <motion.div
                        key={r}
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ border: "1px solid var(--app-accent-border-40)" }}
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1 + r * 0.3, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: r * 0.4, ease: "easeOut" }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </button>

            {/* State hint */}
            <motion.div
              className="mt-1"
              animate={{ opacity: orbState === "listening" ? 1 : [0.3, 0.6, 0.3] }}
              transition={
                orbState === "listening"
                  ? { duration: 0.3 }
                  : { duration: 2.8, repeat: Infinity }
              }
            >
              <span
                title={backendIssue || undefined}
                className="text-[11px] tracking-widest uppercase transition-colors duration-300"
                style={{ color: stateHintColor }}
              >
                {stateHint}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Input row */}
        <div className="w-full px-5 pt-1 pb-3">
          <div className="flex items-center gap-3">
            {/* Switch-to-text */}
            <AnimatePresence>
              {!showInput && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setShowInput(true)}
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--app-icon-button-bg)", border: "1px solid var(--app-accent-border-12)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="2" rx="1" fill="var(--app-fg-subtle)" />
                    <rect x="1" y="7" width="10" height="2" rx="1" fill="var(--app-fg-faint)" />
                    <rect x="1" y="11" width="12" height="2" rx="1" fill="var(--app-fg-faint)" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Text input */}
            <AnimatePresence>
              {showInput && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <input
                    autoFocus
                    className="w-full rounded-full px-4 py-3 text-sm outline-none"
                    style={{
                      background: "var(--app-input-pill-bg)",
                      border: "1px solid var(--app-accent-border-15)",
                      color: "var(--app-fg)",
                      backdropFilter: "blur(12px)",
                    }}
                    placeholder="Type a message…"
                    value={inputText}
                    disabled={isSending}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSending) { sendUserMessage(inputText); setShowInput(false); }
                      if (e.key === "Escape") { setShowInput(false); setInputText(""); }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mic button */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              disabled={isSending}
              onClick={() => {
                if (isSending) return;
                if (showInput && inputText) {
                  sendUserMessage(inputText);
                  setShowInput(false);
                } else {
                  handleMicToggle();
                }
              }}
              className="relative flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300"
              style={{
                width: showInput ? 46 : 56,
                height: showInput ? 46 : 56,
                background: isListening ? "var(--app-mic-bg-listening)" : "var(--app-mic-bg-idle)",
                border: isListening
                  ? "1px solid var(--app-mic-border-listening)"
                  : "1px solid var(--app-mic-border-idle)",
                boxShadow: isListening ? "var(--app-mic-shadow-listening)" : "var(--app-mic-shadow-idle)",
                marginLeft: !showInput ? "auto" : undefined,
                marginRight: !showInput ? "auto" : undefined,
              }}
            >
              <Mic
                size={showInput ? 18 : 20}
                style={{ color: isListening ? "var(--app-highlight)" : "var(--app-fg-muted)" }}
                fill={isListening ? "var(--app-mic-bg-listening)" : "none"}
              />
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: "1px solid var(--app-accent-border-40)" }}
                  animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.3, repeat: Infinity }}
                />
              )}
            </motion.button>
          </div>
        </div>

        {/* Nav bar */}
        <nav className="w-full px-4 pb-6 pt-3 bg-app-nav border-t border-app-nav-border">
          <div className="flex items-center justify-around">
            {[
              { path: "/home-v2", icon: Home, label: "Home" },
              { path: "/social", icon: Compass, label: "Connect" },
              { path: "/documents", icon: Archive, label: "Past Docs" },
              { path: "/profile", icon: User, label: "You" },
            ].map((item) => {
              const isActive = item.path === "/home-v2";
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1.5 px-4 py-1"
                >
                  <motion.div whileTap={{ scale: 0.88 }}>
                    <item.icon
                      size={20}
                      className={isActive ? "text-app-accent" : "text-app-fg-muted"}
                    />
                  </motion.div>
                  <span
                    className={`text-[10px] tracking-wide ${isActive ? "text-app-accent" : "text-app-fg-muted"}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── Document launcher dropdown */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.22 }}
            className="absolute top-32 left-4 right-4 z-50 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(225,236,255,0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(37,70,127,0.12)",
              boxShadow: "0 8px 40px rgba(37,70,127,0.14)",
            }}
          >
            <div className="px-5 pt-4 pb-2">
              <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(37,70,127,0.4)" }}>
                START A DOCUMENT
              </span>
            </div>

            {[
              { label: "Voyage Log", badge: "Due today", badgeBg: "rgba(245,158,11,0.15)", badgeColor: "#d97706" },
              { label: "Engine Room Log", badge: "Overdue", badgeBg: "rgba(239,68,68,0.1)", badgeColor: "#ef4444" },
            ].map((doc) => (
              <button
                key={doc.label}
                onClick={() => setShowNav(false)}
                className="w-full flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: "1px solid rgba(37,70,127,0.07)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(37,70,127,0.08)", border: "1px solid rgba(37,70,127,0.12)" }}
                >
                  <FileText size={14} style={{ color: "rgba(37,70,127,0.5)" }} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm" style={{ color: "rgba(37,70,127,0.85)" }}>{doc.label}</div>
                  <div
                    className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px]"
                    style={{ background: doc.badgeBg, color: doc.badgeColor }}
                  >
                    {doc.badge}
                  </div>
                </div>
                <ChevronRight size={13} style={{ color: "rgba(37,70,127,0.25)" }} />
              </button>
            ))}

            <button
              onClick={() => setShowNav(false)}
              className="w-full flex items-center gap-3 px-5 py-3.5"
              style={{ borderBottom: "1px solid rgba(37,70,127,0.07)", background: "rgba(37,70,127,0.04)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative"
                style={{ background: "rgba(37,70,127,0.08)", border: "1px solid rgba(37,70,127,0.12)" }}
              >
                <Play size={14} style={{ color: "rgba(37,70,127,0.5)" }} />
                <motion.div
                  className="absolute w-2 h-2 rounded-full -top-0.5 -right-0.5"
                  style={{ background: "#4fc3f7" }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm" style={{ color: "rgba(37,70,127,0.85)" }}>Resume: Port Arrival Report</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(37,70,127,0.4)" }}>8 of 14 fields complete</div>
              </div>
              <ChevronRight size={13} style={{ color: "rgba(37,70,127,0.25)" }} />
            </button>

            <button
              onClick={() => { navigate("/documents"); setShowNav(false); }}
              className="w-full flex items-center gap-3 px-5 py-4"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(37,70,127,0.08)", border: "1px solid rgba(37,70,127,0.12)" }}
              >
                <Grid size={14} style={{ color: "rgba(37,70,127,0.4)" }} />
              </div>
              <div className="text-sm" style={{ color: "rgba(37,70,127,0.6)" }}>Browse all documents</div>
              <ChevronRight size={13} className="ml-auto" style={{ color: "rgba(37,70,127,0.2)" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
