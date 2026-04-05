import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/auth/login';
import Dashboard from './pages/dashboard/index';
import ProfilePage from './pages/profile/index';
import AdminUsersPage from './pages/admin/users';
import ModernLayout from './layouts/ModernLayout';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600 w-10 h-10" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  
  if (loading) return null;
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth */}
            <Route path="/login" element={<AuthPage />} />
            
            {/* Protected Routes inside Modern Layout */}
            <Route element={
                <AuthGuard>
                  <ModernLayout />
                </AuthGuard>
              }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Admin Only */}
              <Route path="/admin/users" element={
                <AdminGuard>
                  <AdminUsersPage />
                </AdminGuard>
              } />

              {/* Module Placeholders */}
              <Route path="/cases" element={<div className="text-white text-center p-20 font-bold uppercase tracking-widest bg-white/5 rounded-[32px] border border-white/10">Legal Domain Module Initializing...</div>} />
              <Route path="/vault" element={<div className="text-white text-center p-20 font-bold uppercase tracking-widest bg-white/5 rounded-[32px] border border-white/10">Artifact Vault Initializing...</div>} />
              <Route path="/knowledge" element={<div className="text-white text-center p-20 font-bold uppercase tracking-widest bg-white/5 rounded-[32px] border border-white/10">Research Domain Initializing...</div>} />
              <Route path="/tax" element={<div className="text-white text-center p-20 font-bold uppercase tracking-widest bg-white/5 rounded-[32px] border border-white/10">Financial Domain Initializing...</div>} />
              <Route path="/settings" element={<div className="text-white text-center p-20 font-bold uppercase tracking-widest bg-white/5 rounded-[32px] border border-white/10">Settings Module Initializing...</div>} />
            </Route>

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
