import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, Loader2, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AuthMode = 'login' | 'signup' | 'magic-link';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const navigate = useNavigate();

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        setError("Check your email for a confirmation link!");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMagicLinkSent(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modeConfig = {
    'login': { title: 'QiOS Portal', subtitle: 'Enter your credentials to continue', icon: LogIn },
    'signup': { title: 'Join QiOS', subtitle: 'Establish your canonical identity', icon: UserPlus },
    'magic-link': { title: 'Magic Link', subtitle: 'Passwordless authentication via email', icon: Wand2 },
  };

  const { title, subtitle, icon: ModeIcon } = modeConfig[authMode];

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-10 space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                <ModeIcon className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-gray-400 text-sm font-medium">{subtitle}</p>
          </div>

          {/* Auth Mode Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1 mb-8">
            <button
              onClick={() => { setAuthMode('login'); setError(null); setMagicLinkSent(false); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[2px] transition-all",
                authMode === 'login' 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/20" 
                  : "text-gray-500 hover:text-white"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('magic-link'); setError(null); setMagicLinkSent(false); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[2px] transition-all",
                authMode === 'magic-link' 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/20" 
                  : "text-gray-500 hover:text-white"
              )}
            >
              Magic Link
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setError(null); setMagicLinkSent(false); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[2px] transition-all",
                authMode === 'signup' 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/20" 
                  : "text-gray-500 hover:text-white"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Magic Link Form */}
          {authMode === 'magic-link' && (
            <form onSubmit={handleMagicLink} className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. user@qially.me"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all placeholder:text-gray-600 font-medium"
                  />
                </div>
              </div>

              {magicLinkSent && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1">
                  <span className="text-emerald-400 text-xs font-bold tracking-tight block">Magic link sent!</span>
                  <span className="text-emerald-400/70 text-[10px] font-medium block">Check your email inbox for the login link</span>
                </div>
              )}

              {error && !magicLinkSent && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <span className="text-red-400 text-xs font-semibold tracking-wide">{error}</span>
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className={cn(
                  "w-full py-4 rounded-2xl font-bold tracking-widest uppercase text-xs transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3",
                  "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
                )}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          )}

          {/* Password Auth Form (Login / Signup) */}
          {(authMode === 'login' || authMode === 'signup') && (
            <form onSubmit={handlePasswordAuth} className="space-y-6">
              {/* Full Name (Signup only) */}
              {authMode === 'signup' && (
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                      <Sparkles size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all placeholder:text-gray-600 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Email</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all placeholder:text-gray-600 font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Password</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all placeholder:text-gray-600 font-medium"
                  />
                </div>
              </div>

              {error && (
                <div className={cn(
                  "p-3 rounded-xl text-center",
                  error.includes("Check your email") 
                    ? "bg-emerald-500/10 border border-emerald-500/20" 
                    : "bg-red-500/10 border border-red-500/20"
                )}>
                  <span className={cn(
                    "text-xs font-semibold tracking-wide",
                    error.includes("Check your email") ? "text-emerald-400" : "text-red-400"
                  )}>{error}</span>
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className={cn(
                  "w-full py-4 rounded-2xl font-bold tracking-widest uppercase text-xs transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3",
                  "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
                )}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                {loading ? 'Authenticating...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
