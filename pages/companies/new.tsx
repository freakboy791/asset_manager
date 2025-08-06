import { useRouter } from 'next/router';
import { useState } from 'react';
import supabase from '@/utils/supabaseClient';

export default function AddCompany() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    depreciation_rate: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    note: '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from('companies').insert([
      { ...formData, depreciation_rate: parseFloat(formData.depreciation_rate) },
    ]);
    if (!error) {
      alert('Company added!');
      router.push('/companies');
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Company</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" placeholder="Name" onChange={handleChange} required className="w-full p-2 border" />
        <input name="depreciation_rate" placeholder="Depreciation %" type="number" step="0.01" onChange={handleChange} className="w-full p-2 border" />
        <input name="street" placeholder="Street" onChange={handleChange} className="w-full p-2 border" />
        <input name="city" placeholder="City" onChange={handleChange} className="w-full p-2 border" />
        <input name="state" placeholder="State" onChange={handleChange} className="w-full p-2 border" />
        <input name="zip" placeholder="Zip" onChange={handleChange} className="w-full p-2 border" />
        <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full p-2 border" />
        <input name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border" />
        <textarea name="note" placeholder="Note" onChange={handleChange} className="w-full p-2 border" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save Company</button>
      </form>
    </div>
  );
}
