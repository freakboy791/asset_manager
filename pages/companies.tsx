// pages/companies.tsx
import { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

type Company = {
  id: string;
  name: string;
  depreciation_rate: number;
  city?: string;
  street?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  note?: string;
  created_at?: string;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from<Company, Company>("companies")
        .select("*")
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

    fetchCompanies();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Companies</h1>

      {loading ? (
        <p>Loading companies…</p>
      ) : companies.length === 0 ? (
        <p>No companies found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="border rounded p-4 shadow hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-gray-700">{company.name}</h2>
              <p className="text-sm text-gray-500">
                Depreciation Rate: {company.depreciation_rate}%
              </p>
              {company.city && <p className="text-sm">{company.city}</p>}
              {company.state && company.zip && (
                <p className="text-sm">
                  {company.state}, {company.zip}
                </p>
              )}
              {company.phone && <p className="text-sm">📞 {company.phone}</p>}
              {company.email && <p className="text-sm">✉️ {company.email}</p>}
              {company.note && (
                <p className="text-sm text-gray-600 mt-2">{company.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

