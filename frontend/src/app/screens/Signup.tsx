import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Anchor, Building2, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useAuth, UserType } from "../contexts/AuthContext";

// Accessible color tokens — all pass WCAG AA (4.5:1) on brand gradient (#dfebfe → #c5d9f9)
const FG = "#1a3260";
const SECONDARY = "#25467f";
const MUTED = "#3d5a8a";
const ERROR = "#b02020";
const INPUT_BG = "rgba(255,255,255,0.92)";
const INPUT_BORDER = "rgba(37,70,127,0.28)";

// MRN: exactly 7 digits
const MRN_REGEX = /^\d{7}$/;
// IMO Company Number: "IMO" + optional space + 7 digits, case-insensitive
const IMO_REGEX = /^IMO\s?\d{7}$/i;
const normaliseIMO = (v: string) => {
  const digits = v.replace(/[^0-9]/g, "");
  return digits.length === 7 ? `IMO ${digits}` : v.toUpperCase().trim();
};

type Step = 1 | 2;

interface FormState {
  name: string;
  username: string;
  email: string;
  password: string;
  mrn: string;
  imoNumber: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [form, setForm] = useState<FormState>({
    name: "",
    username: "",
    email: "",
    password: "",
    mrn: "",
    imoNumber: "",
  });

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleTypeSelect = (t: UserType) => {
    setUserType(t);
    setStep(2);
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.username.trim()) e.username = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (userType === "seafarer" && !MRN_REGEX.test(form.mrn))
      e.mrn = "Must be exactly 7 digits";
    if (userType === "operator" && !IMO_REGEX.test(form.imoNumber))
      e.imoNumber = "Format must be IMO followed by 7 digits (e.g. IMO 1234567)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !userType) return;
    signup({
      name: form.name,
      email: form.email,
      username: form.username,
      password: form.password,
      userType,
      ...(userType === "seafarer"
        ? { mrn: form.mrn }
        : { imoNumber: normaliseIMO(form.imoNumber) }),
    });
    if (userType === "seafarer") navigate("/onboarding");
    else navigate("/manager-home");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full flex flex-col overflow-y-auto"
      style={{ background: "linear-gradient(160deg, #dfebfe 0%, #c5d9f9 100%)" }}
    >
      <div className="px-6 pt-12 pb-10 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setUserType(null);
                setErrors({});
              }}
              aria-label="Back to account type selection"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f]"
              style={{ color: MUTED }}
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
          )}
          <div>
            <h1
              className="font-['Unbounded',sans-serif] text-[22px] font-medium tracking-tight"
              style={{ color: FG }}
            >
              BlueCore
            </h1>
            <p className="text-sm mt-0.5" style={{ color: MUTED }}>
              {step === 1
                ? "Create your account"
                : userType === "seafarer"
                ? "Seafarer account"
                : "Ship Operator account"}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="type-select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium mb-5" style={{ color: SECONDARY }}>
                Who are you on BlueCore?
              </p>

              <TypeCard
                icon={<Anchor size={18} aria-hidden style={{ color: SECONDARY }} />}
                title="Seafarer"
                description="A credentialed maritime professional working aboard a vessel. One account that follows you across every voyage, company, and vessel throughout your career."
                onClick={() => handleTypeSelect("seafarer")}
              />
              <TypeCard
                icon={<Building2 size={18} aria-hidden style={{ color: SECONDARY }} />}
                title="Ship Operator / Company"
                description="A shore-based company or management entity that owns or operates vessels. You create voyages, assign crew by MRN, and manage paperwork compliance."
                onClick={() => handleTypeSelect("operator")}
              />
            </motion.div>
          ) : (
            <motion.form
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <Field
                id="signup-name"
                label={userType === "seafarer" ? "Full Name" : "Company Name"}
                placeholder={userType === "seafarer" ? "Your full name" : "e.g. Nordic Shipping LLC"}
                autoComplete={userType === "seafarer" ? "name" : "organization"}
                value={form.name}
                onChange={set("name")}
                error={errors.name}
              />

              <Field
                id="signup-username"
                label="Username"
                placeholder="e.g. j_smith"
                autoComplete="username"
                value={form.username}
                onChange={set("username")}
                error={errors.username}
              />

              <Field
                id="signup-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
              />

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-medium px-0.5 mb-1.5"
                  style={{ color: SECONDARY }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPw ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={set("password")}
                    aria-describedby={errors.password ? "signup-password-error" : undefined}
                    aria-invalid={!!errors.password}
                    className="w-full px-4 py-3 rounded-xl text-sm pr-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-0"
                    style={{
                      background: INPUT_BG,
                      border: `1.5px solid ${errors.password ? ERROR : INPUT_BORDER}`,
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
                {errors.password && (
                  <p
                    id="signup-password-error"
                    role="alert"
                    className="text-xs font-medium mt-1 px-0.5"
                    style={{ color: ERROR }}
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {userType === "seafarer" && (
                <CredentialField
                  id="signup-mrn"
                  label="Mariner Reference Number (MRN)"
                  placeholder="e.g. 1234567"
                  inputMode="numeric"
                  maxLength={7}
                  value={form.mrn}
                  onChange={set("mrn")}
                  error={errors.mrn}
                  hint="Your 7-digit MRN is printed on your US Coast Guard Merchant Mariner Credential (MMC) card. It is your permanent professional identifier — managers use it to assign you to voyages."
                />
              )}

              {userType === "operator" && (
                <CredentialField
                  id="signup-imo"
                  label="IMO Company Number"
                  placeholder="e.g. IMO 1234567"
                  autoComplete="off"
                  value={form.imoNumber}
                  onChange={set("imoNumber")}
                  error={errors.imoNumber}
                  hint="Your IMO Company Number is issued by the International Maritime Organization and uniquely identifies your company. It appears on your vessel registration documents and is formatted as IMO followed by 7 digits."
                />
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-2"
                style={{ background: SECONDARY, color: "#ffffff" }}
              >
                Create Account <ChevronRight size={14} aria-hidden />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-sm text-center mt-8" style={{ color: MUTED }}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] rounded"
            style={{ color: SECONDARY }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

function TypeCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl p-5 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f]"
      style={{
        background: "rgba(255,255,255,0.72)",
        border: `1.5px solid ${INPUT_BORDER}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(37,70,127,0.1)" }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: FG }}>
            {title}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function Field({
  id,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string }) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium px-0.5 mb-1.5"
        style={{ color: SECONDARY }}
      >
        {label}
      </label>
      <input
        id={id}
        aria-describedby={error ? errorId : props["aria-describedby"]}
        aria-invalid={!!error}
        className="w-full px-4 py-3 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-0"
        style={{
          background: INPUT_BG,
          border: `1.5px solid ${error ? ERROR : INPUT_BORDER}`,
          color: FG,
        }}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium mt-1 px-0.5" style={{ color: ERROR }}>
          {error}
        </p>
      )}
    </div>
  );
}

function CredentialField({
  id,
  label,
  error,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint: string;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium px-0.5 mb-1.5"
        style={{ color: SECONDARY }}
      >
        {label}
      </label>
      <input
        id={id}
        aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
        aria-invalid={!!error}
        className="w-full px-4 py-3 rounded-xl text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25467f] focus-visible:ring-offset-0"
        style={{
          background: INPUT_BG,
          border: `1.5px solid ${error ? ERROR : INPUT_BORDER}`,
          color: FG,
          letterSpacing: "0.06em",
        }}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium mt-1.5 px-0.5" style={{ color: ERROR }}>
          {error}
        </p>
      )}
      <p id={hintId} className="text-xs mt-2 px-0.5 leading-relaxed" style={{ color: MUTED }}>
        {hint}
      </p>
    </div>
  );
}
