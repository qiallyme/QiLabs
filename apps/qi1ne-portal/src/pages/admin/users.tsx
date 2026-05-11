import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Loader2, ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('qione.profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const { error } = await supabase
        .from('qione.profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate('/dashboard')}
             className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
           >
             <ArrowLeft size={20} />
           </button>
           <div>
             <h1 className="text-4xl font-black text-white tracking-tight">System Operators</h1>
             <p className="text-gray-500 text-sm font-medium tracking-tight mt-1">Global user registry and role management</p>
           </div>
        </div>
        <div className="px-4 py-2 bg-purple-600/10 border border-purple-600/20 rounded-xl flex items-center gap-2">
           <Shield size={16} className="text-purple-400" />
           <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Root Authority</span>
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="animate-spin text-purple-600 w-10 h-10" />
             <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Synchronizing Registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 uppercase text-[10px] font-bold text-gray-500 tracking-[0.2em]">
                  <th className="px-8 py-6">Identity</th>
                  <th className="px-8 py-6">Authority Role</th>
                  <th className="px-8 py-6">Established At</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <UserAvatar 
                          url={u.avatar_url} 
                          name={u.full_name} 
                          className="bg-gradient-to-tr from-purple-600 to-blue-600 text-white"
                        />
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{u.full_name || 'Incognito Operator'}</div>
                          <div className="text-[10px] text-gray-500 font-medium tracking-tight">{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleRole(u.id, u.role)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                          u.role === 'admin' 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-lg shadow-purple-500/10" 
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                         {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-gray-600 hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
