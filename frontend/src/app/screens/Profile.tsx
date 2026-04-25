import { motion } from "motion/react";
import { currentUser } from "../data/mockData";
import { useNavigate } from "react-router";
import { ChevronLeft, Ship, MapPin, Star, Bell, Shield, Sliders, ChevronRight } from "lucide-react";

export function Profile() {
  const navigate = useNavigate();

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1751563696363-abb675273f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHN1bnNldCUyMGhvcml6b24lMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NzI3NTQwNjZ8MA&ixlib=rb-4.1.0&q=80&w=800"
          alt="ocean"
          className="w-full h-48 object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--app-screen-tint))",
          }}
        />
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
      </div>

      {/* Avatar + info */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-20 h-20 rounded-2xl object-cover"
            style={{ border: "4px solid var(--app-screen-tint)" }}
          />
          <div className="pb-1">
            <h2 className="text-xl" style={{ color: "var(--app-fg)" }}>{currentUser.name}</h2>
            <p className="text-sm" style={{ color: "var(--app-accent)" }}>{currentUser.role}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Days at Sea", value: currentUser.daysAtSea, icon: <Ship size={13} /> },
            { label: "Wellbeing", value: `${currentUser.wellbeingScore}%`, icon: "💛" },
            { label: "Joined", value: `${currentUser.joinedDays}d ago`, icon: <Star size={13} /> },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 text-center"
              style={{ background: "var(--app-card-bg)", border: "1px solid var(--app-card-border)" }}
            >
              <div className="flex justify-center mb-1" style={{ color: "var(--app-fg-faint)" }}>
                {typeof s.icon === "string" ? <span>{s.icon}</span> : s.icon}
              </div>
              <p className="text-sm" style={{ color: "var(--app-fg)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--app-fg-faint)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Vessel info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 mb-5"
          style={{
            background: "var(--app-card-gradient)",
            border: "1px solid var(--app-accent-border-25)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-wider mb-2"
            style={{ color: "var(--app-accent)", opacity: 0.9 }}
          >
            Current Assignment
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Ship size={13} style={{ color: "var(--app-fg-faint)" }} />
              <span className="text-sm" style={{ color: "var(--app-fg)" }}>{currentUser.vessel}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} style={{ color: "var(--app-fg-faint)" }} />
              <span className="text-sm" style={{ color: "var(--app-fg-subtle)" }}>Home Port: {currentUser.homePort}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} style={{ color: "var(--app-accent)", opacity: 0.75 }} />
              <span className="text-sm" style={{ color: "var(--app-fg-subtle)" }}>Next Port: {currentUser.nextPortCall}</span>
            </div>
          </div>
        </motion.div>

        {/* Interests */}
        <div className="mb-5">
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--app-fg-subtle)" }}>Your Interests</p>
          <div className="flex flex-wrap gap-2">
            {currentUser.interests.map((interest) => (
              <div
                key={interest}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{
                  background: "var(--app-accent-soft)",
                  border: "1px solid var(--app-accent-border-30)",
                  color: "var(--app-accent)",
                }}
              >
                {interest}
              </div>
            ))}
            <button
              className="text-xs px-3 py-1.5 rounded-full"
              style={{
                background: "var(--app-surface-hover)",
                border: "1px solid var(--app-card-border)",
                color: "var(--app-fg-faint)",
              }}
            >
              + Add Interest
            </button>
          </div>
        </div>

        {/* SEREN Settings */}
        <div className="mb-5">
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--app-fg-subtle)" }}>SEREN Preferences</p>
          <div className="space-y-2">
            {[
              { icon: <Bell size={14} />, label: "Break Check-in Reminders", sub: "Active on scheduled breaks", on: true },
              { icon: <Shield size={14} />, label: "Voice Acoustic Analysis", sub: "Stress detection via speech", on: true },
              { icon: <Sliders size={14} />, label: "Personalised News", sub: "Curated by your interests", on: true },
              { icon: <Star size={14} />, label: "Social Suggestions", sub: "Match based on schedules & interests", on: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "var(--app-card-bg)", border: "1px solid var(--app-card-border)" }}
              >
                <div style={{ color: "var(--app-fg-faint)" }}>{item.icon}</div>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: "var(--app-fg)" }}>{item.label}</p>
                  <p className="text-[10px]" style={{ color: "var(--app-fg-faint)" }}>{item.sub}</p>
                </div>
                <div
                  className="w-9 h-5 rounded-full relative"
                  style={{
                    background: item.on ? "var(--app-accent)" : "var(--app-toggle-track-off)",
                  }}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all ${item.on ? "left-4" : "left-0.5"}`}
                    style={{ background: "#ffffff" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings links */}
        <div className="space-y-2">
          {["Edit Profile", "Language & Region", "Privacy Settings", "About SEREN", "Log Out"].map((label) => (
            <button
              key={label}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: "var(--app-surface-ghost)",
                border: "1px solid var(--app-card-border)",
              }}
            >
              <span
                className="text-sm"
                style={{ color: label === "Log Out" ? "var(--app-danger)" : "var(--app-fg-subtle)" }}
              >
                {label}
              </span>
              {label !== "Log Out" && <ChevronRight size={13} style={{ color: "var(--app-fg-faint)" }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
