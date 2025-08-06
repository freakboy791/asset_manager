import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';

export default function NewCompanyPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    depreciation_rate: 0.2,
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'depreciation_rate' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('companies').insert([formData]);
    if (!error) {
      alert('Company added!');
      router.push('/companies');
    } else {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Company</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" onChange={handleChange} required className="w-full p-2 border" />
        <input type="number" step="0.01" name="depreciation_rate" placeholder="Depreciation Rate (e.g. 0.25)" onChange={handleChange} className="w-full p-2 border" />
        <input name="street" placeholder="Street" onChange={handleChange} className="w-full p-2 border" />
        <input name="city" placeholder="City" onChange={handleChange} className="w-full p-2 border" />
        <input name="state" placeholder="State" onChange={handleChange} className="w-full p-2 border" />
        <input name="zip" placeholder="Zip" onChange={handleChange} className="w-full p-2 border" />
        <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full p-2 border" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border" />
        <textarea name="notes" placeholder="Notes (e.g. type of company)" onChange={handleChange} className="w-full p-2 border" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Company</button>
      </form>
    </div>
  );
}
