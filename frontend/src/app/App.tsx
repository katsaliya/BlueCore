import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="h-screen w-screen bg-black flex items-center justify-center">
          <div
            className="relative overflow-hidden"
            style={{
              width: "min(430px, 100vw)",
              height: "min(calc(min(430px, 100vw) * 844 / 390), 100vh)",
            }}
          >
            <RouterProvider router={router} />
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
