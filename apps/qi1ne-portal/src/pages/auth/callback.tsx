import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Auth callback handler for magic link / OTP redirects.
 * Supabase appends the token to the URL hash on redirect.
 * This component extracts and exchanges it for a session.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase JS auto-detects the hash fragment and exchanges it
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          setStatus('success');
          setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
        } else {
          // No session yet — might be processing
          // Give it a moment then try again
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              setStatus('success');
              setTimeout(() => navigate('/dashboard', { replace: true }), 500);
            } else {
              setStatus('error');
              setError('Authentication session not found. Please try again.');
            }
          }, 2000);
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-12 text-center max-w-sm w-full space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="animate-spin text-purple-500 w-12 h-12 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Authenticating...</h2>
              <p className="text-gray-500 text-sm">Verifying your magic link</p>
            </div>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="text-emerald-400 w-12 h-12 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Welcome back!</h2>
              <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="text-red-400 w-12 h-12 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
              <p className="text-red-400/80 text-sm">{error}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white hover:bg-white/10 transition-all"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
