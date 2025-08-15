// pages/companies.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";

export default function CompaniesPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkProfileAndFetch = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        router.push("/");
        return;
      }

      // Redirect managers without a company to the setup page
      if (profile.role === "manager" && !profile.company_id) {
        router.push("/company/setup");
        return;
      }

      // Optional: Admins see all companies
      if (profile.role === "admin") {
        const { data: allCompanies } = await supabase.from("companies").select("*");
        setCompanies(allCompanies || []);
      } else {
        // Regular users/managers only see their own company
        const { data: userCompany } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id);

        setCompanies(userCompany || []);
      }

      setLoading(false);
    };

    checkProfileAndFetch();
  }, [router]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Your Company</h1>
      {companies.map((company) => (
        <div
          key={company.id}
          className="border border-gray-300 rounded p-4 mb-4 shadow-sm bg-white"
        >
          <h2 className="text-lg font-semibold">{company.name}</h2>
          <p>{company.city}, {company.state}</p>
          <p>{company.email}</p>
          <p className="text-sm text-gray-600">{company.note}</p>
        </div>
      ))}
    </div>
  );
}
