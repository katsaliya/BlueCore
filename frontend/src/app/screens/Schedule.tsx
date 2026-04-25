import { Users } from "lucide-react";
import { motion } from "motion/react";

const days = [
  { day: "Mon", date: 21, hasDot: true, dotColor: "var(--app-warning)" },
  { day: "Tue", date: 22, hasDot: false, dotColor: "" },
  { day: "Wed", date: 23, hasDot: true, dotColor: "var(--app-schedule-duty-dot)" },
  { day: "Thu", date: 24, hasDot: false, dotColor: "" },
  { day: "Fri", date: 25, hasDot: true, dotColor: "var(--app-warning)" },
  { day: "Sat", date: 26, hasDot: false, dotColor: "" },
  { day: "Sun", date: 27, hasDot: false, dotColor: "" },
];

const timelineEntries = [
  { time: "06:00", type: "duty", label: "Watch Begins" },
  { time: "08:00", type: "duty", label: "Bridge Inspection" },
  { time: "11:30", type: "duty", label: "Log Report Submission" },
  { time: "12:00", type: "break", label: "Lunch Break" },
  {
    time: "12:00",
    type: "personal",
    label: "BBQ on the deck 🔥",
    crew: ["Marcus", "Elena"],
    avatars: [
      "https://i.pravatar.cc/150?img=12",
      "https://i.pravatar.cc/150?img=45",
    ],
  },
  { time: "13:30", type: "duty", label: "Watch Resumes" },
  { time: "17:00", type: "duty", label: "Handover Prep" },
  { time: "18:00", type: "duty", label: "Watch Ends" },
];

const crewBreaks = [
  { name: "Elena Petrov", avatar: "https://i.pravatar.cc/150?img=45", time: "12:00–13:30" },
  { name: "Marcus Osei", avatar: "https://i.pravatar.cc/150?img=12", time: "12:00–13:00" },
];

export function Schedule() {
  return (
    <div className="px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl" style={{ color: "var(--app-fg)" }}>Schedule</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--app-fg-subtle)" }}>Day Watch · Wed 23 Apr</p>
        </div>
        <button
          className="rounded-full px-3.5 py-1.5 text-xs"
          style={{
            background: "var(--app-accent-soft)",
            border: "1px solid var(--app-accent-border-40)",
            color: "var(--app-accent)",
          }}
        >
          + Plan
        </button>
      </div>

      {/* Day strip */}
      <div className="mt-4 -mx-5 px-5 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {days.map((day, idx) => {
          const isActive = day.date === 23;
          return (
            <button
              key={idx}
              className="w-10 rounded-xl flex flex-col items-center py-2 flex-shrink-0"
              style={
                isActive
                  ? {
                      background: "var(--app-accent-soft)",
                      border: "1px solid var(--app-accent-border-40)",
                    }
                  : {
                      background: "var(--app-surface-hover)",
                      border: "1px solid var(--app-card-border)",
                    }
              }
            >
              <span
                className="text-[10px] tracking-wide"
                style={{ color: isActive ? "var(--app-accent)" : "var(--app-fg-faint)" }}
              >
                {day.day}
              </span>
              <span
                className="text-sm mt-0.5"
                style={{ color: isActive ? "var(--app-accent)" : "var(--app-fg-subtle)" }}
              >
                {day.date}
              </span>
              {day.hasDot && (
                <div
                  className="w-1 h-1 rounded-full mt-1"
                  style={{ background: day.dotColor }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="mt-5 space-y-2">
        {timelineEntries.map((entry, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start"
          >
            <div className="w-12 text-xs text-right flex-shrink-0 pt-2" style={{ color: "var(--app-fg-faint)" }}>
              {entry.time}
            </div>

            <div className="w-px mx-3 self-stretch" style={{ background: "var(--app-divider)" }} />

            <div className="flex-1">
              {entry.type === "duty" && (
                <div
                  className="rounded-xl pl-3 pr-3 py-2.5 flex items-center justify-between"
                  style={{
                    background: "var(--app-card-bg)",
                    borderLeft: "2px solid var(--app-accent-border-40)",
                  }}
                >
                  <span className="text-sm" style={{ color: "var(--app-fg)" }}>{entry.label}</span>
                  <span className="text-[10px]" style={{ color: "var(--app-accent)" }}>Duty</span>
                </div>
              )}

              {entry.type === "break" && (
                <div
                  className="rounded-xl pl-3 pr-3 py-2.5 flex items-center justify-between"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    borderLeft: "2px solid rgba(52,211,153,0.4)",
                  }}
                >
                  <span className="text-sm" style={{ color: "var(--app-fg)" }}>{entry.label}</span>
                  <span className="text-emerald-400 text-[10px]">Break</span>
                </div>
              )}

              {entry.type === "personal" && (
                <div
                  className="rounded-xl pl-3 pr-3 py-2.5"
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    borderLeft: "2px solid rgba(251,191,36,0.4)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--app-fg)" }}>{entry.label}</span>
                    <span className="text-amber-400 text-[10px]">Plan</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex -space-x-2">
                      {entry.avatars?.map((avatar, i) => (
                        <img
                          key={i}
                          src={avatar}
                          alt=""
                          className="w-5 h-5 rounded-full"
                          style={{ border: "1px solid var(--app-card-border)" }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] ml-2" style={{ color: "var(--app-fg-faint)" }}>
                      with {entry.crew?.join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-5 rounded-2xl p-4"
        style={{
          background: "var(--app-card-gradient-strong)",
          border: "1px solid var(--app-accent-border-25)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <Users size={14} style={{ color: "var(--app-accent)" }} />
            <span className="text-xs ml-1.5" style={{ color: "var(--app-fg-subtle)" }}>
              Crew free at the same time as you
            </span>
          </div>
          <span className="text-xs" style={{ color: "var(--app-accent)" }}>12:00–13:00</span>
        </div>

        <div className="mt-3 space-y-2.5">
          {crewBreaks.map((crew, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <img
                src={crew.avatar}
                alt={crew.name}
                className="w-7 h-7 rounded-full"
                style={{ border: "1px solid var(--app-card-border)" }}
              />
              <span className="text-xs flex-1" style={{ color: "var(--app-fg)" }}>{crew.name}</span>
              <span className="text-[11px]" style={{ color: "var(--app-fg-faint)" }}>{crew.time}</span>
              <button
                className="rounded-full px-2.5 py-0.5 text-[10px]"
                style={{
                  background: "var(--app-accent-soft)",
                  border: "1px solid var(--app-accent-border-30)",
                  color: "var(--app-accent)",
                }}
              >
                Invite
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
