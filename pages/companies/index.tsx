import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

type Company = {
  id: string;
  name: string;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase.from('companies').select('id, name');
      if (!error && data) setCompanies(data);
    };
    fetchCompanies();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>
      <ul>
        {companies.map((company) => (
          <li key={company.id} className="mb-2">
            <Link href={`/companies/${company.id}`}>
              <span className="text-blue-600 hover:underline">{company.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
