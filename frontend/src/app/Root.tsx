import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Compass, Archive, User } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/social", icon: Compass, label: "Connect" },
  { path: "/documents", icon: Archive, label: "Past Docs" },
  { path: "/profile", icon: User, label: "You" },
];

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col h-screen overflow-hidden max-w-[430px] mx-auto relative bg-app-canvas text-app-fg">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </div>

      {!isHome && (
        <nav className="flex-shrink-0 px-4 pb-6 pt-3 bg-app-nav border-t border-app-nav-border">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
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
      )}
    </div>
  );
}
