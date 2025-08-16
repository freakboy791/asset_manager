// pages/company/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";

type Company = {
  id: string;
  name: string;
  depreciation_rate: number | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
};

export default function CompanyPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.company_id) {
        setError("No companies found.");
        return;
      }

      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      if (companyError || !companyData) {
        setError("Company not found.");
        return;
      }

      setCompany(companyData);
    };

    void fetchCompany();
  }, [router]);

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!company) return <p className="p-6">Loading company details…</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-4">{company.name}</h1>
      <p><strong>Depreciation Rate:</strong> {company.depreciation_rate ?? "N/A"}%</p>
      {company.street && <p><strong>Address:</strong> {company.street}, {company.city}, {company.state} {company.zip}</p>}
      {company.phone && <p><strong>Phone:</strong> {company.phone}</p>}
      {company.email && <p><strong>Email:</strong> {company.email}</p>}
      {company.note && <p><strong>Note:</strong> {company.note}</p>}

      <button
        onClick={() => router.push("/company/edit")}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Update Company Details
      </button>
    </div>
  );
}
