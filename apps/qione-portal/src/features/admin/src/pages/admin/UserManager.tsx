import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import Sidebar from '../../components/layout/Sidebar';

export default function UserManager() {
  const { getToken } = useAuth();
  const [email, setEmail] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [role, setRole] = useState('member');
  const [status, setStatus] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Inviting...');
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:8000/admin/user/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, tenant_id: tenantId, role })
      });
      if (res.ok) setStatus('User invited and mapped!');
      else setStatus('Failed to invite check logs.');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content" style={{ padding: '1rem' }}>
        <h2>User & Role Management</h2>
        <form onSubmit={handleInvite} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginTop: '1rem' }}>
          <input placeholder="User Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.5rem' }} />
          <input placeholder="Tenant ID" value={tenantId} onChange={e => setTenantId(e.target.value)} required style={{ padding: '0.5rem' }} />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '0.5rem' }}>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <button type="submit" className="btn" style={{ padding: '0.5rem' }}>Invite & Assign</button>
          {status && <div>{status}</div>}
        </form>
      </div>
    </div>
  );
}
