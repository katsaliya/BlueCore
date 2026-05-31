import { useState, useRef, useEffect, useCallback } from "react";
import { Search, FileText, UploadCloud, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { completedDocs } from "../data/mockData";

type Tab = "All" | "In Progress" | "Complete" | "Shared";

const inProgressDocs = [
  { title: "Voyage Log", sub: "MV Nordic Star · Started today", progress: 57, fields: "8 of 14" },
  { title: "Port Arrival Report", sub: "MV Nordic Star · Started yesterday", progress: 57, fields: "8 of 14" },
];

const staticCompletedDocs = [
  { title: "Safety Inspection", sub: "22 Apr · MV Nordic Star", docType: null as null },
  { title: "Engine Room Log", sub: "21 Apr · MV Nordic Star", docType: null as null },
  { title: "Voyage Log", sub: "19 Apr · MV Nordic Star", docType: null as null },
];

const sharedDocs = [
  { title: "Oil Record Book Part I", sub: "23 Apr 2025", sentTo: "Capt. R. Andersen", role: "Master, MV Nordic Star", time: "23 Apr · 16:42", initials: "RA" },
  { title: "Engine Room Log", sub: "21 Apr 2025", sentTo: "Tomi Womi", role: "Chief Engineer", time: "21 Apr · 17:05", initials: "TW" },
  { title: "Safety Inspection Report", sub: "22 Apr 2025", sentTo: "Port Authority Hamburg", role: "Port State Control", time: "22 Apr · 09:18", initials: "PA" },
  { title: "Voyage Log", sub: "19 Apr 2025", sentTo: "Nordic Shipping LLC", role: "Ship Operator", time: "19 Apr · 18:30", initials: "NS" },
];

export function PastDocuments() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportedDoc, setExportedDoc] = useState<string | null>(null);
  const [uploadActive, setUploadActive] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleExport = useCallback((title: string) => {
    setExportedDoc(title);
    setTimeout(() => setExportedDoc(null), 1800);
  }, []);

  const handleUpload = () => {
    setUploadActive(true);
    fileInputRef.current?.click();
    setTimeout(() => setUploadActive(false), 1500);
  };

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const closeSearch = () => { setShowSearch(false); setSearchQuery(""); };

  const q = searchQuery.toLowerCase();

  const allCompleted = [
    ...completedDocs.map((d) => ({
      title: d.title,
      sub: `${d.timestamp.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · MV Nordic Star`,
      docType: d.docType,
    })),
    ...staticCompletedDocs,
  ];

  const filteredInProgress = inProgressDocs.filter((d) => !q || d.title.toLowerCase().includes(q));
  const filteredCompleted = allCompleted.filter((d) => !q || d.title.toLowerCase().includes(q));
  const filteredShared = sharedDocs.filter((d) => !q || d.title.toLowerCase().includes(q) || d.sentTo.toLowerCase().includes(q));

  const showInProgress = activeTab === "All" || activeTab === "In Progress";
  const showComplete = activeTab === "All" || activeTab === "Complete";
  const showShared = activeTab === "All" || activeTab === "Shared";

  return (
    <div className="h-full relative" style={{ overflow: "hidden" }}>

      {/* Scrollable content */}
      <div className="h-full overflow-y-auto px-5 pt-12 pb-32" style={{ scrollbarWidth: "none" }}>

        <div className="mb-1">
          <h2 className="text-2xl" style={{ color: "var(--app-fg)" }}>Past Docs</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--app-fg-subtle)" }}>Your logs and submissions</p>
        </div>

        {/* Filter tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {(["All", "In Progress", "Complete", "Shared"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full text-sm transition-all flex-shrink-0"
              style={
                activeTab === tab
                  ? { background: "var(--app-accent-soft)", border: "1px solid var(--app-accent-border-40)", color: "var(--app-accent)" }
                  : { background: "var(--app-surface-hover)", border: "1px solid var(--app-card-border)", color: "var(--app-fg-subtle)" }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* In Progress */}
        {showInProgress && filteredInProgress.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--app-fg-faint)" }}>IN PROGRESS</p>
            {filteredInProgress.map((doc, i) => (
              <motion.div
                key={doc.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mb-3 rounded-2xl p-4"
                style={{ background: "var(--app-card-gradient-strong)", border: "1px solid var(--app-accent-border-25)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-1">
                    <FileText size={15} style={{ color: "var(--app-accent)" }} />
                    <span className="text-sm" style={{ color: "var(--app-fg)" }}>{doc.title}</span>
                  </div>
                  <button onClick={() => navigate("/home-v2")} className="text-[11px]" style={{ color: "var(--app-accent)" }}>Resume →</button>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--app-fg-faint)" }}>{doc.sub}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--app-fg-subtle)" }}>{doc.fields} fields</span>
                    <span className="text-xs" style={{ color: "var(--app-fg-faint)" }}>{doc.progress}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full mt-1.5" style={{ background: "var(--app-progress-track)" }}>
                    <div className="h-1 rounded-full" style={{ width: `${doc.progress}%`, background: "var(--app-accent)" }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Complete */}
        {showComplete && filteredCompleted.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--app-fg-faint)" }}>COMPLETE</p>
            {filteredCompleted.map((doc, i) => (
              <motion.div
                key={`${doc.title}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mb-2 rounded-xl px-4 py-3.5 flex items-center gap-3"
                style={{ background: "var(--app-card-bg)", border: "1px solid var(--app-card-border)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(79,195,247,0.1)", border: "1px solid rgba(79,195,247,0.2)" }}
                >
                  <FileText size={14} style={{ color: "#4fc3f7" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: "var(--app-fg)" }}>{doc.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--app-fg-faint)" }}>{doc.sub}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399" }}>
                    Complete
                  </div>
                  {doc.docType ? (
                    <button
                      onClick={() => navigate("/document-preview", { state: { docType: doc.docType, title: doc.title } })}
                      className="text-[10px]"
                      style={{ color: "var(--app-accent)" }}
                    >
                      View →
                    </button>
                  ) : (
                    <button
                      onClick={() => handleExport(doc.title)}
                      className="text-[10px] transition-colors"
                      style={{ color: exportedDoc === doc.title ? "#34d399" : "var(--app-fg-faint)" }}
                    >
                      {exportedDoc === doc.title ? "Exported ✓" : "Export"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Shared */}
        {showShared && filteredShared.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--app-fg-faint)" }}>SHARED</p>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--app-card-border)", background: "var(--app-card-bg)" }}>
              {filteredShared.map((doc, i) => (
                <motion.div
                  key={`${doc.title}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3.5"
                  style={{ borderBottom: i < filteredShared.length - 1 ? "1px solid var(--app-card-border)" : "none" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold"
                    style={{ background: "var(--app-accent-soft)", border: "1px solid var(--app-accent-border-25)", color: "var(--app-accent)" }}
                  >
                    {doc.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: "var(--app-fg)" }}>{doc.title}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Send size={9} style={{ color: "var(--app-fg-faint)", flexShrink: 0 }} />
                      <span className="text-xs truncate" style={{ color: "var(--app-fg-faint)" }}>{doc.sentTo} · {doc.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color: "var(--app-fg-faint)" }}>{doc.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when search yields nothing */}
        {q && filteredInProgress.length === 0 && filteredCompleted.length === 0 && filteredShared.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-2">
            <Search size={24} style={{ color: "var(--app-fg-faint)" }} />
            <p className="text-sm" style={{ color: "var(--app-fg-faint)" }}>No documents match "{searchQuery}"</p>
          </div>
        )}

        {/* Upload zone — All tab only */}
        {activeTab === "All" && !q && (
          <>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" />
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              className="w-full mt-6 rounded-xl px-4 py-4 flex items-center gap-3 text-left"
              style={{
                background: uploadActive ? "rgba(245,158,11,0.08)" : "var(--app-upload-zone-bg)",
                border: `1px dashed ${uploadActive ? "rgba(245,158,11,0.5)" : "var(--app-card-border)"}`,
                transition: "background 0.2s, border 0.2s",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <UploadCloud size={15} style={{ color: "var(--app-warning)" }} />
              </div>
              <div className="flex-1">
                <div className="text-sm" style={{ color: "var(--app-fg-subtle)" }}>
                  {uploadActive ? "Opening file picker…" : "Upload a document template"}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--app-fg-faint)" }}>For port-specific or one-off forms</div>
              </div>
              <div className="text-lg" style={{ color: "var(--app-fg-faint)" }}>+</div>
            </motion.button>
          </>
        )}
      </div>

      {/* Floating search button — bottom left above nav */}
      <AnimatePresence>
        {!showSearch && (
          <motion.button
            key="search-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            onClick={() => setShowSearch(true)}
            className="flex items-center justify-center rounded-full"
            style={{
              position: "absolute",
              bottom: 100,
              left: 20,
              width: 46,
              height: 46,
              background: "var(--app-icon-button-bg)",
              border: "1px solid var(--app-accent-border-12)",
              zIndex: 30,
            }}
          >
            <Search size={16} style={{ color: "var(--app-fg-subtle)" }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            key="search-bar"
            initial={{ opacity: 0, y: 12, scaleX: 0.7 }}
            animate={{ opacity: 1, y: 0, scaleX: 1 }}
            exit={{ opacity: 0, y: 12, scaleX: 0.7 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "absolute",
              bottom: 100,
              left: 20,
              right: 20,
              height: 46,
              borderRadius: 23,
              background: "var(--app-nav)",
              border: "1px solid var(--app-nav-border)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              paddingLeft: 16,
              paddingRight: 8,
              gap: 10,
              transformOrigin: "left center",
            }}
          >
            <Search size={14} style={{ color: "var(--app-fg-faint)", flexShrink: 0 }} />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents…"
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "var(--app-fg)" }}
              onKeyDown={(e) => e.key === "Escape" && closeSearch()}
            />
            <button
              onClick={closeSearch}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--app-surface-hover)" }}
            >
              <X size={13} style={{ color: "var(--app-fg-subtle)" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
