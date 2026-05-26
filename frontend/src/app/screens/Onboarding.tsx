import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Anchor, ChevronRight, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Accessible color tokens — all pass WCAG AA (4.5:1) on brand gradient (#dfebfe → #c5d9f9)
const FG = "#1a3260";
const SECONDARY = "#25467f";
const MUTED = "#3d5a8a";

const INTERESTS = [
  { label: "Sports", emoji: "⚽" },
  { label: "Music", emoji: "🎵" },
  { label: "Gaming", emoji: "🎮" },
  { label: "Food & Cooking", emoji: "🍳" },
  { label: "Family & Home", emoji: "🏠" },
  { label: "World News", emoji: "🌍" },
  { label: "Maritime Industry", emoji: "⚓" },
  { label: "Technology", emoji: "💻" },
  { label: "Combat Sports", emoji: "🥊" },
  { label: "Movies & TV", emoji: "🎬" },
  { label: "Fitness", emoji: "💪" },
  { label: "Travel", emoji: "✈️" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const toggle = (label: string) =>
    setSelected((p) => (p.includes(label) ? p.filter((i) => i !== label) : [...p, label]));

  const handleFinish = () => {
    completeOnboarding(selected);
    navigate("/home-v2");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full flex flex-col overflow-y-auto"
      style={{ background: "linear-gradient(160deg, #dfebfe 0%, #c5d9f9 100%)" }}
    >
      {/* Progress bar */}
      <div className="px-6 pt-10 flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1 rounded-full flex-1 transition-all duration-500"
            style={{
              background: s <= step ? SECONDARY : "rgba(37,70,127,0.15)",
            }}
          />
        ))}
      </div>

      <div className="px-6 pt-6 pb-8 flex flex-col flex-1">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepMRN key="mrn" firstName={firstName} mrn={user?.mrn} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <StepInterests key="interests" selected={selected} onToggle={toggle} onNext={() => setStep(3)} />
          )}
          {step === 3 && (
            <StepReady key="ready" firstName={firstName} onFinish={handleFinish} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StepMRN({ firstName, mrn, onNext }: { firstName: string; mrn?: string; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col flex-1"
    >
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: SECONDARY }}>
          Step 1 of 2
        </p>
        <h2 className="text-2xl font-bold" style={{ color: FG }}>
          Welcome aboard, {firstName}.
        </h2>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: MUTED }}>
          Your account is live. Here's how BlueCore knows what voyage you're on.
        </p>
      </div>

      {/* MRN card */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: "rgba(255,255,255,0.72)",
          border: "1.5px solid rgba(37,70,127,0.22)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(37,70,127,0.1)" }}
          >
            <Anchor size={16} aria-hidden style={{ color: SECONDARY }} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: SECONDARY }}>
              Mariner Reference Number (MRN)
            </p>
            <p className="text-2xl font-bold tracking-[0.15em]" style={{ color: FG }}>
              {mrn ?? "—"}
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
          This is the 7-digit number printed on your US Coast Guard Merchant Mariner Credential (MMC). Ship operators use it to assign you to voyages — your rank, vessel, and role for each trip are always set by them, never by you.
        </p>
      </div>

      {/* How it works */}
      <div className="space-y-4 mb-auto">
        {[
          {
            n: "1",
            title: "Ship operator creates your voyage",
            body: "They enter vessel details, ports, dates, and crew manifest.",
          },
          {
            n: "2",
            title: "You're assigned by MRN",
            body: "Your rank and role for that voyage are set by the ship operator — it can change voyage to voyage.",
          },
          {
            n: "3",
            title: "BlueCore pre-fills your paperwork",
            body: "Every document auto-populates with your current role and vessel data.",
          },
        ].map((item) => (
          <div key={item.n} className="flex gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5"
              style={{ background: "rgba(37,70,127,0.12)", color: SECONDARY }}
              aria-hidden
            >
              {item.n}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: FG }}>{item.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: MUTED }}>{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-2"
        style={{ background: SECONDARY, color: "#ffffff" }}
      >
        Continue <ChevronRight size={14} aria-hidden />
      </button>
    </motion.div>
  );
}

function StepInterests({
  selected,
  onToggle,
  onNext,
}: {
  selected: string[];
  onToggle: (l: string) => void;
  onNext: () => void;
}) {
  const canContinue = selected.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col flex-1"
    >
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: SECONDARY }}>
          Step 2 of 2
        </p>
        <h2 className="text-2xl font-bold" style={{ color: FG }}>
          What are you into?
        </h2>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: MUTED }}>
          We'll personalise your news feed from day one. BlueCore learns more about you with every conversation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Select your interests">
        {INTERESTS.map(({ label, emoji }) => {
          const on = selected.includes(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => onToggle(label)}
              aria-pressed={on}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f]"
              style={{
                background: on ? SECONDARY : "rgba(255,255,255,0.72)",
                border: `1.5px solid ${on ? "transparent" : "rgba(37,70,127,0.22)"}`,
                color: on ? "#ffffff" : SECONDARY,
                fontWeight: on ? 500 : 400,
              }}
            >
              <span aria-hidden>{emoji}</span>
              {label}
              {on && <Check size={11} strokeWidth={2.5} aria-hidden />}
            </button>
          );
        })}
      </div>

      <p className="text-xs font-medium mb-auto" style={{ color: MUTED }} aria-live="polite">
        {selected.length === 0
          ? "Pick at least one to continue"
          : `${selected.length} selected · you can update these anytime`}
      </p>

      <button
        type="button"
        onClick={onNext}
        disabled={!canContinue}
        aria-disabled={!canContinue}
        className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-6 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-2"
        style={{
          background: SECONDARY,
          color: "#ffffff",
          opacity: canContinue ? 1 : 0.4,
          cursor: canContinue ? "pointer" : "not-allowed",
        }}
      >
        Continue <ChevronRight size={14} aria-hidden />
      </button>
    </motion.div>
  );
}

function StepReady({ firstName, onFinish }: { firstName: string; onFinish: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 18 }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
        style={{ background: "rgba(37,70,127,0.1)" }}
        aria-hidden
      >
        <Anchor size={36} style={{ color: SECONDARY }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-3" style={{ color: FG }}>
          You're all set, {firstName}.
        </h2>
        <p className="text-sm leading-relaxed mb-2" style={{ color: SECONDARY }}>
          BlueCore is ready to automate your paperwork.
        </p>
        <p className="text-sm leading-relaxed mb-10" style={{ color: MUTED }}>
          Once a ship operator assigns you to a voyage using your MRN, your role, vessel, and documents load automatically. The more we talk, the better BlueCore knows you.
        </p>
      </motion.div>

      <button
        type="button"
        onClick={onFinish}
        className="w-full py-3.5 rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-2"
        style={{ background: SECONDARY, color: "#ffffff" }}
      >
        Open BlueCore
      </button>
    </motion.div>
  );
}
