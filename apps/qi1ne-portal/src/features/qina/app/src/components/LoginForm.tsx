import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, ArrowRight, Loader, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(false);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (signInError) throw signInError;
      
      setMessage('Secure magic link dispatched to your inbox.');
    } catch (err: any) {
      setError(true);
      setMessage(err.error_description || err.message || 'Authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="glitch-header" style={{ fontSize: '2rem' }}>Agent <span className="accent-text">Access</span></h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Provide your organizational email to acquire a secure session token via magic link.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail 
              size={18} 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} 
            />
            <input
              className="glass-input"
              type="email"
              placeholder="agent@qilabs.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="glass-button" disabled={loading || !email}>
            {loading ? <Loader className="animate-spin" size={18} /> : 'Acquire Link'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {message && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            borderRadius: '12px',
            backgroundColor: error ? 'var(--danger-accent)' : 'var(--success-accent)',
            color: '#000',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold'
          }}>
            {error ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
