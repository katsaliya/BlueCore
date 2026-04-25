import { motion } from "motion/react";

export function Splash() {
  return (
    <div className="flex items-center justify-center h-screen w-full relative overflow-hidden bg-app-nav">
      {/* Radial glow */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--app-highlight) 12%, transparent) 0%, transparent 60%)",
          width: "300px",
          height: "300px",
          margin: "auto",
        }}
      />

      {/* Logo container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center relative z-10"
      >
        {/* Logo mark - B and C forming boat */}
        <div className="relative mb-6" style={{ height: "80px" }}>
          {/* The logo mark - using text elements positioned to form a boat */}
          <div className="relative flex items-end justify-center">
            {/* B - forms the hull (white) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-white font-bold"
              style={{
                fontFamily: "Unbounded, sans-serif",
                fontSize: "72px",
                lineHeight: 1,
                letterSpacing: "-0.05em",
              }}
            >
              B
            </motion.div>

            {/* C - forms the sail (cyan, positioned to curve upward) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-bold absolute"
              style={{
                fontFamily: "Unbounded, sans-serif",
                fontSize: "72px",
                lineHeight: 1,
                color: "var(--app-highlight)",
                transform: "translateX(32px) translateY(-8px) rotate(-10deg)",
                letterSpacing: "-0.05em",
              }}
            >
              C
            </motion.div>
          </div>
        </div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-white text-2xl font-bold"
          style={{
            fontFamily: "Unbounded, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          BlueCore
        </motion.div>

        {/* AI label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-xs uppercase mt-1.5"
          style={{
            color: "rgba(79,195,247,0.6)",
            letterSpacing: "0.3em",
          }}
        >
          AI
        </motion.div>
      </motion.div>
    </div>
  );
}
