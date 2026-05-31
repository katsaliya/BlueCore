import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { AppNav } from "./components/AppNav";

const slideVariants = {
  enter: (dir: string) => ({
    x: dir === "right" ? "100%" : "-100%",
    scale: 0.96,
    opacity: 0,
  }),
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
    transition: {
      x:     { duration: 0.44, ease: [0.16, 1, 0.3, 1] as const },
      scale: { duration: 0.44, ease: [0.16, 1, 0.3, 1] as const },
      opacity: { duration: 0.2 },
    },
  },
  exit: (dir: string) => ({
    x: dir === "right" ? "-28%" : "28%",
    scale: 0.88,
    opacity: 0,
    transition: {
      x:     { duration: 0.2, ease: [0.6, 0, 1, 0.45] as const },
      scale: { duration: 0.2, ease: [0.6, 0, 1, 0.45] as const },
      opacity: { duration: 0.14 },
    },
  }),
};

export function Root() {
  const location = useLocation();
  const direction = (location.state as { direction?: string } | null)?.direction ?? "right";

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-app-canvas text-app-fg">
      {/* Clip wrapper — overflow hidden so slides don't peek outside */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="sync" custom={direction} initial={false}>
          <motion.div
            key={location.pathname}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              position: "absolute",
              inset: 0,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      <AppNav />
    </div>
  );
}
