// pages/index.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "../utils/supabaseClient";

type Mode = "signin" | "signup" | "reset";
type MsgType = "success" | "error" | "";

export default function Home() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MsgType>("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setBusy(true);

    try {
      if (mode === "signup") {
        const { data: existsData, error: existsErr } = await supabase.rpc("user_exists", {
          p_email: email,
        });

        if (existsErr || existsData === true) {
          setMessageType("error");
          setMessage(
            existsData === true
              ? "An account already exists for this email. Please sign in or reset your password."
              : "We couldn’t verify this email right now. Please try signing in or resetting your password."
          );
          return;
        }

        const redirect =
          process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
            : undefined;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          ...(redirect ? { options: { emailRedirectTo: redirect } } : {}),
        });

        if (error) {
          setMessageType("error");
          setMessage(error.message);
          return;
        }

        if (data.user) {
          void fetch("/api/notify-new-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: data.user.id, email: data.user.email }),
          });
        }

        setMessageType("success");
        setMessage(
          "Thanks! We’ve sent a confirmation email. After you confirm, an admin will review and approve your access."
        );
        setMode("signin");
        return;
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessageType("error");
          setMessage(error.message);
          return;
        }
        router.push("/company");
        return;
      }

      if (mode === "reset") {
        const redirect =
          process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset`
            : undefined; // Changed from /auth/callback to /auth/reset

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirect,
        });
        if (error) {
          setMessageType("error");
          setMessage(error.message);
          return;
        }
        setMessageType("success");
        setMessage("Password reset email sent. Please check your inbox.");
        return;
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow rounded w-full max-w-sm">
        <h1 className="text-2xl mb-4 capitalize">{mode}</h1>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== "reset" && (
            <input
              type="password"
              placeholder="Password"
              className="border p-2 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <button
            type="submit"
            disabled={busy}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded w-full"
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
              ? "Sign In"
              : mode === "signup"
              ? "Sign Up"
              : "Reset Password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${
              messageType === "error"
                ? "text-red-600"
                : messageType === "success"
                ? "text-green-600"
                : ""
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-4 flex justify-between text-sm">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
              mode === "signin" ? "underline" : ""
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
              mode === "signup" ? "underline" : ""
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setMode("reset")}
            className={`text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
              mode === "reset" ? "underline" : ""
            }`}
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}
