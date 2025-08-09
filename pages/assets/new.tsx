import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import supabase from '@/utils/supabaseClient';

export default function AddAsset() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', serial: '', cost: '', added_on: '', company_id: '', status: 'Active', notes: '',
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('companies').select('id,name').order('name');
      if (data) setCompanies(data);
    })();
  }, []);

  const onChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, cost: form.cost ? parseFloat(form.cost) : null };
    const { error } = await supabase.from('assets').insert([payload]);
    setSaving(false);
    if (error) return alert(error.message);
    router.push(`/companies/${form.company_id}/assets`);
  };

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Add New Asset</h2>
      <form onSubmit={onSubmit} className="bg-white border rounded p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="border rounded p-2" name="name" placeholder="Asset name" onChange={onChange} required />
          <input className="border rounded p-2" name="serial" placeholder="Serial number" onChange={onChange} required />
          <input className="border rounded p-2" type="number" step="0.01" name="cost" placeholder="Cost" onChange={onChange} />
          <input className="border rounded p-2" type="date" name="added_on" onChange={onChange} />
          <select className="border rounded p-2" name="company_id" onChange={onChange} required>
            <option value="">Select company…</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="border rounded p-2" name="status" defaultValue="Active" onChange={onChange} />
        </div>
        <textarea className="border rounded p-2 w-full" rows={3} name="notes" placeholder="Notes" onChange={onChange} />
        <button disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          {saving ? 'Saving…' : 'Add Asset'}
        </button>
      </form>
    </Layout>
  );
}
