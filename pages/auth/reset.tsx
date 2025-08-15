// pages/auth/reset.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

type Stage = "loading" | "need-email" | "ready" | "done" | "error";

// Types accepted by Supabase for verifyOtp "type"
type EmailOtpType = "recovery" | "magiclink" | "signup" | "invite" | "email_change";

function toEmailOtpType(value: string | null | undefined): EmailOtpType {
  const v = (value || "").trim().toLowerCase();
  const allowed: EmailOtpType[] = ["recovery", "magiclink", "signup", "invite", "email_change"];
  return (allowed as readonly string[]).includes(v) ? (v as EmailOtpType) : "recovery";
}

function parseHashAndQuery(urlStr: string) {
  const out: Record<string, string> = {};
  const url = new URL(urlStr);

  // Query params
  url.searchParams.forEach((v, k) => (out[k] = v));

  // Hash params (#a=b&c=d)
  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  const hp = new URLSearchParams(hash);
  hp.forEach((v, k) => (out[k] = v));

  return out;
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

  const params = useMemo(() => {
    if (typeof window === "undefined") return {};
    return parseHashAndQuery(window.location.href);
  }, []);

  const code = (params["code"] || "").trim(); // PKCE/magic
  const token_hash = (params["token_hash"] || "").trim(); // legacy/hash
  const access_token = (params["access_token"] || "").trim(); // token flow
  const refresh_token = (params["refresh_token"] || "").trim();
  const linkType: EmailOtpType = toEmailOtpType(params["type"] || "recovery");

  useEffect(() => {
    const run = async () => {
      // 1) Try PKCE (works if same browser initiated reset)
      const { error: exchErr } = await supabase.auth.exchangeCodeForSession(
        typeof window !== "undefined" ? window.location.href : ""
      );

      if (!exchErr) {
        setStage("ready");
        return;
      }

      // 2) Token flow: setSession with access/refresh tokens in URL
      if (access_token && refresh_token) {
        const { error: sessErr } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (!sessErr) {
          setStage("ready");
          return;
        }
      }

      // 3) Fallback: ask for email and verify via OTP (no PKCE required)
      if (code || token_hash) {
        setStage("need-email");
        return;
      }

      // 4) Nothing usable found
      setError(
        "Invalid request: missing credentials. Please request a new reset link from the sign-in page."
      );
      setStage("error");
    };

    void run();
  }, [access_token, refresh_token, code, token_hash, linkType]);

  // Step A: If no PKCE session, verify via OTP using email + (code || token_hash)
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!email) {
      setError("Please enter the email for the account you’re resetting.");
      return;
    }

    const token = code || token_hash;
    if (!token) {
      setError("Missing reset token. Please request a new link.");
      return;
    }

    const { error: vErr } = await supabase.auth.verifyOtp({
      email,
      token,
      type: linkType,
    });

    if (vErr) {
      setError(vErr.message || "Could not verify reset link. Try requesting a new one.");
      return;
    }

    // Verified → session established → proceed to set new password
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

  // ---------- RENDER ----------

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
            Enter the email for the account you’re resetting. Then you’ll set a new password.
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
          minLength={6}
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
