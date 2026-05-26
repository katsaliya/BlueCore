import { useNavigate, useLocation } from "react-router";
import { Globe, Archive, Compass, User } from "lucide-react";

const NAV_ITEMS = [
  { path: "/home-v2", icon: Globe },
  { path: "/documents", icon: Archive },
  { path: "/social", icon: Compass },
  { path: "/profile", icon: User },
];

export function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => location.pathname === item.path),
  );

  const navWidth = Math.min(430, window.innerWidth) - 40;
  const tabWidth = navWidth / NAV_ITEMS.length;
  const circleX = tabWidth * activeIndex + tabWidth / 2;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: navWidth,
        zIndex: 50,
        height: 64,
        borderRadius: 32,
        background: "var(--app-nav)",
        border: "1px solid var(--app-nav-border)",
        boxShadow: "var(--app-nav-shadow)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Sliding circle indicator */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: circleX,
          transform: "translate(-50%, -50%)",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#1a3260",
          transition: "left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          pointerEvents: "none",
        }}
      />

      {/* Nav buttons */}
      {NAV_ITEMS.map((item, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path, { state: { direction: i > activeIndex ? "right" : "left" } })}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
            }}
          >
            <item.icon
              size={18}
              color={isActive ? "#e1ecff" : "var(--app-fg-faint)"}
            />
          </button>
        );
      })}
    </div>
  );
}
