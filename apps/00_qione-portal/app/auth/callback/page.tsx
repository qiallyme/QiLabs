'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                
                if (error) {
                    console.error('Auth callback error:', error);
                    setStatus('error');
                } else if (user) {
                    setStatus('success');
                    setTimeout(() => {
                        router.push('/');
                    }, 1000);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setStatus('error');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Signing you in...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-green-400">Signed in! Redirecting...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">✗</span>
                        </div>
                        <p className="text-red-400 mb-4">Authentication failed</p>
                        <a href="/login" className="text-blue-400 hover:text-blue-300">
                            Return to login
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
