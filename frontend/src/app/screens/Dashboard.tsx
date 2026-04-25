import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronRight, ChevronLeft, Wind, Thermometer, Activity } from "lucide-react";
import { currentUser, crewMembers, schedule, aiCheckInMessages } from "../data/mockData";

export function Dashboard() {
  const navigate = useNavigate();
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";

  const nextTask = schedule.find((s) => !s.done);

  return (
    <div className="px-5 py-4 space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between pt-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center">
            <ChevronLeft size={15} className="text-white/50" />
          </button>
          <div>
            <p className="text-white/50 text-sm">{greeting},</p>
            <h1 className="text-white text-2xl">{currentUser.nickname} 👋</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs">{currentUser.currentShift.label} · Lunch Break</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate("/profile")} className="w-11 h-11 rounded-full overflow-hidden border-2 border-app-highlight/40">
          <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
        </button>
      </div>

      {/* SEREN Check-in Card */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => navigate("/")}
        className="w-full relative overflow-hidden rounded-2xl border border-app-highlight/20 p-5"
        style={{ background: "var(--app-card-gradient-strong)" }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-app-highlight/10 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-[#7c3aed]/10 blur-2xl" />

        <div className="relative flex items-start gap-4">
          {/* Voice wave animation */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-app-highlight/10 border border-app-highlight/30 flex items-center justify-center">
            <div className="flex items-end gap-[3px] h-5">
              {[3, 6, 4, 7, 3, 5, 4].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full bg-app-highlight"
                  animate={{ height: [h * 2, h * 3.5, h * 2] }}
                  transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                  style={{ height: h * 2 }}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] tracking-widest text-app-highlight/70 uppercase">SEREN · Break Check-in</span>
              <span className="text-[10px] text-white/30">12:02</span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              "{aiCheckInMessages[0].text}"
            </p>
          </div>
          <ChevronRight size={16} className="text-white/30 flex-shrink-0 mt-1" />
        </div>
      </motion.button>

      {/* Wellbeing Snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          {
            label: "Wellbeing",
            value: "72",
            unit: "/100",
            color: "text-amber-400",
            bg: "from-amber-500/10 to-amber-500/5",
            border: "border-amber-500/20",
            icon: "💛",
          },
          {
            label: "Stress",
            value: "Moderate",
            unit: "",
            color: "text-orange-400",
            bg: "from-orange-500/10 to-orange-500/5",
            border: "border-orange-500/20",
            icon: "🌡",
          },
          {
            label: "Activity",
            value: "Low",
            unit: "",
            color: "text-red-400",
            bg: "from-red-500/10 to-red-500/5",
            border: "border-red-500/20",
            icon: "🏃",
          },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate("/wellbeing")}
            className={`rounded-xl bg-gradient-to-b ${stat.bg} border ${stat.border} p-3 text-left`}
          >
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className={`text-sm font-medium ${stat.color}`}>
              {stat.value}
              <span className="text-xs text-white/40">{stat.unit}</span>
            </div>
            <div className="text-[10px] text-white/40 mt-0.5">{stat.label}</div>
          </button>
        ))}
      </motion.div>

      {/* Next Up */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-white/5 border border-white/8 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/50 uppercase tracking-wider">Next Up</span>
          <button onClick={() => navigate("/schedule")} className="text-app-highlight text-xs flex items-center gap-1">
            Full Schedule <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {schedule.filter(s => !s.done).slice(0, 3).map((item, i) => (
            <div key={i} className={`flex items-center gap-3 ${i === 0 ? "opacity-100" : "opacity-50"}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                item.type === "break" ? "bg-emerald-400" :
                item.type === "duty" ? "bg-app-highlight" : "bg-white/40"
              }`} />
              <span className="text-white/60 text-xs w-10">{item.time}</span>
              <span className={`text-sm ${i === 0 ? "text-white" : "text-white/60"}`}>{item.label}</span>
              {i === 0 && (
                <span className="ml-auto text-[10px] text-app-highlight bg-app-highlight/10 px-2 py-0.5 rounded-full">Now</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Social Suggestion */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={() => navigate("/social")}
        className="w-full rounded-xl bg-gradient-to-br from-[#1e3a2f] to-[#0f2018] border border-emerald-500/20 p-4 text-left"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-emerald-400/70 uppercase tracking-wider">🤝 Lunch Suggestions</span>
          <ChevronRight size={14} className="text-white/30" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {crewMembers.filter(c => c.status === "On Break").map((m) => (
              <img key={m.id} src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full border-2 border-[#0f2018] object-cover" />
            ))}
          </div>
          <div>
            <p className="text-white text-sm">Elena & Marcus are free now</p>
            <p className="text-white/40 text-xs">Shared interests · Same break time</p>
          </div>
        </div>
      </motion.button>

      {/* News teaser */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate("/news")}
        className="w-full rounded-xl bg-white/4 border border-white/8 p-4 text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50 uppercase tracking-wider">📰 Your Headlines</span>
          <ChevronRight size={14} className="text-white/30" />
        </div>
        <p className="text-white/80 text-sm">⚽ Champions League draw revealed — Real Madrid vs Arsenal</p>
        <p className="text-white/40 text-xs mt-1">+ 4 more stories tailored to your interests</p>
      </motion.button>

      {/* Ship conditions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl bg-white/4 border border-white/8 p-4"
      >
        <p className="text-xs text-white/50 uppercase tracking-wider mb-3">🌊 Current Conditions</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Wind size={14} />, label: "Wind", value: "18 kn" },
            { icon: <Thermometer size={14} />, label: "Temp", value: "9°C" },
            { icon: <Activity size={14} />, label: "Sea State", value: "3 / Slight" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="flex justify-center text-white/30 mb-1">{item.icon}</div>
              <div className="text-white text-sm">{item.value}</div>
              <div className="text-white/30 text-[10px]">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}