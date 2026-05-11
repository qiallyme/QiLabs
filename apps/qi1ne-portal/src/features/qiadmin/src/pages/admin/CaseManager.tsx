import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { supabase } from '../../lib/supabase';

export default function CaseManager() {
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    const { data } = await supabase.schema('qicase').from('cases').select('*');
    if (data) setCases(data);
  }

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <h1>Case Manager</h1>
        <div className="glass-panel">
          <button className="btn" style={{marginBottom: '20px'}}>+ New Case</button>
          <table>
            <thead>
              <tr>
                <th>Case Name</th>
                <th>Case Number</th>
                <th>Court</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td>{c.case_name}</td>
                  <td>{c.case_number}</td>
                  <td>{c.court}</td>
                  <td>{c.status}</td>
                </tr>
              ))}
              {cases.length === 0 && <tr><td colSpan={4}>No cases found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
