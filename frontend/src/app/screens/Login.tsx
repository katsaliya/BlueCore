import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const FG = "#1a3260";
const SECONDARY = "#25467f";
const MUTED = "#3d5a8a";
const ERROR = "#b02020";
const INPUT_BG = "rgba(255,255,255,0.92)";
const INPUT_BORDER = "rgba(37,70,127,0.28)";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleDemo = () => {
    const result = login("john@bluecore.app", "demo");
    if (result) navigate("/home-v2");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    const result = login(email, password);
    if (!result) {
      setError("No account found with this email. Please sign up.");
      return;
    }
    if (result.userType === "operator") navigate("/manager-home");
    else if (!result.onboardingComplete) navigate("/onboarding");
    else navigate("/home-v2");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full flex flex-col overflow-y-auto"
      style={{ background: "linear-gradient(160deg, #dfebfe 0%, #c5d9f9 100%)" }}
    >
      <div className="px-6 pt-14 pb-10 flex flex-col flex-1">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-10"
        >
          <h1
            className="font-['Unbounded',sans-serif] text-[26px] font-medium tracking-tight"
            style={{ color: FG }}
          >
            BlueCore
          </h1>
          <p className="text-sm mt-1.5" style={{ color: MUTED }}>
            Welcome back
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium px-0.5 mb-1.5"
              style={{ color: SECONDARY }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-0"
              style={{
                background: INPUT_BG,
                border: `1.5px solid ${INPUT_BORDER}`,
                color: FG,
              }}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-medium px-0.5 mb-1.5"
              style={{ color: SECONDARY }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={error ? "login-error" : undefined}
                aria-invalid={!!error}
                className="w-full px-4 py-3 rounded-xl text-sm pr-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-0"
                style={{
                  background: INPUT_BG,
                  border: `1.5px solid ${error ? ERROR : INPUT_BORDER}`,
                  color: FG,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f]"
                style={{ color: MUTED }}
              >
                {showPw ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
              </button>
            </div>
          </div>

          {error && (
            <p id="login-error" role="alert" className="text-xs font-medium px-0.5" style={{ color: ERROR }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl text-sm font-semibold mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-2"
            style={{ background: SECONDARY, color: "#ffffff" }}
          >
            Sign In
          </button>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-px" style={{ background: INPUT_BORDER }} />
            <span className="text-xs" style={{ color: MUTED }}>or</span>
            <div className="flex-1 h-px" style={{ background: INPUT_BORDER }} />
          </div>

          <button
            type="button"
            onClick={handleDemo}
            className="w-full py-3.5 rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-2"
            style={{ background: "rgba(37,70,127,0.10)", color: SECONDARY, border: `1.5px solid ${INPUT_BORDER}` }}
          >
            Continue as Demo (John Doe)
          </button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-center mt-8"
          style={{ color: MUTED }}
        >
          New to BlueCore?{" "}
          <Link
            to="/signup"
            className="font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] rounded"
            style={{ color: SECONDARY }}
          >
            Create account
          </Link>
        </motion.p>
      </div>
    </motion.div>
  );
}
