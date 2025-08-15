// pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
        setStatus("Could not finalize sign-in. Redirecting…");
        // Redirect after short delay
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      setStatus("Sign-in confirmed! Redirecting…");
      setTimeout(() => router.push("/companies"), 1500);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center bg-white p-6 rounded shadow-md">
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
}
