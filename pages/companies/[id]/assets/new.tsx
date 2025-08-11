import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import supabase from "../../../../utils/supabaseClient";

export default function NewAssetForCompany() {
  const router = useRouter();
  const { id: companyId } = router.query as { id?: string };

  const [form, setForm] = useState({
    name: "",
    serial: "",
    cost: "",
    added_on: "",
    status: "Active",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Guard: wait for companyId
  useEffect(() => {
    if (!companyId) return;
  }, [companyId]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    setSaving(true);
    setErr(null);

    const payload = {
      name: form.name,
      serial: form.serial,
      cost: form.cost ? parseFloat(form.cost) : null,
      added_on: form.added_on || null, // expects YYYY-MM-DD
      company_id: companyId,
      status: form.status || "Active",
      notes: form.notes || "",
    };

    const { error } = await supabase.from("assets").insert([payload]);
    setSaving(false);

    if (error) return setErr(error.message);

    // Redirect back to this company's detail page (which lists assets)
    router.push(`/companies/${companyId}`);
  };

  if (!companyId) return <main className="p-6">Loading…</main>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Add Asset</h1>

      <form onSubmit={onSubmit} className="bg-white border rounded p-6 max-w-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            className="border rounded p-2"
            name="name"
            placeholder="Asset name"
            value={form.name}
            onChange={onChange}
            required
          />
          <input
            className="border rounded p-2"
            name="serial"
            placeholder="Serial"
            value={form.serial}
            onChange={onChange}
            required
          />
          <input
            className="border rounded p-2"
            type="number"
            step="0.01"
            name="cost"
            placeholder="Cost"
            value={form.cost}
            onChange={onChange}
          />
          <input
            className="border rounded p-2"
            type="date"
            name="added_on"
            value={form.added_on}
            onChange={onChange}
          />
          <input
            className="border rounded p-2"
            name="status"
            placeholder="Status"
            value={form.status}
            onChange={onChange}
          />
        </div>

        <textarea
          className="border rounded p-2 w-full"
          rows={3}
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={onChange}
        />

        {err && <div className="text-red-600 text-sm">Error: {err}</div>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Asset"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/companies/${companyId}`)}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
