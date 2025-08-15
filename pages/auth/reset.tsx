// pages/auth/reset.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [busy, setBusy] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Make sure the user is in a password reset session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessageType("error");
        setMessage(
          "Reset link problem. Please request a new password reset from the sign-in page."
        );
      }
      setSessionChecked(true);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (password.length < 6) {
      setMessageType("error");
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.updateUser({ password });

    setBusy(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
    } else {
      setMessageType("success");
      setMessage("Password updated successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Checking reset link...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow rounded w-full max-w-sm">
        <h1 className="text-2xl mb-4">Reset Password</h1>

        {message && (
          <p
            className={`mb-4 text-sm ${
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

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            className="border p-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm new password"
            className="border p-2 w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded w-full"
          >
            {busy ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
