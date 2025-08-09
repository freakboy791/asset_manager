import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '@/components/Layout';
import supabase from '@/utils/supabaseClient';

export default function AddCompany() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', depreciation_rate: '', street: '', city: '', state: '', zip: '',
    phone: '', email: '', note: '',
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, depreciation_rate: form.depreciation_rate ? parseFloat(form.depreciation_rate) : null };
    const { error } = await supabase.from('companies').insert([payload]);
    setSaving(false);
    if (error) return alert(error.message);
    router.push('/companies');
  };

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Add New Company</h2>
      <form onSubmit={onSubmit} className="bg-white border rounded p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="border rounded p-2" name="name" placeholder="Company name" onChange={onChange} required />
          <input className="border rounded p-2" type="number" step="0.01" name="depreciation_rate" placeholder="Depreciation rate as percent (e.g. 20)" onChange={onChange} />
          <input className="border rounded p-2" name="street" placeholder="Street" onChange={onChange} />
          <input className="border rounded p-2" name="city" placeholder="City" onChange={onChange} />
          <input className="border rounded p-2" name="state" placeholder="State" onChange={onChange} />
          <input className="border rounded p-2" name="zip" placeholder="ZIP" onChange={onChange} />
          <input className="border rounded p-2" name="phone" placeholder="Phone" onChange={onChange} />
          <input className="border rounded p-2" type="email" name="email" placeholder="Email" onChange={onChange} />
        </div>
        <textarea className="border rounded p-2 w-full" rows={3} name="note" placeholder="Notes / Company type" onChange={onChange} />
        <button disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          {saving ? 'Saving…' : 'Save Company'}
        </button>
      </form>
    </Layout>
  );
}
