import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [assets, setAssets] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', serial: '', assigned_to: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    const { data } = await supabase.from('assets').select('*').order('assigned_on', { ascending: false });
    if (data) setAssets(data);
  };

  const handleChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { name, serial, assigned_to, notes } = formData;

    const { error } = await supabase.from('assets').insert({ name, serial, assigned_to, notes });
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Asset added!');
      setFormData({ name: '', serial: '', assigned_to: '', notes: '' });
      fetchAssets();
    }

    setLoading(false);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Asset Manager</h2>
        <nav>
          <ul>
            <li>🏠 Dashboard</li>
            <li>📦 Assets</li>
            <li>📈 Check-ins</li>
          </ul>
        </nav>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="logo">Your Logo</div>
          <div>User Menu</div>
        </header>

        <main className="content">
          <h1>Add New Asset</h1>

          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <input name="name" placeholder="Asset name" value={formData.name} onChange={handleChange} required />
            <br />
            <input name="serial" placeholder="Serial number" value={formData.serial} onChange={handleChange} required />
            <br />
            <input name="assigned_to" placeholder="Assigned to" value={formData.assigned_to} onChange={handleChange} />
            <br />
            <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange}></textarea>
            <br />
            <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Asset'}</button>
          </form>

          {message && <p>{message}</p>}

          <h2>Current Assets</h2>
          <ul>
            {assets.map(asset => (
              <li key={asset.id}>
                <strong>{asset.name}</strong> — {asset.serial} — {asset.assigned_to}
              </li>
            ))}
          </ul>
        </main>

        <footer className="footer">© 2025 Your Company</footer>
      </div>
    </div>
  );
}
