import { useState } from "react";
import { Search, FileText, UploadCloud } from "lucide-react";
import { motion } from "motion/react";

type Tab = "All" | "In Progress" | "Submitted";

export function PastDocuments() {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl" style={{ color: "var(--app-fg)" }}>Past Docs</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--app-fg-subtle)" }}>Your logs and submissions</p>
        </div>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: "var(--app-icon-button-bg)",
            border: "1px solid var(--app-card-border)",
          }}
        >
          <Search size={16} style={{ color: "var(--app-fg-subtle)" }} />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        {(["All", "In Progress", "Submitted"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-full text-sm transition-all"
            style={
              activeTab === tab
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
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--app-fg-faint)" }}>
          IN PROGRESS
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 rounded-2xl p-4"
          style={{
            background: "var(--app-card-gradient-strong)",
            border: "1px solid var(--app-accent-border-25)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-1">
              <FileText size={15} style={{ color: "var(--app-accent)" }} />
              <span className="text-sm" style={{ color: "var(--app-fg)" }}>Voyage Log</span>
            </div>
            <span className="text-[11px]" style={{ color: "var(--app-accent)" }}>Resume →</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--app-fg-faint)" }}>
            MV Nordic Star · Started today
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--app-fg-subtle)" }}>8 of 14 fields</span>
              <span className="text-xs" style={{ color: "var(--app-fg-faint)" }}>57%</span>
            </div>
            <div className="w-full h-1 rounded-full mt-1.5" style={{ background: "var(--app-progress-track)" }}>
              <div className="h-1 rounded-full" style={{ width: "57%", background: "var(--app-accent)" }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-3 rounded-2xl p-4"
          style={{
            background: "var(--app-card-gradient-strong)",
            border: "1px solid var(--app-accent-border-25)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-1">
              <FileText size={15} style={{ color: "var(--app-accent)" }} />
              <span className="text-sm" style={{ color: "var(--app-fg)" }}>Port Arrival Report</span>
            </div>
            <span className="text-[11px]" style={{ color: "var(--app-accent)" }}>Resume →</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--app-fg-faint)" }}>
            MV Nordic Star · Started yesterday
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--app-fg-subtle)" }}>8 of 14 fields</span>
              <span className="text-xs" style={{ color: "var(--app-fg-faint)" }}>57%</span>
            </div>
            <div className="w-full h-1 rounded-full mt-1.5" style={{ background: "var(--app-progress-track)" }}>
              <div className="h-1 rounded-full" style={{ width: "57%", background: "var(--app-accent)" }} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6">
        <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--app-fg-faint)" }}>
          SUBMITTED
        </p>

        {[
          { title: "Safety Inspection", sub: "22 Apr · MV Nordic Star", delay: 0.1 },
          { title: "Engine Room Log", sub: "21 Apr · MV Nordic Star", delay: 0.15 },
          { title: "Voyage Log", sub: "19 Apr · MV Nordic Star", delay: 0.2 },
        ].map((row) => (
          <motion.div
            key={row.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: row.delay }}
            className="mb-2 rounded-xl px-4 py-3.5 flex items-center gap-3"
            style={{
              background: "var(--app-card-bg)",
              border: "1px solid var(--app-card-border)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--app-icon-button-bg)",
                border: "1px solid var(--app-card-border)",
              }}
            >
              <FileText size={14} style={{ color: "var(--app-fg-faint)" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm" style={{ color: "var(--app-fg)" }}>{row.title}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--app-fg-faint)" }}>{row.sub}</div>
            </div>
            <div className="flex flex-col items-end">
              <div
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  color: "#34d399",
                }}
              >
                Submitted
              </div>
              <span className="text-[10px] mt-1" style={{ color: "var(--app-fg-faint)" }}>Export</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 rounded-xl px-4 py-4 flex items-center gap-3"
        style={{
          background: "var(--app-upload-zone-bg)",
          border: "1px dashed var(--app-card-border)",
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <UploadCloud size={15} style={{ color: "var(--app-warning)" }} />
        </div>
        <div className="flex-1">
          <div className="text-sm" style={{ color: "var(--app-fg-subtle)" }}>Upload a document template</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--app-fg-faint)" }}>For port-specific or one-off forms</div>
        </div>
        <div className="text-lg" style={{ color: "var(--app-fg-faint)" }}>+</div>
      </motion.div>
    </div>
  );
}
