import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import supabase from '@/utils/supabaseClient';

export default function CompaniesList() {
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('companies').select('id,name').order('name');
      if (data) setCompanies(data);
    })();
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Companies</h2>
        <Link href="/companies/new" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Add Company</Link>
      </div>

      <div className="bg-white rounded border">
        <ul>
          {companies.map((c, idx) => (
            <li key={c.id} className={`p-4 ${idx !== companies.length - 1 ? 'border-b' : ''}`}>
              <Link className="text-blue-700 hover:underline" href={`/companies/${c.id}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
