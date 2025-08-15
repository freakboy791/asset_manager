// pages/auth/reset.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

type Stage = "loading" | "ready" | "need-email" | "done" | "error";

export default function ResetPassword() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [error, setError] = useState<string>("");
  const [msg, setMsg] = useState<string>("");

  // form state
  const [email, setEmail] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  const code = useMemo(() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    // Supabase sends `code` for recovery links
    return u.searchParams.get("code") || "";
  }, []);

  useEffect(() => {
    const run = async () => {
      // 1) Best case: PKCE flow — works if the same browser initiated the reset
      const { error: exchError } = await supabase.auth.exchangeCodeForSession(
        typeof window !== "undefined" ? window.location.href : ""
      );

      if (!exchError) {
        // We already have a session; user can directly set a new password
        setStage("ready");
        return;
      }

      // 2) Fallback: require email + code to verify via OTP (no PKCE required)
      if (!code) {
        setError(
          "Invalid request: missing code. Please request a new reset link from the sign-in page."
        );
        setStage("error");
        return;
      }

      setStage("need-email");
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Step A: If we needed email (fallback), verify the OTP first
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

    const { error: vErr } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });

    if (vErr) {
      setError(vErr.message || "Could not verify reset link. Try requesting a new one.");
      return;
    }

    // Verification succeeded; user now has a session and can set a new password
    setStage("ready");
  };

  // Step B: When verified / session is present, allow setting new password
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

  // ------- RENDER --------

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

  // stage === "ready": set a new password
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
