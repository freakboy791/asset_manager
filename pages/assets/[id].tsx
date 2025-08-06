import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function AssetDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [asset, setAsset] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAsset = async () => {
      const { data, error } = await supabase.from('assets').select('*').eq('id', id).single();
      if (data) {
        setAsset(data);
        setFormData({ ...data });

        const { data: companyData } = await supabase.from('companies').select('*').eq('id', data.company_id).single();
        setCompany(companyData);
      }
    };

    fetchAsset();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from('assets').update(formData).eq('id', id);
    if (!error) {
      alert('Asset updated!');
      router.push(`/companies/${formData.company_id}/assets`);
    } else {
      alert(error.message);
    }
  };

  const calculateDepreciatedValue = () => {
    if (!asset || !company || !asset.added_on || !asset.cost || !company.depreciation_rate) return null;

    const added = new Date(asset.added_on);
    const now = new Date();
    const years = (now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    const depreciation = asset.cost * (company.depreciation_rate / 100) * years;
    return Math.max(0, asset.cost - depreciation).toFixed(2);
  };

  if (!formData) return <div className="p-6">Loading asset...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Asset Detail</h1>

      <form onSubmit={handleUpdate} className="space-y-4">
        <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border" />
        <input name="serial_number" value={formData.serial_number} onChange={handleChange} className="w-full p-2 border" />
        <input name="cost" type="number" value={formData.cost} onChange={handleChange} className="w-full p-2 border" />
        <input name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border" />
        <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-2 border" />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
      </form>

      {company && (
        <div className="mt-6 text-sm text-gray-700">
          <p><strong>Company:</strong> {company.name}</p>
          <p><strong>Depreciation Rate:</strong> {company.depreciation_rate}% per year</p>
          <p><strong>Added On:</strong> {new Date(asset.added_on).toLocaleDateString()}</p>
          <p><strong>Depreciated Value:</strong> ${calculateDepreciatedValue()}</p>
        </div>
      )}
    </div>
  );
}
