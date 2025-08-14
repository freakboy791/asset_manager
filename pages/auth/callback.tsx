// pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finalizing sign-in…");

  useEffect(() => {
    const run = async () => {
      try {
        // First, try to exchange the code in the URL for a session
        const { error: exchError } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (exchError) {
          // Fallback: maybe we already have a valid session (e.g., link clicked twice)
          const { data, error: sessErr } = await supabase.auth.getSession();
          if (sessErr || !data.session) throw exchError; // still no session — treat as error
        }
        setMsg("Success! Redirecting…");
        setTimeout(() => router.replace("/"), 300);
      } catch {
        // Quietly send the user to the homepage to try signing in
        setMsg("Could not finalize sign-in. Redirecting…");
        setTimeout(() => router.replace("/"), 800);
      }
    };
    void run();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">{msg}</p>
    </div>
  );
}
