import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    serial: '',
    assigned_to: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    const { data, error } = await supabase.from('assets').select('*').order('assigned_on', { ascending: false });
    if (data) setAssets(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { name, serial, assigned_to, notes } = formData;

    const { error } = await supabase.from('assets').insert({
      name,
      serial,
      assigned_to,
      notes,
    });

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage('✅ Asset added successfully!');
      setFormData({ name: '', serial: '', assigned_to: '', notes: '' });
      fetchAssets(); // refresh list
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🆕 Add New Asset</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input name="name" placeholder="Asset name" value={formData.name} onChange={handleChange} required />
        <br />
        <input name="serial" placeholder="Serial number" value={formData.serial} onChange={handleChange} required />
        <br />
        <input name="assigned_to" placeholder="Assigned to (email or name)" value={formData.assigned_to} onChange={handleChange} />
        <br />
        <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} rows={3}></textarea>
        <br />
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Asset'}</button>
      </form>

      {message && <p>{message}</p>}

      <h2>📋 Current Assets</h2>
      <ul>
        {assets.map(asset => (
          <li key={asset.id}>
            <strong>{asset.name}</strong> — {asset.serial} — Assigned to: {asset.assigned_to}
          </li>
        ))}
      </ul>
    </main>
  );
}
