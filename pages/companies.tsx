// pages/companies.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "../utils/supabaseClient";

type Company = {
  id: number;
  name: string;
  created_at: string;
};

export default function CompaniesPage() {
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      // 1) Ensure there is a logged-in user
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        setError("You are not signed in.");
        setLoading(false);
        return;
      }

      // 2) Read this user's profile.approved
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("approved")
        .eq("id", userData.user.id)
        .single();

      if (profErr) {
        // If profile missing (first login), treat as unapproved until it's created
        setApproved(false);
      } else {
        setApproved(!!profile?.approved);
      }

      // 3) If approved, load companies; if not, skip querying data
      if (profile?.approved) {
        const { data: rows, error: compErr } = await supabase
          .from("companies")
          .select("id, name, created_at")
          .order("created_at", { ascending: false });

        if (compErr) {
          setError(compErr.message);
        } else {
          setCompanies(rows || []);
        }
      }

      setLoading(false);
    };

    void run();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </main>
    );
  }

  // Not signed in or other error
  if (error && approved === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white border rounded p-6 w-full max-w-md text-center">
          <p className="text-red-600">{error}</p>
          <div className="mt-4">
            <Link className="text-blue-600 underline" href="/">Go to Sign In</Link>
          </div>
        </div>
      </main>
    );
  }

  // Signed in but NOT approved yet
  if (approved === false) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white border rounded p-6 w-full max-w-lg text-center">
          <h1 className="text-xl font-semibold mb-2">Awaiting Admin Approval</h1>
          <p className="text-gray-700">
            Your account is created and your email is verified, but an admin must approve your access
            before you can use the app.
          </p>
          <p className="mt-2 text-gray-600">
            If this takes longer than expected, please contact support or try again later.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link className="text-blue-600 underline" href="/">Back to Sign In</Link>
          </div>
        </div>
      </main>
    );
  }

  // Approved: show companies list
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Companies</h1>
          <Link
            href="/companies/new"
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Company
          </Link>
        </header>

        {companies.length === 0 ? (
          <div className="bg-white border rounded p-6 text-center">
            <p className="text-gray-700">No companies yet.</p>
          </div>
        ) : (
          <ul className="bg-white border rounded divide-y">
            {companies.map((c) => (
              <li key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500">Created: {new Date(c.created_at).toLocaleString()}</p>
                </div>
                <Link
                  href={`/companies/${c.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
