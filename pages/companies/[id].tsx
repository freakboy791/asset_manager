import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/utils/supabaseClient';

export default function CompanyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCompany = async () => {
      const { data } = await supabase.from('companies').select('*').eq('id', id).single();
      setCompany(data);
    };
    fetchCompany();
  }, [id]);

  if (!company) return <div className="p-6">Loading company...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{company.name}</h1>
      <p><strong>Depreciation:</strong> {company.depreciation_rate}%</p>
      <p><strong>Address:</strong> {company.street}, {company.city}, {company.state} {company.zip}</p>
      <p><strong>Phone:</strong> {company.phone}</p>
      <p><strong>Email:</strong> {company.email}</p>
      <p><strong>Note:</strong> {company.note}</p>

      <div className="mt-6">
        <Link href={`/companies/${id}/assets`} className="bg-blue-600 text-white px-4 py-2 rounded">View Assets</Link>
      </div>
    </div>
  );
}

