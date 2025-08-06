import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

type Company = {
  id: string;
  name: string;
  depreciation_rate: number;
};

export default function CompanyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCompany = async () => {
      const { data } = await supabase.from('companies').select('*').eq('id', id).single();
      setCompany(data);
    };
    fetchCompany();
  }, [id]);

  if (!company) return <p className="p-4">Loading company...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{company.name}</h1>
      <p>Depreciation Rate: {company.depreciation_rate * 100}%</p>
      <Link href={`/companies/${company.id}/assets`}>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">View Assets</button>
      </Link>
    </div>
  );
}
