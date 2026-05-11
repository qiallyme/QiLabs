import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import Sidebar from '../../components/layout/Sidebar';

export default function TableBrowser() {
  const { getToken } = useAuth();
  const [table, setTable] = useState('qione.tenants');
  const [rowId, setRowId] = useState('');
  const [column, setColumn] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Updating...');
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:8000/admin/mutate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          table,
          record_id: rowId,
          updates: { [column]: value }
        })
      });
      const data = await res.json();
      if (res.ok) setStatus('Success! Audit logged.');
      else setStatus(`Error: ${data.detail || 'Failed'}`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content" style={{ padding: '1rem' }}>
        <h2>Table Browser & Editor</h2>
        <form onSubmit={handleUpdate} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginTop: '1rem' }}>
          <select value={table} onChange={e => setTable(e.target.value)} style={{ padding: '0.5rem' }}>
            <option value="qione.tenants">qione.tenants</option>
            <option value="qione.tenant_members">qione.tenant_members</option>
            <option value="qione.member_roles">qione.member_roles</option>
          </select>
          <input placeholder="Row ID (UUID)" value={rowId} onChange={e => setRowId(e.target.value)} required style={{ padding: '0.5rem' }} />
          <input placeholder="Column Name" value={column} onChange={e => setColumn(e.target.value)} required style={{ padding: '0.5rem' }} />
          <input placeholder="New Value" value={value} onChange={e => setValue(e.target.value)} required style={{ padding: '0.5rem' }} />
          <button type="submit" className="btn" style={{ padding: '0.5rem' }}>Update Row</button>
          {status && <div>{status}</div>}
        </form>
      </div>
    </div>
  );
}
