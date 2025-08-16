// components/LogoutButton.tsx
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-white hover:underline ml-4"
    >
      Logout
    </button>
  );
}

