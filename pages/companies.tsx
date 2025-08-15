// pages/companies.tsx
import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import supabase from "../utils/supabaseClient";
import SiteLayout from "../components/SiteLayout";

type Company = {
  id: string;
  name: string;
  depreciation_rate: number;
  city: string;
  street: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  note: string;
  created_at: string;
};

export default function CompaniesPage() {
  const user = useUser();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select<Company[]>("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching companies:", error.message);
      return;
    }

    if (data) {
      setCompanies(data);
    }

    setLoading(false);
  };

  return (
    <SiteLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Your Companies</h1>
        {loading ? (
          <p>Loading...</p>
        ) : companies.length === 0 ? (
          <p>No companies found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div key={company.id} className="border p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">{company.name}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  Depreciation Rate: {company.depreciation_rate}%
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {company.street}, {company.city}, {company.state} {company.zip}
                </p>
                <p className="text-sm text-gray-600 mb-1">{company.phone}</p>
                <p className="text-sm text-gray-600 mb-1">{company.email}</p>
                <p className="text-sm text-gray-600 italic">{company.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
