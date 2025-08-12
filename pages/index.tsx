import { useState } from "react";
import supabase from "../utils/supabaseClient";

type Mode = "signin" | "signup" | "reset";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setMsg(null); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);

    // fetch profile to see approval
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setErr("No user");
    const { data: prof } = await supabase.from("profiles").select("approved").eq("id", user.id).single();

    if (!prof?.approved) {
      setMsg("Account created or signed in, but not yet approved. Please wait for approval email.");
    } else {
      window.location.href = "/companies"; // go inside the app
    }
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setMsg(null); setBusy(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);

    // call server to create profile + email admin
    await fetch("/api/notify-new-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: data.user?.id, email }),
    });

    setMsg("Signed up. Awaiting admin approval. You’ll receive an email once approved.");
    setMode("signin");
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setMsg(null); setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || "") + "/reset",
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setMsg("Reset email sent. Check your inbox.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white border rounded p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2 text-center">Asset Tracker</h1>
        <p className="text-center text-gray-600 mb-6">
          {mode === "signin" && "Sign in to your account"}
          {mode === "signup" && "Create a new account"}
          {mode === "reset" && "Reset your password"}
        </p>

        <form onSubmit={mode === "signin" ? onSignIn : mode === "signup" ? onSignUp : onReset} className="space-y-3">
          <input
            className="w-full border rounded p-2"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== "reset" && (
            <input
              className="w-full border rounded p-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={mode !== "reset"}
            />
          )}

          {err && <div className="text-sm text-red-600">{err}</div>}
          {msg && <div className="text-sm text-green-700">{msg}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Please wait…" :
              mode === "signin" ? "Sign In" :
              mode === "signup" ? "Create Account" : "Send Reset Email"}
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

          {mode !== "reset" && (
            <button className="text-blue-700 hover:underline" onClick={() => setMode("reset")}>
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
