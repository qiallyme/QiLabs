import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { supabase } from '../../lib/supabase';

export default function TenantManager() {
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    const { data } = await supabase.schema('qione').from('tenants').select('*');
    if (data) setTenants(data);
  }

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <h1>Tenant Manager</h1>
        <div className="glass-panel">
          <button className="btn" style={{marginBottom: '20px'}}>+ New Tenant</button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.slug}</td>
                  <td>{t.type}</td>
                </tr>
              ))}
              {tenants.length === 0 && <tr><td colSpan={3}>No tenants found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
