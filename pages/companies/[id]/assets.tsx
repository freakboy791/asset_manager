import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import supabase from '@/utils/supabaseClient';

export default function CompanyAssets() {
  const { query: { id } } = useRouter();
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('assets').select('id,name,serial').eq('company_id', id);
      if (data) setAssets(data);
    })();
  }, [id]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Assets</h2>
        <Link href="/assets/new" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Add Asset</Link>
      </div>

      <div className="bg-white border rounded divide-y">
        {assets.length === 0 && <div className="p-4 text-gray-500">No assets yet.</div>}
        {assets.map(a => (
          <Link key={a.id} href={`/assets/${a.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-gray-600">Serial: {a.serial}</div>
            </div>
            <div className="text-blue-700">View →</div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}

