import { Outlet, useLocation, useNavigate } from "react-router";
import { Globe, Compass, Archive, User } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./contexts/ThemeContext";

const navItems = [
  { path: "/home-v2", icon: Globe, label: "Core" },
  { path: "/documents", icon: Archive, label: "Past Docs" },
  { path: "/social", icon: Compass, label: "Connect" },
  { path: "/profile", icon: User, label: "You" },
];

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-app-canvas text-app-fg">
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 96 }}>
        <Outlet />
      </div>

      <nav
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 48px)",
          zIndex: 50,
          borderRadius: 20,
          background: theme === "light" ? "rgba(255,255,255,0.18)" : "rgba(15,25,45,0.50)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid rgba(${theme === "light" ? "37,70,127" : "255,255,255"},0.06)`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          padding: "8px 16px",
        }}
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1.5 px-4 py-1"
              >
                <motion.div whileTap={{ scale: 0.88 }}>
                  <item.icon
                    size={20}
                    className={isActive ? "text-app-accent" : "text-app-fg-muted"}
                  />
                </motion.div>
                <span
                  className={`text-[10px] tracking-wide ${isActive ? "text-app-accent" : "text-app-fg-muted"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
