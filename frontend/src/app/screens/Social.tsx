import { motion } from "motion/react";
import { crewMembers, currentUser } from "../data/mockData";
import { Coffee, Star, MessageCircle, Users, Utensils } from "lucide-react";

const moodColors: Record<string, string> = {
  good: "text-emerald-400",
  neutral: "text-amber-400",
  tired: "text-orange-400",
};

const moodEmoji: Record<string, string> = {
  good: "😊",
  neutral: "😐",
  tired: "😴",
};

export function Social() {
  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-white text-xl">Connect</h2>
        <p className="text-white/40 text-sm mt-0.5">Crew on MV Nordic Star</p>
      </div>

      {/* SEREN Suggestion Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a2f] to-[#0f2018] border border-emerald-500/25 p-4"
      >
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/8 blur-xl" />
        <div className="flex items-start gap-3 relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-app-highlight to-app-accent flex items-center justify-center flex-shrink-0">
            <div className="flex items-end gap-[2px] h-3.5">
              {[2, 3, 2].map((h, i) => (
                <div key={i} className="w-[2px] rounded-full bg-white" style={{ height: h * 2 }} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-app-highlight/70 uppercase tracking-wider mb-1">SEREN Suggests</p>
            <p className="text-white/90 text-sm leading-relaxed">
              Elena and Marcus both have breaks right now and share your interests. A lunch meetup could be great for all three of you. 🍽️
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 bg-emerald-500/15 text-emerald-400 text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5">
            <Utensils size={12} />
            Suggest Meetup
          </button>
          <button className="flex-1 bg-white/5 text-white/50 text-xs rounded-xl py-2.5">
            Maybe Later
          </button>
        </div>
      </motion.div>

      {/* Break time matches */}
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">🟢 Free Right Now</p>
        <div className="space-y-3">
          {crewMembers.filter(c => c.status === "On Break").map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-[#0d1528] to-[#0a0f1e] border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0a0f1e] flex items-center justify-center">
                    <span className="text-[8px]">{moodEmoji[member.mood]}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm">{member.name}</p>
                    <div className="flex items-center gap-0.5 bg-amber-500/10 rounded-full px-1.5 py-0.5">
                      <Star size={9} className="text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-amber-400">{member.compatibility}%</span>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs">{member.role}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {member.sharedInterests.map(interest => (
                      <span key={interest} className="text-[10px] bg-app-highlight/10 text-app-highlight px-2 py-0.5 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
                <Coffee size={11} className="text-white/30" />
                <span className="text-white/30 text-[11px]">Break until {member.breakTime.split("–")[1]}</span>
                <span className="ml-auto text-white/20 text-[10px]">Last spoke: {member.lastSpoke}</span>
              </div>
              <button className="w-full mt-2 bg-app-accent/25 text-app-highlight text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5">
                <MessageCircle size={12} />
                Send Meetup Invite
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rest of crew */}
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">⚓ Full Crew</p>
        <div className="space-y-2">
          {crewMembers.filter(c => c.status !== "On Break").map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="bg-white/4 border border-white/6 rounded-xl p-3 flex items-center gap-3"
            >
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover opacity-70"
                />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm">{member.name}</p>
                <p className="text-white/30 text-xs">{member.role} · {member.status}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/30">Break</p>
                <p className="text-[11px] text-white/50">{member.breakTime}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Community stats */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-app-highlight" />
          <p className="text-xs text-white/50 uppercase tracking-wider">Crew Wellbeing Summary</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Avg Mood", value: "74%", color: "text-emerald-400" },
            { label: "Social Index", value: "61%", color: "text-amber-400" },
            { label: "Crew Size", value: "24", color: "text-app-highlight" },
          ].map((s) => (
            <div key={s.label}>
              <p className={`text-lg ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
