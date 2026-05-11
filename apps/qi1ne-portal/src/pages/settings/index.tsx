import { Settings, User, Bell, Shield, Database, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { profile } = useAuth();

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <Settings className="w-6 h-6 text-gray-400" />
          </div>
          System Configuration
        </h1>
        <p className="text-gray-400 mt-1">Manage your operator profile, notifications, and security settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-2">
          {['Profile', 'Notifications', 'Security', 'Data & Storage', 'Advanced'].map((tab, i) => (
            <button 
              key={tab} 
              className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold transition-all ${i === 0 ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </aside>

        <div className="md:col-span-2 space-y-8">
          <section className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-8">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-purple-600/20 rounded-2xl text-purple-400">
                  <User className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white">Operator Profile</h3>
                  <p className="text-xs text-gray-500">Public identity and display settings.</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={profile?.full_name || ''}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avatar URL</label>
                  <input 
                    type="text" 
                    defaultValue={profile?.avatar_url || ''}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50"
                  />
               </div>
            </div>
          </section>

          <section className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
                  <Shield className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white">Auth Lineage</h3>
                  <p className="text-xs text-gray-500">Security and session persistence.</p>
               </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
               <div className="text-sm text-gray-300 font-medium">Two-Factor Authentication</div>
               <div className="w-10 h-5 bg-purple-600 rounded-full relative shadow-inner">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow" />
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
