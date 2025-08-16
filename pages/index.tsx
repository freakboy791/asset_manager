// pages/companies/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import supabase from "@/utils/supabaseClient";

type Company = {
  id: string;
  name: string;
  depreciation_rate: number | null;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  note?: string;
};

export default function CompaniesPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCompany = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("company_id, approved")
        .eq("id", user.id)
        .single();

      if (profErr || !profile) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      if (!profile.approved) {
        setError("Your account is awaiting admin approval.");
        setLoading(false);
        return;
      }

      if (!profile.company_id) {
        router.replace("/company/setup");
        return;
      }

      const { data: companyData, error: compErr } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      if (compErr || !companyData) {
        setError("Company not found.");
        setLoading(false);
        return;
      }

      setCompany(companyData);
      setLoading(false);
    };

    void fetchCompany();
  }, [router]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Company Info</h1>

      {company ? (
        <>
          <ul className="mb-6 space-y-1">
            <li><strong>Name:</strong> {company.name}</li>
            {company.depreciation_rate !== null && (
              <li><strong>Depreciation Rate:</strong> {company.depreciation_rate}%</li>
            )}
            {company.street && <li><strong>Street:</strong> {company.street}</li>}
            {company.city && <li><strong>City:</strong> {company.city}</li>}
            {company.state && <li><strong>State:</strong> {company.state}</li>}
            {company.zip && <li><strong>ZIP:</strong> {company.zip}</li>}
            {company.phone && <li><strong>Phone:</strong> {company.phone}</li>}
            {company.email && <li><strong>Email:</strong> {company.email}</li>}
            {company.note && <li><strong>Note:</strong> {company.note}</li>}
          </ul>

          <Link href="/company/edit">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Edit Company
            </button>
          </Link>
        </>
      ) : (
        <p>No companies found.</p>
      )}
    </div>
  );
}

