import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import LedgerView from './components/LedgerView';
import ActivityFeed from './components/ActivityFeed';
import BillHistory from './components/BillHistory';
import BillEntry from './components/BillEntry';
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  History,
  Home,
  ArrowLeft,
  Plus
} from 'lucide-react';

interface HouseholdProfile {
  id: string;
  username: string;
}

export default function QiHomeDashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<HouseholdProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bills'>('dashboard');

  useEffect(() => {
    if (user) fetchProfiles();
  }, [user]);

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase.from('qione.profiles').select('id, username');
      if (error) throw error;
      setProfiles((data as unknown as HouseholdProfile[]) || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2.5 py-0.5 bg-blue-600/10 border border-blue-600/20 rounded-full">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[2px]">QiHome Module</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Household <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Overview</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-tight">Real-time status of your shared expenses and ledger</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${
              activeTab === 'dashboard' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/20' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${
              activeTab === 'bills' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/20' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Receipt size={16} />
            Log Bill
          </button>
        </div>
      </div>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Global Ledger</h3>
                </div>
                <LedgerView />
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Bill History</h3>
                </div>
                <BillHistory />
              </section>
            </div>
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Recent Activity</h3>
                </div>
                <ActivityFeed />
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Bill Entry View */}
      {activeTab === 'bills' && (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <BillEntry profiles={profiles} />
        </div>
      )}
    </div>
  );
}
