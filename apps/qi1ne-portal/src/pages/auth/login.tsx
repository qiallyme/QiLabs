import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
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
              <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                {isLogin ? <LogIn className="text-white" /> : <UserPlus className="text-white" />}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {isLogin ? 'QiOS Portal' : 'Join QiOS'}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {isLogin ? 'Enter your credentials to continue' : 'Establish your canonical identity'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {/* Full Name (Signup only) */}
            {!isLogin && (
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
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <span className="text-red-400 text-xs font-semibold tracking-wide">{error}</span>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className={cn(
                "w-full py-4 rounded-2xl font-bold tracking-widest uppercase text-xs transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
              )}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : (isLogin ? 'Sign In' : 'Establish Root Account')}
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-10 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium tracking-tight"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
