import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "../../utils/supabaseClient";

type Company = {
  id: string;
  name: string;
  depreciation_rate: number | null;
};

type Asset = {
  id: string;
  name: string;
  serial: string | null;
};

export default function CompanyDetail() {
  const { query: { id } } = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setErr(null);

      // Fetch company
      const { data: comp, error: cErr } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();

      if (cErr) {
        setErr(cErr.message);
        setCompany(null);
        setAssets([]);
        setLoading(false);
        return;
      }
      setCompany(comp);

      // Fetch assets for this company
      const { data: as, error: aErr } = await supabase
        .from("assets")
        .select("id, name, serial")
        .eq("company_id", id)
        .order("name", { ascending: true });

      if (aErr) setErr(aErr.message);
      if (as) setAssets(as);

      setLoading(false);
    })();
  }, [id]);

  if (loading) return <main className="p-8">Loading…</main>;
  if (err) return <main className="p-8 text-red-600">Error: {err}</main>;
  if (!company) return <main className="p-8">Company not found.</main>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{company.name}</h1>
        {company.depreciation_rate != null && (
          <div className="text-sm text-gray-600">
            Depreciation: {company.depreciation_rate}% per year
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Assets</h2>
        <Link
          href={`/companies/${company.id}/assets/new`}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Asset
        </Link>
      </div>

      <div className="bg-white border rounded divide-y">
        {assets.length === 0 && (
          <div className="p-4 text-gray-500">No assets yet.</div>
        )}
        {assets.map((a) => (
          <Link
            key={a.id}
            href={`/assets/${a.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-gray-600">Serial: {a.serial ?? "—"}</div>
            </div>
            <div className="text-blue-700">View →</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
