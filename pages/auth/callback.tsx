// pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error.message);
        return;
      }

      if (data.session) {
        // User is logged in, redirect to home or dashboard
        router.push("/companies");
      } else {
        console.warn("No active session found");
        router.push("/");
      }
    };

    void handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Signing you in...</p>
    </div>
  );
}

