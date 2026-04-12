import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { supabase } from '../lib/supabase/supabase'

interface AuthUIProps {
  supabaseUrl: string
  supabaseAnonKey: string
}

export function AuthUI({ }: AuthUIProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'magic_link' | 'sign_in'>('magic_link')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'magic_link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })

        if (!error) {
          setMessage('Check your email for the login link!')
        } else {
          setMessage(error.message || 'Failed to send magic link')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (!error) {
           // Success! The AuthGuard in App.tsx will pick up the session change via onAuthStateChange
        } else {
          setMessage(error.message || 'Failed to sign in')
        }
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            QiOne Portal
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your workspace
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {mode === 'sign_in' && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {message && (
              <div className="text-sm text-center text-blue-600 bg-blue-50 p-3 rounded-lg">
                {message}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'magic_link' ? 'Send Magic Link' : 'Sign In'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'magic_link' ? 'sign_in' : 'magic_link')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {mode === 'magic_link' 
                ? 'Sign in with password instead' 
                : 'Sign in with magic link instead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
