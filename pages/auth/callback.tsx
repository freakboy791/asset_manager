// pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState("Finalizing sign-in…");

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        setMessage("Could not finalize sign-in. Redirecting…");
      }
      setTimeout(() => router.push("/companies"), 1500);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow text-center">
        <p>{message}</p>
      </div>
    </div>
  );
}
