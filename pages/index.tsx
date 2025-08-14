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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.user) {
        // Call our admin notification API
        await fetch("/api/notify-new-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: data.user.id,
            email: data.user.email,
          }),
        });
      }

      setMessage(
        "Account created. If email confirmations are enabled, check your inbox; otherwise, you can sign in now."
      );
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.push("/companies");
      return;
    }

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Password reset email sent.");
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
              required={mode !== "reset"}
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
