import { motion } from "motion/react";
import { Ship, Anchor, Plus, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Accessible color tokens — all pass WCAG AA (4.5:1) on brand gradient (#dfebfe → #c5d9f9)
const FG = "#1a3260";
const SECONDARY = "#25467f";
const MUTED = "#3d5a8a";

export function ManagerHome() {
  const { user, logout } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full flex flex-col overflow-y-auto"
      style={{ background: "linear-gradient(160deg, #dfebfe 0%, #c5d9f9 100%)" }}
    >
      <div className="px-6 pt-12 pb-10 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: SECONDARY }}>
            Ship Operator
          </p>
          <h1
            className="font-['Unbounded',sans-serif] text-[24px] font-medium tracking-tight"
            style={{ color: FG }}
          >
            BlueCore
          </h1>
          <p className="text-sm mt-1.5" style={{ color: MUTED }}>
            Welcome, {firstName}
          </p>
        </div>

        {/* IMO Company Number card */}
        {user?.imoNumber && (
          <div
            className="rounded-2xl p-5 mb-5"
            style={{
              background: "rgba(255,255,255,0.72)",
              border: "1.5px solid rgba(37,70,127,0.22)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(37,70,127,0.1)" }}
                aria-hidden
              >
                <Ship size={16} style={{ color: SECONDARY }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: SECONDARY }}>
                  IMO Company Number
                </p>
                <p className="text-xl font-bold tracking-[0.12em]" style={{ color: FG }}>
                  {user.imoNumber}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed mt-3" style={{ color: MUTED }}>
              Your IMO Company Number is your platform identity. It links your voyages, vessels, and crew assignments to your organisation within BlueCore.
            </p>
          </div>
        )}

        {/* Empty voyage state */}
        <div
          className="rounded-2xl p-6 mb-4 text-center"
          style={{
            background: "rgba(255,255,255,0.72)",
            border: "1.5px solid rgba(37,70,127,0.22)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(37,70,127,0.1)" }}
            aria-hidden
          >
            <Ship size={22} style={{ color: SECONDARY }} />
          </div>
          <p className="text-sm font-semibold mb-1.5" style={{ color: FG }}>
            No voyages yet
          </p>
          <p className="text-xs leading-relaxed mb-5" style={{ color: MUTED }}>
            Create a voyage to assign crew by MRN and start generating pre-filled paperwork.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-2"
            style={{ background: SECONDARY, color: "#ffffff" }}
          >
            <Plus size={14} aria-hidden /> Create Voyage
          </button>
        </div>

        {/* MRN lookup explainer */}
        <div
          className="rounded-2xl p-4 mb-auto"
          style={{
            background: "rgba(255,255,255,0.52)",
            border: "1.5px solid rgba(37,70,127,0.18)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Anchor size={13} aria-hidden style={{ color: SECONDARY }} />
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: SECONDARY }}>
              Assign seafarers by MRN
            </p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
            When building a voyage, look up seafarers using their 7-digit Mariner Reference Number — the same number on their US Coast Guard Merchant Mariner Credential (MMC) and your crew manifest. Their rank and role on each voyage is set by you.
          </p>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center justify-center gap-2 mt-10 py-2 w-full text-sm font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f]"
          style={{ color: MUTED }}
        >
          <LogOut size={14} aria-hidden /> Sign out
        </button>
      </div>
    </motion.div>
  );
}
