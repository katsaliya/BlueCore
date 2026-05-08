import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
