// pages/index.tsx
import { useState } from "react";
import supabase from "../utils/supabaseClient";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    window.location.href = "/companies";
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);

    const redirectTo = siteUrl ? siteUrl + "/auth/callback" : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      ...(redirectTo ? { options: { emailRedirectTo: redirectTo } } : {}),
    });
    setBusy(false);
    if (error) return setErr(error.message);

    setMsg(
      "Account created. If email confirmations are enabled, check your inbox; otherwise, you can sign in now."
    );
    setMode("signin");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white border rounded p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2 text-center">Asset Manager</h1>
        <p className="text-center text-gray-600 mb-6">
          {mode === "signin" ? "Sign in to your account" : "Create a new account"}
        </p>

        <form onSubmit={mode === "signin" ? onSignIn : onSignUp} className="space-y-3">
          <input
            className="w-full border rounded p-2"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full border rounded p-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {err && <div className="text-sm text-red-600">{err}</div>}
          {msg && <div className="text-sm text-green-700">{msg}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          {mode !== "signin" ? (
            <button className="text-blue-700 hover:underline" onClick={() => setMode("signin")}>
              Back to Sign In
            </button>
          ) : (
            <button className="text-blue-700 hover:underline" onClick={() => setMode("signup")}>
              Create account
            </button>
          )}
          <span className="text-gray-400 cursor-not-allowed">Forgot password (coming soon)</span>
        </div>
      </div>
    </main>
  );
}
