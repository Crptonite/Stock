import React, { useState } from "react";
import { Shield, Eye, EyeOff, Lock, Mail, User, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "signup" | "forgot";

export function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        navigate("/dashboard");
      }
    } else if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
      } else {
        setSuccess("Account created! Check your email to confirm your address, then sign in.");
        setMode("login");
      }
    }

    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await import("../../lib/supabase").then(({ supabase }) =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
    );
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset email sent. Check your inbox.");
    }
  };

  const resetState = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setPassword("");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans p-4 sm:p-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#8BB8C9]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#AFA089]/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(139,184,201,0.15)]">
            <Shield className="w-7 h-7 text-background" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "login" ? "Sign in to SIFT" : mode === "signup" ? "Create your account" : "Reset password"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5 font-medium text-center">
            {mode === "login"
              ? "Access your personalised dashboard"
              : mode === "signup"
              ? "Start your premium wealth journey"
              : "We'll send a reset link to your email"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">

          {/* Google OAuth */}
          {mode !== "forgot" && (
            <>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-border bg-background hover:bg-secondary transition-all text-sm font-medium text-foreground shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-mono">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive font-medium leading-relaxed">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-[#8BB8C9]/10 border border-[#8BB8C9]/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#8BB8C9] shrink-0 mt-0.5" />
              <p className="text-xs text-[#8BB8C9] font-medium leading-relaxed">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === "forgot" ? handleForgot : handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#8BB8C9] focus:ring-1 focus:ring-[#8BB8C9] transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#8BB8C9] focus:ring-1 focus:ring-[#8BB8C9] transition-all outline-none font-mono"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => resetState("forgot")}
                      className="text-xs text-[#8BB8C9] hover:text-[#AFA089] font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    minLength={mode === "signup" ? 8 : undefined}
                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#8BB8C9] focus:ring-1 focus:ring-[#8BB8C9] transition-all outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="text-[11px] text-muted-foreground font-mono pl-1">Minimum 8 characters</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-xl text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--trust-blue)", color: "#0B1015", boxShadow: "0 0 15px rgba(139,184,201,0.25)" }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "login" ? (
                "Sign In"
              ) : mode === "signup" ? (
                "Create Account"
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="pt-4 border-t border-border text-center">
            {mode === "forgot" ? (
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <button onClick={() => resetState("login")} className="text-foreground font-semibold hover:text-[#8BB8C9] transition-colors">
                  Sign in
                </button>
              </p>
            ) : mode === "login" ? (
              <p className="text-sm text-muted-foreground">
                No account yet?{" "}
                <button onClick={() => resetState("signup")} className="text-foreground font-semibold hover:text-[#8BB8C9] transition-colors">
                  Create one
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => resetState("login")} className="text-foreground font-semibold hover:text-[#8BB8C9] transition-colors">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-7 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8BB8C9]/70" />
            <span className="text-[11px] font-semibold uppercase tracking-widest">Bank-Level Security</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center max-w-[260px]">
            Your credentials are protected with 256-bit SSL. We never share your personal data.
          </p>
        </div>
      </div>
    </div>
  );
}
