// pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finalizing sign-in…");

  useEffect(() => {
    const run = async () => {
      // 1) Turn the confirmation/reset link into a session
      const { error: exchError } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (exchError) {
        console.error("Auth callback error:", exchError.message);
        setMsg("Could not finalize sign-in. Please try again.");
        setTimeout(() => router.replace("/"), 1500);
        return;
      }

      // 2) Get the now-authenticated user
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        console.error("No user after callback:", userErr?.message);
        setMsg("No user session. Redirecting to sign in…");
        setTimeout(() => router.replace("/"), 1500);
        return;
      }

      // 3) Ensure a profile row exists (insert if missing). Role starts as 'pending'.
      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email ?? "",
          role: "pending",
          approved: false,
        }, { onConflict: "id" });

      if (upsertErr) {
        console.error("Profile upsert failed:", upsertErr.message);
        // Don’t block the user here; we’ll just take them to the app
      }

      setMsg("Success! Redirecting…");
      setTimeout(() => router.replace("/"), 800);
    };

    void run();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">{msg}</p>
    </div>
  );
}

