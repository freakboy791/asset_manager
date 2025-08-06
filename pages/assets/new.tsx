import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';

export default function AddAsset() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    cost: '',
    company_id: '',
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase.from('companies').select('id, name');
      if (data) setCompanies(data);
    };
    fetchCompanies();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from('assets').insert([{ ...formData, cost: parseFloat(formData.cost) }]);
    if (!error) {
      alert('Asset added!');
      router.push('/');
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Asset</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" onChange={handleChange} required className="w-full p-2 border" />
        <input name="serial_number" placeholder="Serial Number" onChange={handleChange} required className="w-full p-2 border" />
        <input type="number" name="cost" placeholder="Cost" onChange={handleChange} required className="w-full p-2 border" />
        <select name="company_id" onChange={handleChange} required className="w-full p-2 border">
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="status" placeholder="Status" defaultValue="Active" onChange={handleChange} className="w-full p-2 border" />
        <textarea name="notes" placeholder="Notes" onChange={handleChange} className="w-full p-2 border" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Asset</button>
      </form>
    </div>
  );
}
