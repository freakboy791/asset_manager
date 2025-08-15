// pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const finalizeSignIn = async () => {
      // Supabase stores session from the URL hash automatically
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("Could not finalize sign-in:", error);
        return;
      }

      router.push("/companies");
    };

    finalizeSignIn();
  }, [router]);

  return <p className="text-center mt-10">Finalizing sign-in…</p>;
}
