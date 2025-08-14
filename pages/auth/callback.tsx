// pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient"; // use relative path to avoid alias issues

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      // Exchange the code in the URL for a session (handles confirm/reset links)
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error("Auth callback error:", error.message);
        // Send back to login if something goes wrong
        router.replace("/");
        return;
      }
      // Success: send them into the app (you can change the target later)
      router.replace("/");
    };
    void run();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Finalizing sign-in…</p>
    </div>
  );
}
