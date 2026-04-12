import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, Save, ArrowLeft, Loader2, Camera, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('qione.profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Identity</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 text-center space-y-4">
            <div className="relative inline-block group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl overflow-hidden ring-4 ring-white/10 group-hover:ring-purple-500/50 transition-all">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-md text-white transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile?.full_name || 'System User'}</h2>
              <p className="text-gray-400 text-sm font-medium tracking-tight truncate px-4">{user?.email}</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
              <Shield size={12} className="text-purple-400" />
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest leading-none">
                {profile?.role === 'admin' ? 'Root Administrator' : 'Portal Operator'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 space-y-8">
            <div className="grid grid-cols-1 gap-6">
              {/* Email (Read Only) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Email (Canonical)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={user?.email}
                    className="w-full bg-white/[0.02] border border-white/[0.05] text-gray-500 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-medium placeholder:text-gray-700"
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Avatar Resource URL</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                    <Camera size={16} />
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-medium placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={cn(
                "p-4 rounded-2xl text-center text-xs font-bold tracking-tight",
                message.startsWith('Error') ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"
              )}>
                {message}
              </div>
            )}

            <div className="pt-4">
              <button
                disabled={loading}
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-bold tracking-widest uppercase text-xs transition-all shadow-xl shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {loading ? 'Saving...' : 'Sync Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
