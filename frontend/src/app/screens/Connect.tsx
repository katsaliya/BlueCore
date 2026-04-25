import { useState } from "react";
import { Bookmark, Users } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { currentUser } from "../data/mockData";

type Interest = "All" | "⚽ Football" | "🏎 F1" | "🍳 Cooking" | "📸 Photography";

const categoryColors: Record<string, string> = {
  Football: "#fbbf24",
  F1: "#f87171",
  Cooking: "#34d399",
  Photography: "#a78bfa",
  "True Crime": "rgba(255,255,255,0.4)",
};

export function Connect() {
  const navigate = useNavigate();
  const [activeInterest, setActiveInterest] = useState<Interest>("All");

  return (
    <div className="px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl" style={{ color: "var(--app-fg)" }}>Connect</h2>
        <div
          className="w-9 h-9 rounded-full overflow-hidden"
          style={{ border: "1px solid var(--app-accent-border-40)" }}
        >
          <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Interest filter chips */}
      <div className="mt-4 -mx-5 px-5 flex gap-2 overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {(["All", "⚽ Football", "🏎 F1", "🍳 Cooking", "📸 Photography"] as Interest[]).map((interest) => (
          <button
            key={interest}
            onClick={() => setActiveInterest(interest)}
            className="px-3.5 py-1.5 rounded-full text-xs flex-shrink-0 snap-start transition-all"
            style={
              activeInterest === interest
                ? {
                    background: "var(--app-accent-soft)",
                    border: "1px solid var(--app-accent-border-40)",
                    color: "var(--app-accent)",
                  }
                : {
                    background: "var(--app-surface-hover)",
                    border: "1px solid var(--app-card-border)",
                    color: "var(--app-fg-subtle)",
                  }
            }
          >
            {interest}
          </button>
        ))}
      </div>

      {/* Schedule section */}
      <div className="mt-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--app-fg-faint)" }}>YOUR DAY</span>
          <button
            onClick={() => navigate("/schedule")}
            className="text-xs"
            style={{ color: "var(--app-accent)" }}
          >
            See full schedule →
          </button>
        </div>

        {/* Day timeline card */}
        <div
          className="mt-2 rounded-2xl px-4 py-4"
          style={{
            background: "var(--app-connect-day-card)",
            border: "1px solid var(--app-accent-border-25)",
          }}
        >
          {/* Schedule entries */}
          <div>
            {/* Entry 1: Log Report */}
            <div className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--app-card-border)" }}>
              <span className="text-xs w-10 flex-shrink-0" style={{ color: "var(--app-fg-subtle)" }}>11:30</span>
              <div
                className="w-0.5 h-6 rounded-full flex-shrink-0"
                style={{ background: "var(--app-accent-border-40)" }}
              />
              <span className="text-sm flex-1" style={{ color: "var(--app-fg)" }}>Log Report Submission</span>
              <span
                className="text-[10px] rounded-full px-2 py-0.5"
                style={{
                  color: "var(--app-accent)",
                  background: "var(--app-accent-soft)",
                }}
              >
                Duty
              </span>
            </div>

            {/* Entry 2: Lunch Break */}
            <div className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--app-card-border)" }}>
              <span className="text-xs w-10 flex-shrink-0" style={{ color: "var(--app-fg-subtle)" }}>12:00</span>
              <div
                className="w-0.5 h-6 rounded-full flex-shrink-0"
                style={{ background: "rgba(52,211,153,0.5)" }}
              />
              <span className="text-sm flex-1" style={{ color: "var(--app-fg)" }}>Lunch Break</span>
              <span
                className="text-[10px] rounded-full px-2 py-0.5"
                style={{
                  color: "rgba(52,211,153,0.7)",
                  background: "rgba(16,185,129,0.1)",
                }}
              >
                Break
              </span>
            </div>

            {/* Entry 3: BBQ Plan */}
            <div className="flex items-center gap-3 py-2">
              <span className="text-xs w-10 flex-shrink-0" style={{ color: "var(--app-fg-subtle)" }}>12:00</span>
              <div
                className="w-0.5 h-6 rounded-full flex-shrink-0"
                style={{ background: "rgba(251,191,36,0.5)" }}
              />
              <span className="text-sm flex-1" style={{ color: "var(--app-fg)" }}>BBQ on deck 🔥</span>
              <span
                className="text-[10px] rounded-full px-2 py-0.5"
                style={{
                  color: "rgba(251,191,36,0.7)",
                  background: "rgba(245,158,11,0.1)",
                }}
              >
                Plan
              </span>
            </div>
          </div>

          {/* Crew overlap row */}
          <div className="mt-3 pt-3 flex items-center gap-1.5" style={{ borderTop: "1px solid var(--app-card-border)" }}>
            <Users size={12} style={{ color: "var(--app-accent)", opacity: 0.9 }} />
            <span className="text-xs flex-1 ml-1.5" style={{ color: "var(--app-fg-subtle)" }}>Elena + Marcus free at 12:00</span>
            <button
              className="rounded-full px-2.5 py-1 text-[10px]"
              style={{
                background: "var(--app-accent-soft)",
                border: "1px solid var(--app-accent-border-30)",
                color: "var(--app-accent)",
              }}
            >
              Invite
            </button>
          </div>
        </div>
      </div>

      {/* Featured card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 rounded-2xl overflow-hidden relative h-[180px]"
        style={{
          background: "var(--app-connect-hero-bg)",
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "var(--app-connect-hero-overlay)",
          }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 p-4">
          <div
            className="inline-block rounded-full px-2.5 py-1 text-[10px]"
            style={{
              background: "var(--app-accent-soft)",
              border: "1px solid var(--app-accent-border-40)",
              color: "var(--app-accent)",
            }}
          >
            ⚽ Football
          </div>
          <h3 className="text-base leading-snug mt-2 max-w-[80%]" style={{ color: "var(--app-fg)" }}>
            Champions League Draw: Real Madrid vs Arsenal
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--app-fg-subtle)" }}>BBC Sport · 2h ago</p>
        </div>

        {/* Bookmark button */}
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "var(--app-bookmark-fab-bg)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Bookmark size={14} style={{ color: "var(--app-fg-subtle)" }} />
        </button>
      </motion.div>

      {/* News list */}
      <div className="mt-4 space-y-3">
        {/* Row 1: F1 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl px-4 py-3.5 flex gap-3"
          style={{
            background: "var(--app-card-bg)",
            border: "1px solid var(--app-card-border)",
          }}
        >
          <div
            className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--app-thumb-tile-bg)",
              border: "1px solid var(--app-card-border)",
            }}
          >
            <span className="text-xl" style={{ color: "var(--app-fg-subtle)" }}>🏎</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-wide uppercase" style={{ color: categoryColors.F1 }}>
              F1
            </p>
            <h4 className="text-sm leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--app-fg)" }}>
              Verstappen Takes Pole in Bahrain — 0.04s ahead of Norris
            </h4>
            <p className="text-xs mt-1.5" style={{ color: "var(--app-fg-faint)" }}>F1.com · 5h ago</p>
          </div>
          <Bookmark size={14} className="flex-shrink-0 self-start mt-0.5" style={{ color: "var(--app-fg-faint)" }} />
        </motion.div>

        {/* Row 2: Cooking */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl px-4 py-3.5 flex gap-3"
          style={{
            background: "var(--app-card-bg)",
            border: "1px solid var(--app-card-border)",
          }}
        >
          <div
            className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--app-thumb-tile-bg)",
              border: "1px solid var(--app-card-border)",
            }}
          >
            <span className="text-xl" style={{ color: "var(--app-fg-subtle)" }}>🍳</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-wide uppercase" style={{ color: categoryColors.Cooking }}>
              COOKING
            </p>
            <h4 className="text-sm leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--app-fg)" }}>
              Gordon Ramsay Opens Waterfront Restaurant in Amsterdam Harbour
            </h4>
            <p className="text-xs mt-1.5" style={{ color: "var(--app-fg-faint)" }}>Food & Wine · 1d ago</p>
          </div>
          <Bookmark size={14} className="flex-shrink-0 self-start mt-0.5" style={{ color: "var(--app-fg-faint)" }} />
        </motion.div>

        {/* Row 3: Photography */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl px-4 py-3.5 flex gap-3"
          style={{
            background: "var(--app-card-bg)",
            border: "1px solid var(--app-card-border)",
          }}
        >
          <div
            className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--app-thumb-tile-bg)",
              border: "1px solid var(--app-card-border)",
            }}
          >
            <span className="text-xl" style={{ color: "var(--app-fg-subtle)" }}>📸</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-wide uppercase" style={{ color: categoryColors.Photography }}>
              PHOTOGRAPHY
            </p>
            <h4 className="text-sm leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--app-fg)" }}>
              Sony World Photography Awards 2026 Shortlist Announced
            </h4>
            <p className="text-xs mt-1.5" style={{ color: "var(--app-fg-faint)" }}>PetaPixel · 2d ago</p>
          </div>
          <Bookmark size={14} className="flex-shrink-0 self-start mt-0.5" style={{ color: "var(--app-fg-faint)" }} />
        </motion.div>

        {/* Row 4: True Crime */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl px-4 py-3.5 flex gap-3"
          style={{
            background: "var(--app-card-bg)",
            border: "1px solid var(--app-card-border)",
          }}
        >
          <div
            className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--app-thumb-tile-bg)",
              border: "1px solid var(--app-card-border)",
            }}
          >
            <span className="text-xl" style={{ color: "var(--app-fg-subtle)" }}>🎙️</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-wide uppercase" style={{ color: categoryColors["True Crime"] }}>
              TRUE CRIME
            </p>
            <h4 className="text-sm leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--app-fg)" }}>
              'Harbour Dark' Podcast Tops Charts — Maritime Mysteries Series
            </h4>
            <p className="text-xs mt-1.5" style={{ color: "var(--app-fg-faint)" }}>Spotify · 1d ago</p>
          </div>
          <Bookmark size={14} className="flex-shrink-0 self-start mt-0.5" style={{ color: "var(--app-fg-faint)" }} />
        </motion.div>
      </div>
    </div>
  );
}
