import React, { useEffect, useState } from 'react';
import { UserPlus, Settings, ShieldCheck, CreditCard, LayoutGrid } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Member {
  user_id: string;
  display_name: string;
  status: string;
  roles: string[];
}

interface Tenant {
  id: string;
  name: string;
  type: string;
}

export const HouseholdModule: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  // 1. Fetch all tenants initially
  useEffect(() => {
    async function fetchTenants() {
      const { data } = await supabase.schema('qione').from('tenants').select('id, name, type');
      if (data) {
        setTenants(data);
        // Default to first 'home' type if found
        const homeTenant = data.find(t => t.type === 'home');
        if (homeTenant) setSelectedTenantId(homeTenant.id);
      }
    }
    fetchTenants();
  }, []);

  // 2. Fetch members when tenant changes
  useEffect(() => {
    if (selectedTenantId) {
      fetchMembers(selectedTenantId);
    }
  }, [selectedTenantId]);

  async function fetchMembers(tenantId: string) {
    setIsLoading(true);
    // Join tenant_members with their roles
    const { data } = await supabase.rpc('get_tenant_members_with_roles', { t_id: tenantId });
    if (data) setMembers(data);
    setIsLoading(false);
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !newMemberEmail) return;

    const { error } = await supabase.rpc('upsert_tenant_member', {
      t_id: selectedTenantId,
      p_email: newMemberEmail,
      p_display_name: newMemberName || newMemberEmail.split('@')[0]
    });

    if (!error) {
       setIsInviteModalOpen(false);
       setNewMemberEmail('');
       setNewMemberName('');
       fetchMembers(selectedTenantId);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-10 bg-slate-950 min-h-screen text-slate-200">
      
      {/* HUD: Tenant Selection */}
      <header className="flex justify-between items-end border-b border-white/5 pb-8 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            Household <span className="text-blue-500">Orchestrator</span>
          </h1>
          <p className="text-[10px] font-mono text-slate-500 tracking-[0.2em] uppercase mt-1">Multi-User Governance Control</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-slate-600 uppercase tracking-widest pl-1">Active Environment</label>
          <select 
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-blue-500 min-w-[240px]"
            value={selectedTenantId || ''}
            onChange={(e) => setSelectedTenantId(e.target.value)}
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.type.toUpperCase()})</option>
            ))}
          </select>
        </div>
      </header>

      {/* CORE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <UserPlus />, label: 'MEMBERS', value: members.length, color: 'text-blue-400' },
          { icon: <ShieldCheck />, label: 'ROLES', value: '3 ACTIVE', color: 'text-emerald-400' },
          { icon: <LayoutGrid />, label: 'WORKSPACE', value: selectedTenantId ? '5120TNT' : 'NONE', color: 'text-purple-400' },
          { icon: <CreditCard />, label: 'ENTITLEMENTS', value: '4 MODULES', color: 'text-amber-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
            <div className={`p-2 rounded-xl bg-slate-800/50 w-fit mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-[9px] font-mono text-slate-600 tracking-widest uppercase">{stat.label}</p>
            <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* MEMBER LIST */}
        <section className="lg:col-span-2 bg-slate-900/20 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Current Members</h3>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
            >
              <UserPlus size={16} /> Invite Member
            </button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <th className="pb-4 pl-4">Member Identity</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Roles & Permissions</th>
                <th className="pb-4 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-500 animate-pulse text-xs tracking-widest uppercase">Syncing Registry...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-500">No members registered in this environment.</td></tr>
              ) : members.map((m, i) => (
                <tr key={m.user_id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-6 pl-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-colors">
                        {m.display_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight">{m.display_name}</p>
                        <p className="text-[10px] font-mono text-slate-600 truncate w-32">{m.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${m.status === 'active' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-slate-500/20 text-slate-400 bg-slate-500/5'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex gap-2">
                       {m.roles.map(r => (
                         <span key={r} className="text-[10px] text-blue-400/80 bg-blue-400/5 px-2 py-0.5 rounded border border-blue-400/10">@{r}</span>
                       ))}
                    </div>
                  </td>
                  <td className="py-6 text-right pr-4">
                    <button className="p-2 text-slate-600 hover:text-white transition-colors">
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* COMPLIANCE RULES (Side Note) */}
        <aside className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8">
           <div className="flex items-center gap-3 mb-6 text-blue-400">
              <ShieldCheck size={20} />
              <h4 className="font-bold text-sm uppercase tracking-widest">Compliance Protocol</h4>
           </div>
           
           <div className="space-y-6 text-xs leading-relaxed text-slate-400 font-sans">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                 <p className="font-bold text-slate-200 mb-1">Identity vs Routing</p>
                 <p>Users and logins represent relational identity. Namespace codes (5xxxTNT) are allocated only when a durable container/workspace is required.</p>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                 <p className="font-bold text-slate-200 mb-1">Durable Allocation</p>
                 <p>Every household member in the "Home" environment inherits the Base Tenant routing unless a personal workspace is promovted to a project.</p>
              </div>

              <ul className="space-y-3 pl-4 list-disc marker:text-blue-500 text-[11px]">
                 <li>Ad hoc bands are forbidden.</li>
                 <li>Manual role assignment requires rank check.</li>
                 <li>All invitations must pass Spine registration.</li>
              </ul>
           </div>
        </aside>

      </div>
      
      {/* INVITE MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-2">Invite Member</h3>
            <p className="text-xs text-slate-500 mb-8 tracking-wide font-mono uppercase">Add to governed environment</p>
            
            <form onSubmit={handleInvite} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-600 uppercase tracking-widest pl-1">Display Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Mom"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-600 uppercase tracking-widest pl-1">Email Address (Identity)</label>
                <input 
                  type="email"
                  required
                  placeholder="identity@qios.system"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/40"
                >
                  Confirm Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
