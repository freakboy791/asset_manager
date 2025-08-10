import { useEffect, useState } from "react";
import supabase from "@/utils/supabaseClient";

type Company = { id: string; name: string };

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) setErr(error.message);
      if (data) setCompanies(data);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Companies</h1>
        <a
          href="/companies/new"
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Company
        </a>
      </div>

      {loading && <div className="text-gray-600">Loading…</div>}
      {err && <div className="text-red-600">Error: {err}</div>}

      {!loading && !err && (
        <ul className="bg-white border rounded divide-y">
          {companies.length === 0 && (
            <li className="p-4 text-gray-500">No companies yet.</li>
          )}
          {companies.map((c) => (
            <li key={c.id} className="p-4">
              <span className="font-medium">{c.name}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
