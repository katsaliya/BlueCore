import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ArrowUp } from "lucide-react";
import { crewMembers } from "../data/mockData";

const mockConversation = [
  { role: "assistant" as const, text: "Hey Cal 👋", timestamp: "12:05 PM" },
  { role: "assistant" as const, text: "How did your morning watch go? And are you looking for someone to grab lunch with?", timestamp: "12:05 PM" },
  { role: "user" as const, text: "Yeah it was a busy one honestly, cargo inspection overran.", timestamp: "12:06 PM" },
  { role: "assistant" as const, text: "Got it. Sounds like the morning had its moments. How are you feeling overall — tension in the shoulders, or more of a mental load?", timestamp: "12:07 PM" },
  { role: "user" as const, text: "Bit of both to be honest, could use a break", timestamp: "12:07 PM" },
];

const availableCrewmates = crewMembers.slice(0, 2).map((crew) => ({
  id: crew.id,
  name: crew.name,
  avatar: crew.avatar,
  role: crew.role,
  breakTime: crew.breakTime,
  sharedInterests: crew.sharedInterests,
}));

export function ConversationView() {
  const navigate = useNavigate();
  const [messages] = useState(mockConversation);

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-app-canvas">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 55% at 50% 5%, rgba(37,70,127,0.09) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 15% 85%, rgba(99,130,200,0.1) 0%, transparent 60%)
            `,
          }}
        />
      </div>

      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-4 relative z-10">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--app-icon-button-bg)", border: "1px solid var(--app-accent-border-12)" }}
        >
          <ChevronLeft size={18} style={{ color: "var(--app-fg-subtle)" }} />
        </button>
        <div className="text-center flex-1">
          <p className="text-xs tracking-widest uppercase" style={{ color: "var(--app-fg-subtle)" }}>
            Conversation
          </p>
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-shrink-0 px-5 pb-4 relative z-10">
        <div
          className="rounded-2xl px-5 py-4"
          style={{
            background: "var(--app-card-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--app-accent-border-12)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--app-status-break)" }} />
            <span className="text-sm" style={{ color: "var(--app-accent)" }}>On Break</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--app-fg-subtle)" }}>
            80 minutes remaining
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 relative z-10" style={{ scrollbarWidth: "none" }}>
        <div className="space-y-3 pb-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        background: "var(--app-accent-softer)",
                        border: "1px solid var(--app-accent-border-14)",
                        color: "var(--app-fg)",
                        borderRadius: "18px 18px 4px 18px",
                      }
                    : {
                        background: "var(--app-chat-assistant-bg)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid var(--app-accent-border-10)",
                        color: "var(--app-accent)",
                        borderRadius: "18px 18px 18px 4px",
                        boxShadow: "var(--app-chat-assistant-shadow)",
                      }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}

          <div className="my-6">
            <div
              className="rounded-2xl px-5 py-4"
              style={{
                background: "var(--app-card-bg)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--app-accent-border-12)",
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--app-accent)" }}>
                <span className="font-medium">Today,</span><br />
                your favorite soccer team scored 98 points again madrid!<br />
                watch the game highlights <ArrowUp size={14} className="inline" style={{ color: "var(--app-accent)" }} />
              </p>
            </div>
          </div>

          <div className="space-y-2 opacity-30">
            <p className="text-xs" style={{ color: "var(--app-accent)" }}>
              details about next shift<br />
              or what just finishes<br />
              fdafjap[djfa]dpof
            </p>
            <p className="text-xs text-right" style={{ color: "var(--app-accent)" }}>
              daj'da'kldfjaeklj '<br />
              ADLFKAAKLD
            </p>
            <p className="text-xs" style={{ color: "var(--app-accent)" }}>
              daj'da'klADLFKAAKLDFA
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs mb-3 px-2" style={{ color: "var(--app-fg-muted)" }}>
              Crewmates also on break now:
            </p>
            <div className="space-y-3">
              {availableCrewmates.map((crewmate) => (
                <div
                  key={crewmate.id}
                  className="rounded-2xl px-5 py-4 flex items-center gap-4"
                  style={{
                    background: "var(--app-card-bg)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid var(--app-accent-border-12)",
                  }}
                >
                  <img
                    src={crewmate.avatar}
                    alt={crewmate.name}
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ border: "2px solid var(--app-accent-border-15)" }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--app-fg)" }}>
                      {crewmate.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--app-fg-subtle)" }}>
                      {crewmate.role}
                    </p>
                    <div className="flex gap-1.5 mt-1.5">
                      {crewmate.sharedInterests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            background: "var(--app-icon-button-bg)",
                            color: "var(--app-fg-muted)",
                          }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-full text-xs font-medium"
                    style={{
                      background: "var(--app-accent-softer)",
                      color: "var(--app-accent)",
                      border: "1px solid var(--app-accent-border-15)",
                    }}
                  >
                    Invite
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 relative z-10 px-5 pb-8 pt-3">
        <div
          className="rounded-full px-5 py-3 flex items-center gap-3"
          style={{
            background: "var(--app-input-pill-bg)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--app-accent-border-15)",
          }}
        >
          <input
            type="text"
            placeholder="details about next shift or what just finishes"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-app-fg-muted"
            style={{ color: "var(--app-fg)" }}
          />
        </div>
      </div>
    </div>
  );
}
