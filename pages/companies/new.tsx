import { useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";

export default function NewCompany() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    const { error } = await supabase.from("companies").insert([{ name }]);
    setSaving(false);
    if (error) return setErr(error.message);
    router.push("/companies");
  };

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Add Company</h1>
      <form onSubmit={submit} className="bg-white border rounded p-6 max-w-md space-y-4">
        <input
          className="w-full border rounded p-2"
          placeholder="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {err && <div className="text-red-600 text-sm">Error: {err}</div>}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </main>
  );
}
