// pages/companies.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";
import SiteLayout from "@/components/SiteLayout";

type Company = {
  id: string;
  name: string;
  city?: string;
  state?: string;
};

type Profile = {
  id: string;
  role: string;
  company_id: string | null;
};

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, role, company_id")
        .eq("id", user.id)
        .single<Profile>();

      if (profileErr || !profile) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      if (profile.role === "manager" && !profile.company_id) {
        // First-time manager login — no company yet
        router.replace("/company/setup");
        return;
      }

      // Load companies list
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setCompanies(data || []);
      }

      setLoading(false);
    };

    void loadData();
  }, [router]);

  return (
    <SiteLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Companies</h1>
        {loading && <p>Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}

        <ul className="space-y-2">
          {companies.map((company) => (
            <li key={company.id} className="p-4 border rounded bg-white shadow-sm">
              <p className="font-semibold">{company.name}</p>
              {company.city && company.state && (
                <p className="text-sm text-gray-600">
                  {company.city}, {company.state}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </SiteLayout>
  );
}
