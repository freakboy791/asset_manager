import Link from 'next/link';
import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';

export default function CompaniesList() {
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase.from('companies').select('*');
      if (data) setCompanies(data);
    };
    fetchCompanies();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>
      <Link href="/companies/new" className="text-blue-600 underline">Add New Company</Link>
      <ul className="mt-4 space-y-2">
        {companies.map((company) => (
          <li key={company.id}>
            <Link href={`/companies/${company.id}`} className="text-lg text-blue-800 underline">
              {company.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
