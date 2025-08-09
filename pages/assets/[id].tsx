import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import supabase from '@/utils/supabaseClient';

export default function AssetDetail() {
  const { query: { id } } = useRouter();
  const [asset, setAsset] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('assets').select('*').eq('id', id).single();
      if (!data) return;
      setAsset(data);
      setForm({ ...data });
      const { data: comp } = await supabase.from('companies').select('*').eq('id', data.company_id).single();
      setCompany(comp);
    })();
  }, [id]);

  const onChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, cost: form.cost ? parseFloat(form.cost) : null };
    const { error } = await supabase.from('assets').update(payload).eq('id', id);
    setSaving(false);
    if (error) return alert(error.message);
    alert('Asset updated');
  };

  const depreciatedValue = () => {
    if (!asset || !company || !asset.added_on || !asset.cost || company.depreciation_rate == null) return null;
    const added = new Date(asset.added_on);
    const years = (Date.now() - added.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const depreciation = Number(asset.cost) * (Number(company.depreciation_rate)/100) * years;
    return Math.max(0, Number(asset.cost) - depreciation).toFixed(2);
  };

  if (!form) return <Layout><div>Loading…</div></Layout>;

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Asset Detail</h2>
      <form onSubmit={onSave} className="bg-white border rounded p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="border rounded p-2" name="name" value={form.name || ''} onChange={onChange} />
          <input className="border rounded p-2" name="serial" value={form.serial || ''} onChange={onChange} />
          <input className="border rounded p-2" type="number" step="0.01" name="cost" value={form.cost ?? ''} onChange={onChange} />
          <input className="border rounded p-2" type="date" name="added_on" value={form.added_on?.slice(0,10) || ''} onChange={onChange} />
          <input className="border rounded p-2" name="status" value={form.status || ''} onChange={onChange} />
        </div>
        <textarea className="border rounded p-2 w-full" rows={3} name="notes" value={form.notes || ''} onChange={onChange} />
        <button disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          {saving ? 'Saving…' : 'Update'}
        </button>
      </form>

      {company && (
        <div className="mt-6 bg-white border rounded p-4">
          <div className="font-medium mb-1">Depreciation</div>
          <div className="text-sm text-gray-700">
            Company rate: {company.depreciation_rate ?? 0}% per year<br/>
            Added on: {asset.added_on ? new Date(asset.added_on).toLocaleDateString() : '—'}<br/>
            Current depreciated value: {depreciatedValue() ? `$${depreciatedValue()}` : '—'}
          </div>
        </div>
      )}
    </Layout>
  );
}
