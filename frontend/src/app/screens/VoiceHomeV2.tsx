import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { useNavigate } from "react-router";
import { Mic, ChevronRight, FileText, Play, Grid, Globe, Compass, Archive, User, Sun, Moon, Keyboard, PanelLeft, MessageSquare } from "lucide-react";
import { currentUser, DEMO_SCRIPT_ENGINE_ROOM, DEMO_SCRIPT_OIL_RECORD, completedDocs } from "../data/mockData";
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
      greeting: `Hey ${currentUser.name}`,
      followUp: "Hey Daniel — how was your shift? I can help close out a document while it's still fresh.",
    };
  } else if (totalMin >= shiftStart && totalMin < shiftEnd) {
    return {
      mode: "on-shift",
      greeting: `Hey ${currentUser.name}`,
      followUp: "Hey Daniel — how was your shift? I can help close out a document while it's still fresh.",
    };
  } else {
    return {
      mode: "off-shift",
      greeting: `Evening, ${currentUser.name}`,
      followUp: "Hey Daniel — how was your shift? I can help close out a document while it's still fresh.",
    };
  }
}

// ─── Simulated AI replies ─────────────────────────────────────────────────────
const breakReplies = [
  "Got it. Sounds like the morning had its moments. How are you feeling overall — tension in the shoulders, or more of a mental load?",
  "That tracks. Engine room work always stretches longer than the paperwork suggests. You've still got a solid break window — want me to find someone to eat with?",
  "Noted. I'll flag that for your end-of-shift log. Right now though — have you eaten? And have you been outside at all today?",
  "Good to hear. You've been putting in consistent work this voyage. Elena and Marcus are both free right now if you want company. Same interests, same break window.",
];
const shiftReplies = [
  "Good to know. I'll keep checking the acoustic readings quietly. Just say 'BlueCore' any time you need me.",
  "Understood. Take your time — I'm here whenever. And if the workload starts building up, just let me know.",
  "Noted. You're doing well, Daniel. Port approach is in a few hours — want me to prep a briefing summary for you?",
];
const offShiftReplies = [
  "Rest well then. I'll keep tonight's check-in light. You've done a full watch — that deserves some real downtime.",
  "That's fair. I picked up on some tension in your voice around midday — it passed, but I wanted you to know I noticed. Tomorrow's a new day.",
  "Sounds like a tough stretch. You've been at sea 21 days now — isolation compounds over time. I'm here if you want to talk it through.",
];

type Message =
  | { role: "assistant" | "user"; text: string }
  | { role: "document"; docType: "engine-room" | "oil-record"; title: string };
type BackendStatus = "connecting" | "ready" | "degraded" | "offline";
type DemoEntry = { ai: string; user: string | null; fieldsUpdated: string[] };
type CompletedDemoDoc = {
  docType: "engine-room" | "oil-record";
  title: string;
  timestamp: Date;
};

let persistedMessages: Message[] = [];
let persistedInputText = "";
let persistedShowInput = false;
let persistedDemoScript: DemoEntry[] | null = null;
let persistedDemoStep = 0;
let persistedCompletedDoc: CompletedDemoDoc | null = null;

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

function TypewriterText({
  text,
  active,
  onTick,
  onDone,
}: {
  text: string;
  active: boolean;
  onTick?: () => void;
  onDone?: () => void;
}) {
  const [visibleLength, setVisibleLength] = useState(active ? 0 : text.length);
  const onTickRef = useRef(onTick);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!active) {
      setVisibleLength(text.length);
      return;
    }

    setVisibleLength(0);

    if (text.length === 0) {
      onDoneRef.current?.();
      return;
    }

    let nextLength = 0;
    const timer = window.setInterval(() => {
      nextLength += 1;
      setVisibleLength(nextLength);
      onTickRef.current?.();

      if (nextLength >= text.length) {
        window.clearInterval(timer);
        onDoneRef.current?.();
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [active, text]);

  return <>{text.slice(0, visibleLength)}</>;
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function VoiceHomeV2() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const ctx = getShiftContext();

  const [orbState, setOrbState] = useState<"idle" | "listening" | "speaking">("idle");
  const [messages, setMessages] = useState<Message[]>(() => persistedMessages);
  const [typingAssistantIndex, setTypingAssistantIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState(() => persistedInputText);
  const [showInput, setShowInput] = useState(() => persistedShowInput);
  const [isListening, setIsListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("connecting");
  const [backendIssue, setBackendIssue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backendSessionRef = useRef<BackendSession | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const demoScriptRef = useRef<DemoEntry[] | null>(persistedDemoScript);
  const demoStepRef = useRef(persistedDemoStep);
  const [completedDoc, setCompletedDoc] = useState<CompletedDemoDoc | null>(
    persistedCompletedDoc
  );
  const hasInitializedMessageTypingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleAssistantTypeDone = useCallback((messageIndex: number) => {
    setTypingAssistantIndex((currentIndex) =>
      currentIndex === messageIndex ? null : currentIndex
    );
  }, []);

  const amp = useAcousticAmplitude(orbState);
  const ampRef = useRef<number>(0);
  useEffect(() => {
    return amp.on("change", (v) => { ampRef.current = v; });
  }, [amp]);

  useEffect(() => {
    persistedMessages = messages;
  }, [messages]);

  useEffect(() => {
    if (!hasInitializedMessageTypingRef.current) {
      hasInitializedMessageTypingRef.current = true;
      return;
    }

    const lastMessageIndex = messages.length - 1;
    const lastMessage = messages[lastMessageIndex];
    if (lastMessage?.role === "assistant") {
      setTypingAssistantIndex(lastMessageIndex);
    }
  }, [messages]);

  useEffect(() => {
    persistedInputText = inputText;
  }, [inputText]);

  useEffect(() => {
    persistedShowInput = showInput;
  }, [showInput]);

  useEffect(() => {
    if (showInput) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [showInput]);

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

  const startDemo = useCallback((script: DemoEntry[]) => {
    demoScriptRef.current = script;
    demoStepRef.current = 0;
    persistedDemoScript = script;
    persistedDemoStep = 0;
    setShowSidebar(false);
    setBackendIssue("");
    setOrbState("speaking");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: script[0].ai }]);
      setTimeout(() => setOrbState("idle"), 1800);
    }, 700);
  }, []);

  const finishDemoStep = useCallback((typedText?: string) => {
    const script = demoScriptRef.current;
    if (!script) return;
    const step = demoStepRef.current;
    const current = script[step];
    if (!current || current.user === null) return;

    if (listenTimer.current) {
      clearTimeout(listenTimer.current);
      listenTimer.current = null;
    }

    const userText = typedText?.trim() || current.user;
    if (!userText) return;

    setIsListening(false);
    setInputText("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    const nextStep = step + 1;
    demoStepRef.current = nextStep;
    persistedDemoStep = nextStep;
    setOrbState("speaking");

    setTimeout(() => {
      const nextEntry = script[nextStep];
      if (nextEntry) {
        setMessages(prev => [...prev, { role: "assistant", text: nextEntry.ai }]);
        if (nextEntry.user === null) {
          const completedScript = demoScriptRef.current;
          demoScriptRef.current = null;
          persistedDemoScript = null;
          setTimeout(() => {
            const docType = completedScript === DEMO_SCRIPT_ENGINE_ROOM
              ? "engine-room" as const
              : "oil-record" as const;
            const title = completedScript === DEMO_SCRIPT_ENGINE_ROOM
              ? "Engine Room Log — 23 Apr 2025"
              : "Oil Record Book Part I — 23 Apr 2025";
            setMessages(prev => [...prev, { role: "document", docType, title }]);
            const doc = { docType, title, timestamp: new Date() };
            persistedCompletedDoc = doc;
            setCompletedDoc(doc);
            if (!completedDocs.some((item) => item.docType === doc.docType && item.title === doc.title)) {
              completedDocs.unshift(doc);
            }

            setTimeout(() => {
              setOrbState("speaking");
              setMessages(prev => [
                ...prev,
                {
                  role: "assistant",
                  text:
                    "All set — the PDF is ready to export. Anything else I can help with? If you're wrapped up, Marcus is BBQ'ing on the aft deck right now and Ravi is heading over, if you want to grab food with the crew.",
                },
              ]);
              setTimeout(() => setOrbState("idle"), 1800);
            }, 1200);
          }, 2000);
        }
      }
      setTimeout(() => setOrbState("idle"), 1800);
    }, 900);
  }, []);

  const handleDemoMicToggle = useCallback(() => {
    if (isListening) {
      finishDemoStep();
      return;
    }

    setIsListening(true);
    setOrbState("listening");
  }, [finishDemoStep, isListening]);

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const cancelListening = useCallback(() => {
    if (listenTimer.current) {
      clearTimeout(listenTimer.current);
      listenTimer.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }

    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    stopMediaStream();
    setIsListening(false);
    setOrbState("idle");
  }, [stopMediaStream]);

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
    if (persistedMessages.length > 0) return;

    const t1 = setTimeout(() => {
      setOrbState("speaking");
      const t2 = setTimeout(() => {
        setMessages((prev) =>
          prev.length > 0 ? prev : [{ role: "assistant", text: ctx.followUp }]
        );
        const t3 = setTimeout(() => setOrbState("idle"), 2600);
        return () => clearTimeout(t3);
      }, 1200);
      return () => clearTimeout(t2);
    }, 900);
    return () => clearTimeout(t1);
  }, [ctx.followUp]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (isSending) return;

    const cleanText = text.trim();
    if (demoScriptRef.current !== null) {
      finishDemoStep(cleanText);
      return;
    }

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
  }, [ensureBackendSession, finishDemoStep, isSending, markBackendError, refreshBackendSession]);

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

    if (demoScriptRef.current !== null) {
      handleDemoMicToggle();
      return;
    }

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
    handleDemoMicToggle,
    isListening,
    isSending,
    sampleVoiceText,
    sendRecordedAudio,
    sendUserMessage,
    stopMediaStream,
    stopRecording,
  ]);

  const getWatchLabel = () => {
    const now = new Date();
    const total = now.getHours() * 60 + now.getMinutes();
    if (total >= 11 * 60 + 30 && total < 12 * 60) return "Pre-Watch  ·  12:00–16:00";
    if (total >= 12 * 60 && total < 16 * 60) return "On Watch  ·  12:00–16:00";
    if (total >= 0 && total < 4 * 60) return "On Watch  ·  00:00–04:00";
    return "Off Watch  ·  Next: 00:00";
  };

  const modeDotColor =
    ctx.mode === "break"
      ? "var(--app-status-break)"
      : ctx.mode === "on-shift"
        ? "var(--app-status-shift)"
        : "var(--app-status-off)";
  const modeLabelColor = modeDotColor;

  const stateHint =
    isSending ? "Sending…" :
    orbState === "listening" ? "Tap again to send" :
    orbState === "speaking" ? "BlueCore" : "Tap to speak";
  const stateHintColor =
    orbState === "listening"
      ? "var(--app-highlight)"
      : "var(--app-fg-muted)";

  // Input row dimensions — computed from the fixed app width so we can animate explicit px values
  const rowWidth = Math.min(430, window.innerWidth) - 40; // app max-width minus px-5 * 2
  const inputExpandedWidth = Math.max(46, rowWidth - 58); // row minus mic btn (46) + margin (12)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-app-canvas relative">

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
        <div className="flex items-center px-5 pt-12 pb-5">
          <button
            onClick={() => setShowSidebar(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--app-accent-soft)", border: "1px solid var(--app-accent-border-25)" }}
          >
            <PanelLeft size={16} style={{ color: "var(--app-fg-subtle)" }} />
          </button>

          <div className="flex-1 flex flex-col items-center">
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
                {getWatchLabel()}
              </span>
            </div>
          </div>

          <div className="w-9 flex-shrink-0" />
        </div>
      </div>

      {/* Chat — flex-1 fills all remaining space above bottom panel */}
      <div
        className="flex-1 overflow-y-auto relative z-10 min-h-0"
        ref={scrollRef}
        style={{ scrollbarWidth: "none" }}
      >
        {/* Header-edge blur — sticks to top; messages dissolve into it as they scroll up */}
        <div className="sticky top-0 pointer-events-none" style={{ height: 0, zIndex: 20, position: "relative" }}>
          <div
            className="absolute inset-x-0 top-0 h-24"
            style={{
              backdropFilter: "blur(64px)",
              WebkitBackdropFilter: "blur(64px)",
              background: "transparent",
              maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
            }}
          />
        </div>

        {/* Messages — stack from bottom */}
        <div className="flex flex-col justify-end min-h-full px-5 pt-5 pb-10">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              if (msg.role === "document") {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex mb-3 justify-start"
                  >
                    <button
                      onClick={() => navigate("/document-preview", { state: { docType: msg.docType, title: msg.title } })}
                      className="max-w-[85%] text-left"
                      style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(37,70,127,0.15)",
                        borderRadius: "16px 16px 16px 4px",
                        padding: "14px 16px",
                        boxShadow: "0 2px 16px rgba(37,70,127,0.08)",
                      }}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(79,195,247,0.12)", border: "1px solid rgba(79,195,247,0.25)" }}
                        >
                          <FileText size={15} style={{ color: "#4fc3f7" }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: "#1a3260" }}>{msg.title}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: "rgba(37,70,127,0.45)" }}>
                            All fields complete · Tap to review
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
                          <span className="text-[10px] tracking-wide" style={{ color: "#16a34a" }}>Ready to export</span>
                        </div>
                        <span className="text-[10px] ml-auto" style={{ color: "rgba(37,70,127,0.3)" }}>Tap to open →</span>
                      </div>
                    </button>
                  </motion.div>
                );
              }
              return (
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
                    {msg.role === "assistant" ? (
                      <TypewriterText
                        text={msg.text}
                        active={i === typingAssistantIndex}
                        onTick={scrollToBottom}
                        onDone={() => handleAssistantTypeDone(i)}
                      />
                    ) : (
                      msg.text
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* ══════════════════════════════════════════════
          BOTTOM 1/3 — orb + input controls + nav
          Orb controls sit directly on the page background
      ══════════════════════════════════════════════ */}
      <div
        className="flex-shrink-0 relative z-20 flex flex-col items-center"
        style={{
          background: "transparent",
          paddingBottom: 96,
        }}
      >
        {/* Blur band — strong, messages dissolve into it; orb and input sit above */}
        <div
          className="pointer-events-none absolute inset-x-0 -top-14 h-28"
          style={{
            backdropFilter: "blur(64px)",
            WebkitBackdropFilter: "blur(64px)",
            background: "transparent",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)",
            zIndex: 1,
          }}
        />
        {/* Orb — always in DOM so layout height is stable; opacity-only toggle prevents
            the input row from jumping (height:0 + negative margin caused a 145px shift). */}
        <motion.div
          className="flex flex-col items-center pt-0 pb-0"
          style={{
            marginTop: -145,
            position: "relative",
            zIndex: 2,
            pointerEvents: showInput ? "none" : "auto",
          }}
          animate={{ opacity: showInput ? 0 : 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.15, y: 160 }}
            animate={{ opacity: 1, scale: 1, y: 100 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <button
              onClick={handleMicToggle}
              className="focus:outline-none relative bg-transparent border-0 p-0"
              style={{ background: "transparent" }}
            >
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
        </motion.div>

        {/* Input row */}
        <div className="w-full px-5 pt-1 pb-3" style={{ position: "relative", zIndex: 2 }}>
          <div className="w-full flex items-center justify-end">

            {/* Single persistent morphing control — always in the DOM, animates its own
                width and border-radius. No element swapping = no projection glitches. */}
            <motion.div
              className="flex items-center overflow-hidden flex-shrink-0"
              animate={{
                width: showInput ? inputExpandedWidth : 46,
                borderRadius: showInput ? 999 : 23,
              }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                height: 46,
                background: showInput ? "transparent" : "var(--app-icon-button-bg)",
                border: `1px solid ${showInput ? "var(--app-accent-border-15)" : "var(--app-accent-border-12)"}`,
                cursor: showInput ? "default" : "pointer",
              }}
              onClick={!showInput ? () => { cancelListening(); setShowInput(true); } : undefined}
            >
              <AnimatePresence mode="wait" initial={false}>
                {showInput ? (
                  <motion.input
                    key="text-input"
                    ref={inputRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="w-full px-4 text-sm outline-none"
                    style={{ background: "transparent", color: "var(--app-fg)", height: "100%", minWidth: 0 }}
                    placeholder="Type a message…"
                    value={inputText}
                    disabled={isSending}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSending) { sendUserMessage(inputText); }
                      if (e.key === "Escape") { setInputText(""); }
                    }}
                  />
                ) : (
                  <motion.div
                    key="keyboard-icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center justify-center w-full h-full"
                  >
                    <Keyboard size={17} style={{ color: "var(--app-fg-subtle)" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Mic button in a collapsing wrapper — width spring is synced with the morphing
                control so the layout stays tight throughout the animation */}
            <AnimatePresence>
              {showInput && (
                <motion.div
                  key="mic-slot"
                  initial={{ width: 0, marginLeft: 0 }}
                  animate={{ width: 46, marginLeft: 12 }}
                  exit={{ width: 0, marginLeft: 0 }}
                  transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center" }}
                >
                  <motion.button
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    whileTap={{ scale: 0.88 }}
                    disabled={isSending}
                    onClick={() => { if (isSending) return; setShowInput(false); setOrbState("idle"); }}
                    aria-label="Switch to voice"
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 46,
                      height: 46,
                      background: "var(--app-mic-bg-idle)",
                      border: "1px solid var(--app-mic-border-idle)",
                      boxShadow: "var(--app-mic-shadow-idle)",
                    }}
                  >
                    <Mic size={18} style={{ color: "var(--app-fg-muted)" }} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Floating nav bar — fixed, glass effect */}
        <nav
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 48px)",
            zIndex: 50,
            borderRadius: 20,
            background: theme === "light" ? "rgba(255,255,255,0.18)" : "rgba(15,25,45,0.50)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid rgba(${theme === "light" ? "37,70,127" : "255,255,255"},0.06)`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            padding: "8px 16px",
          }}
        >
          <div className="flex items-center justify-around">
            {[
              { path: "/home-v2", icon: Globe, label: "Core" },
              { path: "/documents", icon: Archive, label: "Past Docs" },
              { path: "/social", icon: Compass, label: "Connect" },
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

      {/* ── Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              className="absolute inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setShowSidebar(false)}
              style={{ background: "rgba(0,0,0,0.28)" }}
            />

            <motion.div
              className="absolute top-0 left-0 bottom-0 z-50 flex flex-col"
              style={{
                width: "82%",
                background: theme === "light" ? "rgba(232,240,255,0.97)" : "rgba(8,18,38,0.97)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                borderRight: `1px solid rgba(${theme === "light" ? "37,70,127" : "255,255,255"},0.08)`,
                boxShadow: "6px 0 48px rgba(0,0,0,0.22)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Sidebar title */}
              <div className="pt-14 px-5 pb-5" style={{ borderBottom: `1px solid rgba(${theme === "light" ? "37,70,127" : "255,255,255"},0.07)` }}>
                <h2
                  className="text-base font-bold"
                  style={{ fontFamily: "Unbounded, sans-serif", color: "var(--app-fg)" }}
                >
                  BlueCore
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {/* Document launcher */}
                <div className="px-5 pt-5 pb-2">
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--app-fg-faint)" }}>
                    Start a Document
                  </p>
                </div>

                {[
                  {
                    label: "Engine Room Log",
                    subtitle: "Afternoon Watch · 12:00–16:00",
                    badge: "Due at 16:00",
                    badgeBg: "rgba(245,158,11,0.15)",
                    badgeColor: "#d97706",
                    script: DEMO_SCRIPT_ENGINE_ROOM,
                  },
                  {
                    label: "Oil Record Book (CG-4602A)",
                    subtitle: "Section C · Sludge Collection",
                    badge: "Required daily",
                    badgeBg: "rgba(239,68,68,0.1)",
                    badgeColor: "#ef4444",
                    script: DEMO_SCRIPT_OIL_RECORD,
                  },
                ].map((doc) => (
                  <button
                    key={doc.label}
                    onClick={() => { startDemo(doc.script); setShowSidebar(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3.5"
                    style={{ borderBottom: `1px solid rgba(${theme === "light" ? "37,70,127" : "255,255,255"},0.05)` }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--app-accent-soft)", border: "1px solid var(--app-accent-border-20)" }}
                    >
                      <FileText size={14} style={{ color: "var(--app-accent)" }} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm" style={{ color: "var(--app-fg)" }}>{doc.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--app-fg-faint)" }}>{doc.subtitle}</div>
                      <div
                        className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px]"
                        style={{ background: doc.badgeBg, color: doc.badgeColor }}
                      >
                        {doc.badge}
                      </div>
                    </div>
                    <ChevronRight size={13} style={{ color: "var(--app-fg-faint)" }} />
                  </button>
                ))}

                <button
                  onClick={() => { navigate("/documents"); setShowSidebar(false); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 mb-5"
                  style={{ borderBottom: `1px solid rgba(${theme === "light" ? "37,70,127" : "255,255,255"},0.07)` }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--app-surface-hover)", border: "1px solid var(--app-card-border)" }}
                  >
                    <Grid size={14} style={{ color: "var(--app-fg-faint)" }} />
                  </div>
                  <div className="text-sm" style={{ color: "var(--app-fg-subtle)" }}>Browse all documents</div>
                  <ChevronRight size={13} className="ml-auto" style={{ color: "var(--app-fg-faint)" }} />
                </button>

                {/* Past conversations */}
                <div className="px-5 pt-1 pb-2">
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--app-fg-faint)" }}>
                    Past Conversations
                  </p>
                </div>

                {[
                  { summary: "Engine room handover notes", time: "Today, 08:14" },
                  { summary: "Port arrival pre-checks", time: "Yesterday" },
                  { summary: "Fatigue & wellbeing check-in", time: "2 days ago" },
                  { summary: "Oil Record Book section C", time: "3 days ago" },
                  { summary: "Stress levels after cargo run", time: "4 days ago" },
                ].map((chat) => (
                  <button
                    key={chat.summary}
                    className="w-full flex items-center gap-3 px-5 py-3"
                    style={{ borderBottom: `1px solid rgba(${theme === "light" ? "37,70,127" : "255,255,255"},0.04)` }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--app-surface-hover)", border: "1px solid var(--app-card-border)" }}
                    >
                      <MessageSquare size={12} style={{ color: "var(--app-fg-faint)" }} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm truncate" style={{ color: "var(--app-fg-subtle)" }}>{chat.summary}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--app-fg-faint)" }}>{chat.time}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Theme toggle */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderTop: `1px solid rgba(${theme === "light" ? "37,70,127" : "255,255,255"},0.07)` }}
              >
                <span className="text-sm" style={{ color: "var(--app-fg-subtle)" }}>
                  {theme === "light" ? "Light Mode" : "Dark Mode"}
                </span>
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "var(--app-accent-soft)", border: "1px solid var(--app-accent-border-20)" }}
                >
                  {theme === "light" ? (
                    <Moon size={16} style={{ color: "var(--app-accent)" }} />
                  ) : (
                    <Sun size={16} style={{ color: "var(--app-accent)" }} />
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
