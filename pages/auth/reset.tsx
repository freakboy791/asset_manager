// pages/auth/reset.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

type Stage = "loading" | "ready" | "need-email" | "done" | "error";

function getParamAnywhere(name: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  // 1) query string ?code=...
  const fromQuery = url.searchParams.get(name);
  if (fromQuery) return fromQuery;

  // 2) hash fragment #code=...&type=...
  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  const hashParams = new URLSearchParams(hash);
  return hashParams.get(name) || "";
}

export default function ResetPassword() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // form state
  const [email, setEmail] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  const code = useMemo(() => getParamAnywhere("code"), []);
  const linkType = useMemo(() => getParamAnywhere("type") || "recovery", []);

  useEffect(() => {
    const run = async () => {
      // Try PKCE first (works if the same browser requested the reset)
      const { error: exchError } = await supabase.auth.exchangeCodeForSession(
        typeof window !== "undefined" ? window.location.href : ""
      );

      if (!exchError) {
        setStage("ready"); // already have a session, can set password
        return;
      }

      // No PKCE verifier available (e.g., clicked in another browser/app)
      // If we DO have a code, we can verify via OTP using email + code (no PKCE).
      if (code) {
        setStage("need-email"); // ask for email, then verify via OTP
        return;
      }

      // No code found anywhere → hard failure
      setError(
        "Invalid request: missing code. Please request a new reset link from the sign-in page."
      );
      setStage("error");
    };

    void run();
  }, [code]);

  // Step A: If no PKCE, verify via OTP (requires email + code)
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!email) {
      setError("Please enter your account email.");
      return;
    }
    if (!code) {
      setError("Missing reset code. Request a new link from the sign-in page.");
      return;
    }

    // type is usually "recovery"
    const { error: vErr } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: linkType as "recovery" | "magiclink" | "signup" | "invite" | "email_change",
    });

    if (vErr) {
      setError(vErr.message || "Could not verify reset link. Try requesting a new one.");
      return;
    }

    // Verified → we now have a session, can set the new password
    setStage("ready");
  };

  // Step B: With a session, update the password
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (pw1.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Passwords do not match.");
      return;
    }

    const { error: updErr } = await supabase.auth.updateUser({ password: pw1 });
    if (updErr) {
      setError(updErr.message);
      return;
    }

    setMsg("Password updated. Redirecting to sign in…");
    setStage("done");
    setTimeout(() => router.replace("/"), 1200);
  };

  // -------- RENDER --------

  if (stage === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </main>
    );
  }

  if (stage === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white border rounded p-6 w-full max-w-md text-center">
          <h1 className="text-lg font-semibold mb-2">Reset link problem</h1>
          <p className="text-red-600">{error}</p>
          <p className="mt-3 text-sm text-gray-600">
            Please request a new reset link from the sign-in page.
          </p>
        </div>
      </main>
    );
  }

  if (stage === "need-email") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleVerifyEmail}
          className="bg-white border rounded p-6 w-full max-w-sm space-y-4"
        >
          <h1 className="text-xl font-semibold">Confirm your email</h1>
          <p className="text-sm text-gray-600">
            Enter the email of the account you’re resetting. Then you’ll set a new password.
          </p>

          <input
            type="email"
            className="border p-2 w-full"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {msg && <p className="text-sm text-green-600">{msg}</p>}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
          >
            Continue
          </button>
        </form>
      </main>
    );
  }

  if (stage === "done") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-green-600">{msg}</p>
      </main>
    );
  }

  // stage === "ready"
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSetPassword}
        className="bg-white border rounded p-6 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold">Set a new password</h1>

        <input
          type="password"
          className="border p-2 w-full"
          placeholder="New password"
          value={pw1}
          onChange={(e) => setPw1(e.target.value)}
          minLength={8}
          required
        />
        <input
          type="password"
          className="border p-2 w-full"
          placeholder="Confirm new password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          minLength={8}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-green-600">{msg}</p>}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Update Password
        </button>
      </form>
    </main>
  );
}
