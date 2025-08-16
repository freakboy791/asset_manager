// pages/company/edit.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";

export default function EditCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [depreciationRate, setDepreciationRate] = useState<number | "">("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const loadCompany = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profErr || !profile?.company_id) {
        setError("Company not associated with your profile.");
        setLoading(false);
        return;
      }

      const { data: company, error: compErr } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      if (compErr || !company) {
        setError("Company not found.");
        setLoading(false);
        return;
      }

      setCompanyId(company.id);
      setName(company.name || "");
      setDepreciationRate(company.depreciation_rate ?? "");
      setStreet(company.street || "");
      setCity(company.city || "");
      setState(company.state || "");
      setZip(company.zip || "");
      setPhone(company.phone || "");
      setEmail(company.email || "");
      setNote(company.note || "");
      setLoading(false);
    };

    void loadCompany();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (!companyId) {
        setError("Missing company ID.");
        return;
      }

      const { error: updateErr } = await supabase
        .from("companies")
        .update({
          name: name.trim(),
          depreciation_rate: depreciationRate === "" ? null : Number(depreciationRate),
          street: street || null,
          city: city || null,
          state: state || null,
          zip: zip || null,
          phone: phone || null,
          email: email || null,
          note: note || null,
        })
        .eq("id", companyId);

      if (updateErr) {
        setError(updateErr.message);
        return;
      }

      router.replace("/companies");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Company Info</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Company Name *</label>
          <input
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Depreciation Rate (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="border p-2 w-full"
            value={depreciationRate}
            onChange={(e) => setDepreciationRate(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="border p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Street</label>
          <input
            className="border p-2 w-full"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            className="border p-2 w-full"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <input
            className="border p-2 w-full"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ZIP</label>
          <input
            className="border p-2 w-full"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            className="border p-2 w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Note</label>
          <textarea
            className="border p-2 w-full"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Update Company"}
          </button>
        </div>
      </form>
    </div>
  );
}