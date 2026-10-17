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
    <div className="min-h-screen bg-[#F3FAFC] text-[#17191D] flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient accents */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-[#EDE5F7] opacity-60 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 size-80 rounded-full bg-[#E6F3FC] opacity-70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/4 size-96 rounded-full bg-[#F3E1F0] opacity-50 blur-3xl"
        aria-hidden="true"
      />

      {/* Top bar header with branding */}
      <header className="relative z-10 w-full border-b border-[#E8EDF0] bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#E8EDF0] bg-[#F3FAFC] px-3 py-1 text-xs font-semibold text-[#0866A8]">
            <Sparkles className="size-3 text-[#F2C316]" />
            Academic Year 2026-27
          </span>
        </div>
      </header>

      {/* Main card container */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="rounded-2xl border border-[#E8EDF0] bg-white p-6 sm:p-8 shadow-card">
            {/* Header info */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#E6F3FC] text-[#087CC9] shadow-xs">
                <KeyRound className="size-6" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#17191D]">
                Portal Sign In
              </h1>
              <p className="mt-1 text-xs text-[#696B70] leading-relaxed">
                Enter your institutional credentials to access your Haven residence account.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#B43B3B]/20 bg-[#FDF2F2] p-3 text-xs text-[#B43B3B] animate-fade-in"
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
                  className="block text-[11px] font-bold tracking-[0.08em] text-[#17191D] uppercase mb-1.5"
                >
                  Student ID / Username
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#696B70]">
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
                    className="h-11 w-full rounded-xl border border-[#E8EDF0] bg-white pl-10 pr-3.5 text-sm text-[#17191D] placeholder:text-[#696B70]/50 transition-all outline-none hover:border-[#087CC9]/40 focus:border-[#087CC9] focus:ring-3 focus:ring-[#087CC9]/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] font-bold tracking-[0.08em] text-[#17191D] uppercase"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#696B70]">
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
                    className="h-11 w-full rounded-xl border border-[#E8EDF0] bg-white pl-10 pr-10 text-sm text-[#17191D] placeholder:text-[#696B70]/50 transition-all outline-none hover:border-[#087CC9]/40 focus:border-[#087CC9] focus:ring-3 focus:ring-[#087CC9]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#696B70] hover:text-[#17191D] transition-colors"
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
                    className="size-4 rounded border-[#E8EDF0] text-[#087CC9] accent-[#087CC9] focus:ring-2 focus:ring-[#087CC9]/20"
                  />
                  <span className="text-xs font-medium text-[#696B70]">Remember my session</span>
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
            <div className="mt-6 pt-5 border-t border-[#E8EDF0]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-[0.14em] text-[#696B70] uppercase">
                  Demo Test Credentials
                </span>
                <span className="text-[10px] text-[#087CC9] font-semibold">Click to autofill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Student Demo Account */}
                <button
                  type="button"
                  onClick={() => handleQuickFill(DEMO_ACCOUNTS.student)}
                  className="group flex flex-col items-start p-2.5 rounded-xl border border-[#E8EDF0] bg-[#F3FAFC] hover:bg-[#E6F3FC] hover:border-[#087CC9]/30 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="size-2 rounded-full bg-[#087CC9]" />
                    <span className="text-xs font-semibold text-[#17191D] group-hover:text-[#0866A8]">
                      Student Account
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#0866A8] mt-1 font-semibold">
                    {DEMO_ACCOUNTS.student.username}
                  </span>
                  <span className="text-[10px] text-[#696B70]">
                    Pass: {DEMO_ACCOUNTS.student.password}
                  </span>
                </button>

                {/* Admin Demo Account */}
                <button
                  type="button"
                  onClick={() => handleQuickFill(DEMO_ACCOUNTS.admin)}
                  className="group flex flex-col items-start p-2.5 rounded-xl border border-[#E8EDF0] bg-[#F3FAFC] hover:bg-[#E6F3FC] hover:border-[#087CC9]/30 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <ShieldCheck className="size-3 text-[#087CC9]" />
                    <span className="text-xs font-semibold text-[#17191D] group-hover:text-[#0866A8]">
                      Admin Account
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#0866A8] mt-1 font-semibold">
                    {DEMO_ACCOUNTS.admin.username}
                  </span>
                  <span className="text-[10px] text-[#696B70]">
                    Pass: {DEMO_ACCOUNTS.admin.password}
                  </span>
                </button>
              </div>
            </div>

            {/* Official Registration Notice (No self sign-up) */}
            <div className="mt-5 rounded-xl border border-[#E8EDF0] bg-[#F3FAFC]/60 p-3 text-center">
              <p className="text-[11px] text-[#696B70] leading-relaxed">
                <strong className="font-semibold text-[#17191D]">Notice:</strong> Haven HMS accounts are created exclusively by the Hostel Administration. Self-registration is disabled. If you need credentials or a password reset, contact the warden office.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E8EDF0] bg-white/60 py-3.5 text-center text-xs text-[#696B70]">
        Haven Hostel Management System · Enterprise Residence Management
      </footer>
    </div>
  );
}
