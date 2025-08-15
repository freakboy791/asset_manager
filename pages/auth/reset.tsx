// pages/auth/reset.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

export default function ResetPassword() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "done" | "error">("loading");
  const [error, setError] = useState<string>("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      // Exchange the recovery code in the URL for a session
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        setError(error.message || "Invalid or expired link.");
        setStatus("error");
        return;
      }
      setStatus("ready");
    };
    void run();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

    const { error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) {
      setError(error.message);
      return;
    }

    setMsg("Password updated. Redirecting to sign in…");
    setStatus("done");
    setTimeout(() => router.replace("/"), 1200);
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white border rounded p-6 w-full max-w-md text-center">
          <h1 className="text-lg font-semibold mb-2">Reset link problem</h1>
          <p className="text-red-600">{error}</p>
          <p className="mt-3 text-sm text-gray-600">
            You may request a new reset link from the sign-in page.
          </p>
        </div>
      </main>
    );
  }

  if (status === "done") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-green-600">{msg}</p>
      </main>
    );
  }

  // status === "ready"
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
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
