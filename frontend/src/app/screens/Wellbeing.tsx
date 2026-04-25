import { motion } from "motion/react";
import { Mic, Info } from "lucide-react";

export function Wellbeing() {
  return (
    <div className="px-5 pt-4 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-xl">Fatigue Insights</h2>
        <p className="text-white/40 text-sm mt-0.5">Detected passively via voice · SEREN</p>
      </div>

      {/* Fatigue status card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3a6e] to-[#0d2040] border border-[#4fc3f7]/20 p-5 mt-5"
      >
        {/* Ambient glow */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#4fc3f7]/8 blur-2xl" />

        {/* Main content row */}
        <div className="flex items-center gap-4 relative">
          {/* Icon circle */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(79,195,247,0.1)",
              border: "1px solid rgba(79,195,247,0.2)",
            }}
          >
            <Mic size={20} style={{ color: "#4fc3f7" }} />
          </div>

          {/* Status info */}
          <div className="flex-1">
            <p className="text-white/50 text-xs tracking-wide uppercase">Today's Reading</p>
            <p className="text-amber-400 text-base mt-0.5">Moderate Fatigue Detected</p>
            <p className="text-white/30 text-xs mt-1">Via 3 voice sessions today</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-around">
          <div className="text-center">
            <div className="text-white text-lg">3</div>
            <div className="text-white/40 text-xs">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-white text-lg">18</div>
            <div className="text-white/40 text-xs">Days at sea</div>
          </div>
          <div className="text-center">
            <div className="text-amber-400 text-lg">↑12%</div>
            <div className="text-white/40 text-xs">vs last week</div>
          </div>
        </div>
      </motion.div>

      {/* Explainer card */}
      <div className="mt-4 rounded-xl bg-white/4 border border-white/6 px-4 py-4">
        <div className="flex items-start gap-2.5">
          <Info size={14} className="text-white/30 flex-shrink-0 mt-0.5" />
          <p className="text-white/50 text-sm leading-relaxed">
            SEREN analyses acoustic patterns in your voice during document sessions. No manual input required — fatigue indicators update automatically after each session.
          </p>
        </div>
      </div>
    </div>
  );
}
