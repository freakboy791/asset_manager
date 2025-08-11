// pages/assets/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "../../utils/supabaseClient";

type Asset = {
  id: string;
  name: string;
  serial: string | null;
  cost: number | null;
  added_on: string | null;   // ISO date string "YYYY-MM-DD"
  status: string | null;
  notes: string | null;
  company_id: string | null;
};

type Company = {
  id: string;
  name: string;
  depreciation_rate: number | null; // percent per year, e.g. 20
};

export default function AssetDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [asset, setAsset] = useState<Asset | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<Partial<Asset> | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load asset + company
  useEffect(() => {
    if (!id) return;
    (async () => {
      setErr(null);
      setLoading(true);

      const { data: a, error: aErr } = await supabase
        .from("assets")
        .select("*")
        .eq("id", id)
        .single();

      if (aErr || !a) {
        setErr(aErr?.message || "Asset not found");
        setAsset(null);
        setForm(null);
        setCompany(null);
        setLoading(false);
        return;
      }

      setAsset(a);
      setForm(a);

      if (a.company_id) {
        const { data: c, error: cErr } = await supabase
          .from("companies")
          .select("*")
          .eq("id", a.company_id)
          .single();
        if (!cErr && c) setCompany(c);
      } else {
        setCompany(null);
      }

      setLoading(false);
    })();
  }, [id]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...(prev || {}), [name]: value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form) return;
    setSaving(true);
    setErr(null);

    const payload = {
      name: form.name ?? "",
      serial: form.serial ?? null,
      cost:
        form.cost !== undefined && form.cost !== null && form.cost !== ""
          ? Number(form.cost)
          : null,
      added_on: form.added_on || null, // keep as "YYYY-MM-DD" or null
      status: form.status ?? null,
      notes: form.notes ?? null,
    };

    const { data, error } = await supabase
      .from("assets")
      .update(payload)
      .eq("id", id)
      .select()
      .single(); // return the updated row

    setSaving(false);

    if (error) {
      setErr(error.message);
      console.error("Update error:", error);
      return;
    }

    if (data) {
      setAsset(data);
      setForm(data);
    }
    alert("Asset updated");
  };

  const depreciatedValue = () => {
    if (
      !asset ||
      !company ||
      !asset.added_on ||
      !asset.cost ||
      company.depreciation_rate == null
    )
      return null;

    const added = new Date(asset.added_on);
    const years =
      (Date.now() - added.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const rate = Number(company.depreciation_rate) / 100; // percent → fraction
    const depreciation = Number(asset.cost) * rate * years;
    return Math.max(0, Number(asset.cost) - depreciation).toFixed(2);
  };

  if (!id) return <main className="p-8">Loading…</main>;
  if (loading) return <main className="p-8 text-gray-600">Loading…</main>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Asset Detail</h1>
        {asset?.company_id && (
          <Link
            href={`/companies/${asset.company_id}`}
            className="text-blue-600 hover:underline"
          >
            ← Back to Company
          </Link>
        )}
      </div>

      {err && (
        <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 rounded">
          {err}
        </div>
      )}

      {form && (
        <>
          <form
            onSubmit={onSave}
            className="bg-white border rounded p-6 max-w-2xl space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm text-gray-600 mb-1">Name</div>
                <input
                  className="border rounded p-2 w-full"
                  name="name"
                  value={form.name ?? ""}
                  onChange={onChange}
                  required
                />
              </label>

              <label className="block">
                <div className="text-sm text-gray-600 mb-1">Serial</div>
                <input
                  className="border rounded p-2 w-full"
                  name="serial"
                  value={form.serial ?? ""}
                  onChange={onChange}
                />
              </label>

              <label className="block">
                <div className="text-sm text-gray-600 mb-1">Cost</div>
                <input
                  type="number"
                  step="0.01"
                  className="border rounded p-2 w-full"
                  name="cost"
                  value={
                    form.cost !== undefined && form.cost !== null
                      ? String(form.cost)
                      : ""
                  }
                  onChange={onChange}
                />
              </label>

              <label className="block">
                <div className="text-sm text-gray-600 mb-1">Added On</div>
                <input
                  type="date"
                  className="border rounded p-2 w-full"
                  name="added_on"
                  value={(form.added_on ?? "").slice(0, 10)}
                  onChange={onChange}
                />
              </label>

              <label className="block">
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <input
                  className="border rounded p-2 w-full"
                  name="status"
                  value={form.status ?? ""}
                  onChange={onChange}
                />
              </label>
            </div>

            <label className="block">
              <div className="text-sm text-gray-600 mb-1">Notes</div>
              <textarea
                className="border rounded p-2 w-full"
                rows={3}
                name="notes"
                value={form.notes ?? ""}
                onChange={onChange}
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Update"}
              </button>
              {asset?.company_id && (
                <Link
                  href={`/companies/${asset.company_id}`}
                  className="px-4 py-2 rounded border hover:bg-gray-50"
                >
                  Cancel
                </Link>
              )}
            </div>
          </form>

          {company && (
            <div className="mt-6 bg-white border rounded p-4 max-w-2xl">
              <div className="font-medium mb-1">Depreciation</div>
              <div className="text-sm text-gray-700">
                Company: <span className="font-medium">{company.name}</span>
                <br />
                Rate: {company.depreciation_rate ?? 0}% per year
                <br />
                Added on:{" "}
                {asset.added_on
                  ? new Date(asset.added_on).toLocaleDateString()
                  : "—"}
                <br />
                Current depreciated value:{" "}
                {depreciatedValue() ? `$${depreciatedValue()}` : "—"}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
