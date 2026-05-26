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

const NEWS_IDS = ["featured", "f1", "cooking", "photography", "truecrime"];

export function Connect() {
  const navigate = useNavigate();
  const [activeInterest, setActiveInterest] = useState<Interest>("All");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [inviteSent, setInviteSent] = useState(false);

  const toggleBookmark = (id: string) =>
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleInvite = () => {
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2000);
  };

  return (
    <div className="px-5 pt-12 pb-28">
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
              onClick={handleInvite}
              className="rounded-full px-2.5 py-1 text-[10px] transition-all"
              style={{
                background: inviteSent ? "rgba(16,185,129,0.15)" : "var(--app-accent-soft)",
                border: `1px solid ${inviteSent ? "rgba(16,185,129,0.4)" : "var(--app-accent-border-30)"}`,
                color: inviteSent ? "#34d399" : "var(--app-accent)",
              }}
            >
              {inviteSent ? "Sent ✓" : "Invite"}
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
          onClick={() => toggleBookmark("featured")}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--app-bookmark-fab-bg)", backdropFilter: "blur(8px)" }}
        >
          <Bookmark
            size={14}
            fill={bookmarked.has("featured") ? "var(--app-accent)" : "none"}
            style={{ color: bookmarked.has("featured") ? "var(--app-accent)" : "var(--app-fg-subtle)" }}
          />
        </button>
      </motion.div>

      {/* News list */}
      <div className="mt-4 space-y-3">
        {[
          { id: "f1", emoji: "🏎", category: "F1", color: categoryColors.F1, headline: "Verstappen Takes Pole in Bahrain — 0.04s ahead of Norris", source: "F1.com · 5h ago", delay: 0.05 },
          { id: "cooking", emoji: "🍳", category: "Cooking", color: categoryColors.Cooking, headline: "Gordon Ramsay Opens Waterfront Restaurant in Amsterdam Harbour", source: "Food & Wine · 1d ago", delay: 0.1 },
          { id: "photography", emoji: "📸", category: "Photography", color: categoryColors.Photography, headline: "Sony World Photography Awards 2026 Shortlist Announced", source: "PetaPixel · 2d ago", delay: 0.15 },
          { id: "truecrime", emoji: "🎙️", category: "True Crime", color: categoryColors["True Crime"], headline: "'Harbour Dark' Podcast Tops Charts — Maritime Mysteries Series", source: "Spotify · 1d ago", delay: 0.2 },
        ].map((row) => (
          <motion.button
            key={row.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: row.delay }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl px-4 py-3.5 flex gap-3 text-left"
            style={{ background: "var(--app-card-bg)", border: "1px solid var(--app-card-border)" }}
          >
            <div
              className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--app-thumb-tile-bg)", border: "1px solid var(--app-card-border)" }}
            >
              <span className="text-xl" style={{ color: "var(--app-fg-subtle)" }}>{row.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-wide uppercase" style={{ color: row.color }}>{row.category}</p>
              <h4 className="text-sm leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--app-fg)" }}>{row.headline}</h4>
              <p className="text-xs mt-1.5" style={{ color: "var(--app-fg-faint)" }}>{row.source}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleBookmark(row.id); }}
              className="flex-shrink-0 self-start mt-0.5 p-1 -mr-1"
            >
              <Bookmark
                size={14}
                fill={bookmarked.has(row.id) ? "var(--app-accent)" : "none"}
                style={{ color: bookmarked.has(row.id) ? "var(--app-accent)" : "var(--app-fg-faint)" }}
              />
            </button>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
