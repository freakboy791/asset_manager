// pages/companies.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../utils/supabaseClient";

interface Company {
  id: number;
  name: string;
  depreciation_rate: number;
  city: string;
  street: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  note: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching companies:", error);
      } else {
        setCompanies(data || []);
      }
      setLoading(false);
    };

    fetchCompanies();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="border rounded p-4 shadow hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold mb-2">{company.name}</h2>
              <p className="text-sm text-gray-600">{company.city}, {company.state}</p>
              <p className="text-sm">{company.email}</p>
              <p className="text-sm">{company.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}