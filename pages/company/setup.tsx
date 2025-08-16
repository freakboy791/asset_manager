// pages/company/setup.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";

type ProfileRow = {
  id: string;
  role: "admin" | "manager" | "tech" | "viewer";
  approved: boolean;
  company_id: string | null;
};

export default function CompanySetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // form fields
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
    const guard = async () => {
      // must be signed in
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/");
        return;
      }

      // must have a profile; managers without a company see this page
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("id, role, approved, company_id")
        .eq("id", user.id)
        .single<ProfileRow>();

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

      // If admin or already has a company, send them away
      if (profile.role === "admin" || profile.company_id) {
        router.replace("/company");
        return;
      }

      // Otherwise (manager without company) -> show form
      setLoading(false);
    };

    void guard();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        setError("Not signed in.");
        return;
      }

      // basic validation
      if (!name.trim()) {
        setError("Company name is required.");
        return;
      }

      // Insert company
      const { data: companyRows, error: insErr } = await supabase
        .from("companies")
        .insert([
          {
            name: name.trim(),
            depreciation_rate:
              depreciationRate === "" ? null : Number(depreciationRate),
            street: street || null,
            city: city || null,
            state: state || null,
            zip: zip || null,
            phone: phone || null,
            email: email || null,
            note: note || null,
          },
        ])
        .select("id")
        .limit(1);

      if (insErr || !companyRows || companyRows.length === 0) {
        setError(insErr?.message || "Failed to create company.");
        return;
      }

      const newCompanyId = companyRows[0].id as string;

      // Link profile -> company
      const { error: upErr } = await supabase
        .from("profiles")
        .update({ company_id: newCompanyId })
        .eq("id", user.id);

      if (upErr) {
        setError(upErr.message);
        return;
      }

      // Done — send them to Company
      router.replace("/company");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create Your Company</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Company Name *</label>
          <input
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Corp"
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
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="border p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@company.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Street</label>
          <input
            className="border p-2 w-full"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="123 Main St"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            className="border p-2 w-full"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Springfield"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <input
            className="border p-2 w-full"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="PA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ZIP</label>
          <input
            className="border p-2 w-full"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="19000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            className="border p-2 w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Note</label>
          <textarea
            className="border p-2 w-full"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., company type or internal notes"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Create Company"}
          </button>
        </div>
      </form>
    </div>
  );
}
