import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserType = "seafarer" | "operator";

export interface AuthUser {
  name: string;
  email: string;
  username: string;
  mrn?: string;        // seafarers: 7-digit US Coast Guard MMC number
  imoNumber?: string;  // operators: IMO Company Number (e.g. "IMO 1234567")
  userType: UserType;
  interests: string[];
  onboardingComplete: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => AuthUser | null;
  signup: (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    userType: UserType;
    mrn?: string;
    imoNumber?: string;
  }) => AuthUser;
  completeOnboarding: (interests: string[]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "bluecore_session";
const ACCOUNTS_KEY = "bluecore_accounts";

const DEMO_USER: AuthUser = {
  name: "John Doe",
  email: "john@bluecore.app",
  username: "johndoe",
  mrn: "1234567",
  userType: "seafarer",
  interests: ["Basketball", "Hip-hop", "Cooking", "Gaming", "MMA"],
  onboardingComplete: true,
};

function seedDemoAccount() {
  const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "{}");
  if (!accounts[DEMO_USER.email]) {
    accounts[DEMO_USER.email] = DEMO_USER;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  seedDemoAccount();

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const saveToAccounts = (u: AuthUser) => {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "{}");
    accounts[u.email.toLowerCase()] = u;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  const login = (email: string, password: string): AuthUser | null => {
    if (!email || !password) return null;
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "{}");
    const stored: AuthUser | undefined = accounts[email.toLowerCase()];
    if (!stored) return null;
    setUser(stored);
    return stored;
  };

  const signup = (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    userType: UserType;
    mrn?: string;
    imoNumber?: string;
  }): AuthUser => {
    const { password: _, ...rest } = data;
    // Operators skip the seafarer onboarding (interests/news personalisation)
    const newUser: AuthUser = {
      ...rest,
      interests: [],
      onboardingComplete: data.userType === "operator",
    };
    setUser(newUser);
    saveToAccounts(newUser);
    return newUser;
  };

  const completeOnboarding = (interests: string[]) => {
    if (!user) return;
    const updated: AuthUser = { ...user, interests, onboardingComplete: true };
    setUser(updated);
    saveToAccounts(updated);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, signup, completeOnboarding, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
