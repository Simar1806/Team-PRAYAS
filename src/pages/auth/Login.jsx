import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, Lock, ShieldCheck, User, Sparkles } from "lucide-react";
import { useAuth } from "../../state/demo.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Logo } from "../../components/layout/Logo.jsx";
import { DEMO_ACCOUNTS } from "../../data/seed.js";

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to destination or home
  const from = location.state?.from?.pathname || "/";
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your Student ID or Username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    // Tasteful short delay for realistic feedback
    setTimeout(() => {
      const result = login(username.trim(), password, rememberMe);
      setIsSubmitting(false);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || "Invalid credentials. Please verify and try again.");
      }
    }, 350);
  };

  const handleQuickFill = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#24221F] flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient accents */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-[#E2A93B]/25 opacity-60 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 size-80 rounded-full bg-[#D6DEF2] opacity-70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/4 size-96 rounded-full bg-[#F8E7DE] opacity-50 blur-3xl"
        aria-hidden="true"
      />

      {/* Top bar header with branding */}
      <header className="relative z-10 w-full border-b border-[#E8E2D7] bg-[#FAF8F3]/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#E8E2D7] bg-[#F7F4EE] px-3 py-1 text-xs font-semibold text-[#2F4785]">
            <Sparkles className="size-3 text-[#E2A93B]" />
            Academic Year 2026-27
          </span>
        </div>
      </header>

      {/* Main card container */}
      <main className="relative z-10 flex flex-1 items-center justify-center gap-12 p-4 sm:p-6 lg:p-10 xl:gap-20">
        <aside className="hidden lg:flex max-w-md flex-col" aria-hidden="true">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#E2A93B]/15 px-3 py-1 text-xs font-semibold text-[#87600F]">
            <span className="size-1.5 rounded-full bg-[#E2A93B]" />
            Your residence, in one place
          </span>
          <h2 className="mt-5 font-display text-[2.75rem] leading-[1.08] font-semibold tracking-tight text-[#24221F]">
            Welcome home to <span className="italic text-[#3E5BA9]">Haven</span>.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#6F6A62]">
            Rooms, mess menus, maintenance requests and hostel notices, kept simple for residents and wardens alike.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ["Rooms", "& beds"],
              ["Mess", "weekly menu"],
              ["Help", "when you need it"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-2xl border border-[#E8E2D7] bg-white/70 p-4">
                <p className="font-display text-lg font-semibold text-[#24221F]">{a}</p>
                <p className="mt-0.5 text-xs text-[#6F6A62]">{b}</p>
              </div>
            ))}
          </div>
        </aside>
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="rounded-3xl border border-[#E8E2D7] bg-white p-6 sm:p-9 shadow-pop">
            {/* Header info */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#ECEFF8] text-[#3E5BA9] shadow-xs">
                <KeyRound className="size-6" />
              </div>
              <h1 className="font-display text-[1.7rem] font-semibold tracking-tight text-[#24221F]">
                Sign in to Haven
              </h1>
              <p className="mt-1 text-xs text-[#6F6A62] leading-relaxed">
                Enter your institutional credentials to access your Haven residence account.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#B5483B]/20 bg-[#FDF3F0] p-3 text-xs text-[#B5483B] animate-fade-in"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username / Student ID */}
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-[13px] font-medium text-[#24221F] mb-1.5"
                >
                  Student ID / Username
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6F6A62]">
                    <User className="size-4" />
                  </span>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. STU2026001 or admin"
                    className="h-11 w-full rounded-xl border border-[#E8E2D7] bg-white pl-10 pr-3.5 text-sm text-[#24221F] placeholder:text-[#6F6A62]/50 transition-colors outline-none hover:border-[#3E5BA9]/40 focus:border-[#3E5BA9] focus:ring-3 focus:ring-[#3E5BA9]/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-[13px] font-medium text-[#24221F]"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6F6A62]">
                    <Lock className="size-4" />
                  </span>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-xl border border-[#E8E2D7] bg-white pl-10 pr-10 text-sm text-[#24221F] placeholder:text-[#6F6A62]/50 transition-colors outline-none hover:border-[#3E5BA9]/40 focus:border-[#3E5BA9] focus:ring-3 focus:ring-[#3E5BA9]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#6F6A62] hover:text-[#24221F] transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border-[#E8E2D7] text-[#3E5BA9] accent-[#3E5BA9] focus:ring-2 focus:ring-[#3E5BA9]/20"
                  />
                  <span className="text-xs font-medium text-[#6F6A62]">Remember my session</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full h-11 text-sm justify-center font-semibold mt-2 shadow-sm"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Sign In
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Demo Credentials Autofill Helper */}
            <div className="mt-6 pt-5 border-t border-[#E8E2D7]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[#6F6A62]">
                  Demo Test Credentials
                </span>
                <span className="text-[10px] text-[#3E5BA9] font-semibold">Click to autofill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { key: "student", label: "Student", note: "Any STU2026### ID", account: DEMO_ACCOUNTS.student },
                  { key: "admin", label: "Chief Admin", note: "Full access", account: DEMO_ACCOUNTS.admin },
                  { key: "subAdmin", label: "Admin", note: "No Accounts access", account: DEMO_ACCOUNTS.subAdmin },
                ].map(({ key, label, note, account }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleQuickFill(account)}
                    className="group flex flex-col items-start p-2.5 rounded-xl border border-[#E8E2D7] bg-[#F7F4EE] hover:bg-[#ECEFF8] hover:border-[#3E5BA9]/30 text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#24221F] group-hover:text-[#2F4785]">
                      {key === "student" ? (
                        <span className="size-2 rounded-full bg-[#3E5BA9]" />
                      ) : (
                        <ShieldCheck className="size-3 text-[#3E5BA9]" />
                      )}
                      {label}
                    </span>
                    <span className="mt-1 text-[11px] font-mono font-semibold text-[#2F4785]">{account.username}</span>
                    <span className="text-[11px] text-[#6F6A62]">Pass: {account.password}</span>
                    <span className="mt-0.5 text-[11px] text-[#A39D92]">{note}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Official Registration Notice (No self sign-up) */}
            <div className="mt-5 rounded-xl border border-[#E8E2D7] bg-[#F7F4EE]/60 p-3 text-center">
              <p className="text-[11px] text-[#6F6A62] leading-relaxed">
                <strong className="font-semibold text-[#24221F]">Notice:</strong> Haven HMS accounts are created exclusively by the Hostel Administration. Self-registration is disabled. If you need credentials or a password reset, contact the warden office.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E8E2D7] bg-[#FAF8F3]/70 py-3.5 text-center text-xs text-[#6F6A62]">
        Haven Hostel Management System · Enterprise Residence Management
      </footer>
    </div>
  );
}
