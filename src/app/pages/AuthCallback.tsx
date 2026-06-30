import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

/**
 * Landing page after Supabase OAuth redirect.
 * Supabase appends #access_token=... to this URL.
 * The supabase-js client automatically parses the hash and
 * fires onAuthStateChange — we just wait for the session
 * then push to /dashboard.
 */
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // supabase-js v2 auto-exchanges the hash fragment
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Small delay so auth state fully settles before navigating
        setTimeout(() => navigate("/dashboard", { replace: true }), 100);
      }
    });

    // Fallback: if session already exists (e.g. page reload), redirect now
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-5">
      <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(139,184,201,0.15)]">
        <Shield className="w-7 h-7 text-background" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        <p className="text-sm font-mono text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
