import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

type Asset = {
  id: string;
  name: string;
  serial: string;
};

export default function CompanyAssetsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchAssets = async () => {
      const { data } = await supabase
        .from('assets')
        .select('id, name, serial')
        .eq('company_id', id);
      if (data) setAssets(data);
    };
    fetchAssets();
  }, [id]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Assets for Company</h1>
      <ul>
        {assets.map((asset) => (
          <li key={asset.id} className="mb-2">
            <Link href={`/assets/${asset.id}`}>
              <span className="text-blue-600 hover:underline">
                {asset.name} – {asset.serial}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
