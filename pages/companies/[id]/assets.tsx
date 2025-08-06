import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

export default function CompanyAssets() {
  const router = useRouter();
  const { id } = router.query;
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchAssets = async () => {
      const { data } = await supabase.from('assets').select('*').eq('company_id', id);
      if (data) setAssets(data);
    };
    fetchAssets();
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assets for Company</h1>
      <Link href="/assets/new" className="text-blue-600 underline mb-4 inline-block">Add New Asset</Link>
      <ul className="space-y-2">
        {assets.map((asset) => (
          <li key={asset.id}>
            <Link href={`/assets/${asset.id}`} className="text-blue-800 underline">
              {asset.name} ({asset.serial_number})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
