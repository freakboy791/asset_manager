// pages/company/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";

type Profile = {
  id: string;
  role: "admin" | "manager" | "tech" | "viewer" | "pending";
  approved: boolean;
  company_id: string | null;
};

type Company = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
};

export default function CompanyHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      const user = userData?.user;

      if (userErr || !user) {
        router.push("/");
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("id, role, approved, company_id")
        .eq("id", user.id)
        .single<Profile>();

      if (profErr || !profile) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      if (!profile.approved) {
        setError("Your account is pending admin approval.");
        setLoading(false);
        return;
      }

      if (profile.role === "manager" && profile.company_id === null) {
        router.replace("/company/setup");
        return;
      }

      const { data: comps, error: compsErr } = await supabase
        .from("companies")
        .select("*")
        .order("name", { ascending: true });

      if (compsErr) {
        setError(compsErr.message);
      } else {
        setCompanies(comps as Company[]);
      }

      setLoading(false);
    };

    void load();
  }, [router]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>
      {error && <p className="text-red-600">{error}</p>}

      {companies.length === 0 ? (
        <p>No companies found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <div key={c.id} className="border rounded p-4 bg-white shadow">
              <h2 className="text-lg font-semibold">{c.name}</h2>
              {(c.city || c.state) && (
                <p className="text-sm text-gray-600">
                  {[c.city, c.state].filter(Boolean).join(", ")}
                </p>
              )}
              {c.email && <p className="text-sm">✉️ {c.email}</p>}
              {c.phone && <p className="text-sm">📞 {c.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
