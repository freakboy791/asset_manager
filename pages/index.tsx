// pages/index.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "../utils/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (mode === "signup") {
      const redirect =
        process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        ...(redirect ? { options: { emailRedirectTo: redirect } } : {}),
      });

      // Handle "user already exists" cleanly
      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (
          msg.includes("already") ||
          msg.includes("exists") ||
          msg.includes("registered")
        ) {
          setMessage(
            "An account already exists for this email. Please sign in or reset your password."
          );
          return;
        }
        setMessage(error.message);
        return;
      }

      // Only notify admin for brand-new users
      if (data.user) {
        try {
          await fetch("/api/notify-new-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: data.user.id, email: data.user.email }),
          });
        } catch {
          // Non-blocking: ignore admin email failures on client
        }
      }

      setMessage(
        "Thanks! We’ve sent a confirmation email. Please verify your address, then an admin will approve your access."
      );
      setMode("signin");
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.push("/companies");
      return;
    }

    if (mode === "reset") {
      const redirect =
        process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirect,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Password reset email sent. Please check your inbox.");
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
            required
          />
          {mode !== "reset" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 w-full"
            />
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            {mode === "signin"
              ? "Sign In"
              : mode === "signup"
              ? "Sign Up"
              : "Reset Password"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm">{message}</p>}

        <div className="mt-4 flex justify-between text-sm">
          <button onClick={() => setMode("signin")}>Sign In</button>
          <button onClick={() => setMode("signup")}>Sign Up</button>
          <button onClick={() => setMode("reset")}>Reset Password</button>
        </div>
      </div>
    </div>
  );
}
