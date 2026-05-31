import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, CheckCircle, Download } from "lucide-react";

const PDF_URL = "/filled-oil-record-book.pdf";
const PDF_DOWNLOAD_NAME = "Filled CG-4602A_11-16_Oil_Record_Book-full.pdf";

export function DocumentPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { title } =
    (location.state as { docType?: string; title?: string }) ?? {};

  const displayTitle = title ?? "Oil Record Book Part I - Filled PDF";

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "#E1ECFF" }}
    >
      <div
        className="flex-shrink-0 flex items-center gap-3 px-5 pt-12 pb-4"
        style={{
          background: "rgba(225,236,255,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(37,70,127,0.1)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          aria-label="Go back"
          style={{
            background: "rgba(37,70,127,0.08)",
            border: "1px solid rgba(37,70,127,0.12)",
          }}
        >
          <ChevronLeft size={16} style={{ color: "rgba(37,70,127,0.6)" }} />
        </button>

        <div className="flex-1 min-w-0">
          <h1
            className="text-sm font-semibold truncate"
            style={{ color: "#1a3260", fontFamily: "Unbounded, sans-serif" }}
          >
            {displayTitle}
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(37,70,127,0.45)" }}>
            Filled CG-4602A Oil Record Book PDF
          </p>
        </div>

        <a
          href={PDF_URL}
          download={PDF_DOWNLOAD_NAME}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full flex-shrink-0"
          style={{
            background: "rgba(79,195,247,0.12)",
            border: "1px solid rgba(79,195,247,0.3)",
          }}
        >
          <Download size={13} style={{ color: "#4fc3f7" }} />
          <span className="text-[11px]" style={{ color: "#4fc3f7" }}>
            Export
          </span>
        </a>
      </div>

      <div className="flex-shrink-0 px-5 pt-3 pb-1">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <CheckCircle size={11} style={{ color: "#16a34a" }} />
          <span className="text-[10px] tracking-wide" style={{ color: "#16a34a" }}>
            All fields complete - ready to export
          </span>
        </motion.div>
      </div>

      <motion.div
        className="flex-1 px-4 pt-3 pb-5 min-h-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div
          className="h-full rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(37,70,127,0.12)",
            boxShadow: "0 18px 50px rgba(37,70,127,0.12)",
          }}
        >
          <iframe
            title={displayTitle}
            src={`${PDF_URL}#toolbar=1&navpanes=0&view=FitH`}
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </motion.div>
    </div>
  );
}
