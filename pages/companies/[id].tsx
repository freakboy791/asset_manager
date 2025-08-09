import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import supabase from '@/utils/supabaseClient';

export default function CompanyDetail() {
  const { query: { id } } = useRouter();
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('companies').select('*').eq('id', id).single();
      setCompany(data);
    })();
  }, [id]);

  if (!company) return <Layout><div>Loading…</div></Layout>;

  return (
    <Layout>
      <div className="bg-white border rounded p-6 space-y-2 mb-4">
        <h2 className="text-xl font-semibold">{company.name}</h2>
        <div className="text-gray-700">
          <div><span className="font-medium">Depreciation:</span> {company.depreciation_rate ?? 0}% per year</div>
          <div><span className="font-medium">Address:</span> {company.street}, {company.city}, {company.state} {company.zip}</div>
          <div><span className="font-medium">Phone:</span> {company.phone} &nbsp; <span className="font-medium">Email:</span> {company.email}</div>
          <div><span className="font-medium">Notes:</span> {company.note}</div>
        </div>
      </div>

      <Link href={`/companies/${company.id}/assets`} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
        View Assets
      </Link>
    </Layout>
  );
}
